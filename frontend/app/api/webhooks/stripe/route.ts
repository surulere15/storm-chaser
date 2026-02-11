import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error handling webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id

  if (!userId) {
    console.error('No user ID in checkout session')
    return
  }

  // Update user record with Stripe customer ID
  await supabase
    .from('contractors')
    .update({
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      subscription_status: 'trialing', // 14-day trial
    })
    .eq('id', userId)

  console.log(`Checkout completed for user ${userId}`)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id

  if (!userId) {
    console.error('No user ID in subscription metadata')
    return
  }

  // Determine tier from price ID
  const priceId = subscription.items.data[0].price.id
  const tier = determineTier(priceId)

  await supabase
    .from('contractors')
    .update({
      subscription_tier: tier,
      subscription_status: subscription.status,
      stripe_subscription_id: subscription.id,
    })
    .eq('id', userId)

  // Create subscription record
  await supabase.from('subscriptions').insert({
    contractor_id: userId,
    tier: tier,
    price_monthly_usd: subscription.items.data[0].price.unit_amount! / 100,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  })

  console.log(`Subscription created for user ${userId}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id

  if (!userId) return

  await supabase
    .from('contractors')
    .update({
      subscription_status: subscription.status,
    })
    .eq('id', userId)

  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  console.log(`Subscription updated for user ${userId}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id

  if (!userId) return

  await supabase
    .from('contractors')
    .update({
      subscription_status: 'canceled',
    })
    .eq('id', userId)

  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  console.log(`Subscription canceled for user ${userId}`)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Log successful payment
  if (invoice.subscription) {
    await supabase.from('payments').insert({
      contractor_id: invoice.metadata?.user_id,
      amount_usd: invoice.amount_paid / 100,
      stripe_invoice_id: invoice.id,
      status: 'succeeded',
      paid_at: new Date().toISOString(),
    })
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Handle failed payment - could send notification to user
  console.log(`Payment failed for invoice ${invoice.id}`)
}

function determineTier(priceId: string): string {
  // Map price IDs to tiers
  // Replace with your actual Stripe price IDs
  const tierMap: Record<string, string> = {
    'price_basic_monthly': 'basic',
    'price_pro_monthly': 'pro',
    'price_enterprise_monthly': 'enterprise',
  }

  return tierMap[priceId] || 'basic'
}

// Disable body parsing for webhook route
export const config = {
  api: {
    bodyParser: false,
  },
}
