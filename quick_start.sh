#!/bin/bash
# STORM CHASER SUPREME - Quick Start
# 100% Free Infrastructure, Infinite Margins

set -e

echo "🌪️  STORM CHASER SUPREME - Quick Start"
echo "========================================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Install dependencies (all free)
echo ""
echo "📦 Installing dependencies..."
pip3 install -q requests python-dotenv

echo "✅ Dependencies installed"

# Run storm monitor
echo ""
echo "🌪️  Running storm monitor (NOAA API - FREE)..."
echo ""
python3 backend/storm_monitor.py

# Check results
if [ -f /tmp/storm_chaser_active_storms.json ]; then
    echo ""
    echo "📊 RESULTS:"
    echo "==========="

    STORM_COUNT=$(cat /tmp/storm_chaser_active_storms.json | grep -o '"total_storms": [0-9]*' | grep -o '[0-9]*')

    echo "Total severe storms detected: $STORM_COUNT"
    echo ""

    if [ "$STORM_COUNT" -gt 0 ]; then
        echo "🚨 ACTIVE SEVERE WEATHER DETECTED!"
        echo ""
        echo "Preview:"
        cat /tmp/storm_chaser_active_storms.json | head -30
        echo ""
        echo "Full data saved to: /tmp/storm_chaser_active_storms.json"
    else
        echo "✅ No severe weather currently active"
        echo "   (This is good news for everyone except contractors waiting for leads!)"
    fi
else
    echo "⚠️  No storm data file created"
fi

echo ""
echo "========================================="
echo "🎯 NEXT STEPS:"
echo ""
echo "1. Set up Supabase database (FREE):"
echo "   → https://supabase.com/dashboard/new"
echo "   → Run: database/schema.sql"
echo ""
echo "2. Deploy to GitHub Actions (FREE):"
echo "   → Push this repo to GitHub"
echo "   → Actions will run every 5 minutes automatically"
echo ""
echo "3. Set up contractor dashboard (Vercel - FREE):"
echo "   → Deploy frontend to Vercel"
echo "   → Connect to Supabase"
echo ""
echo "4. Configure Stripe payments:"
echo "   → Create account at stripe.com"
echo "   → Add webhook for subscriptions"
echo ""
echo "COST: $0/month until 100+ contractors"
echo "REVENUE: $497-4,995/month per contractor"
echo "MARGIN: Infinite 🚀"
echo ""
