-- STORM CHASER SUPREME - DATABASE SCHEMA
-- Platform: Supabase (PostgreSQL)
-- Cost: $0/month (Free tier: 500MB)

-- Enable PostGIS extension for geographic data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STORMS TABLE
-- ============================================
CREATE TABLE storms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL, -- 'tornado', 'hail', 'severe_thunderstorm', 'hurricane'
    severity INTEGER CHECK (severity BETWEEN 1 AND 10) NOT NULL,
    location GEOGRAPHY(POINT) NOT NULL,
    affected_area GEOGRAPHY(POLYGON),
    city VARCHAR(255),
    state VARCHAR(2),
    county VARCHAR(255),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    estimated_homes INTEGER DEFAULT 0,
    estimated_damage_usd INTEGER DEFAULT 0,
    wind_speed_mph INTEGER,
    hail_size_inches DECIMAL(3,2),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'monitoring', 'ended'
    raw_data JSONB, -- Store full NOAA response
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_storms_location ON storms USING GIST(location);
CREATE INDEX idx_storms_start_time ON storms(start_time DESC);
CREATE INDEX idx_storms_severity ON storms(severity DESC);
CREATE INDEX idx_storms_status ON storms(status);
CREATE INDEX idx_storms_state ON storms(state);

-- ============================================
-- PROPERTIES/LEADS TABLE
-- ============================================
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    storm_id UUID REFERENCES storms(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT) NOT NULL,
    city VARCHAR(255),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    county VARCHAR(255),

    -- Property details
    owner_name VARCHAR(255),
    owner_mailing_address TEXT,
    estimated_value INTEGER,
    year_built INTEGER,
    roof_type VARCHAR(100),
    square_footage INTEGER,

    -- Scoring
    damage_score INTEGER CHECK (damage_score BETWEEN 0 AND 100),
    lead_quality_score INTEGER CHECK (lead_quality_score BETWEEN 0 AND 100),

    -- Lead management
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'claimed', 'contacted', 'converted', 'lost'
    claimed_by UUID REFERENCES contractors(id),
    claimed_at TIMESTAMP,
    contacted_at TIMESTAMP,
    converted_at TIMESTAMP,
    conversion_value_usd INTEGER,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_location ON leads USING GIST(location);
CREATE INDEX idx_leads_storm ON leads(storm_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_claimed_by ON leads(claimed_by);
CREATE INDEX idx_leads_damage_score ON leads(damage_score DESC);
CREATE INDEX idx_leads_state ON leads(state);

-- ============================================
-- CONTRACTORS TABLE
-- ============================================
CREATE TABLE contractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Company info
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    website VARCHAR(255),

    -- Service areas (array of state codes)
    service_states TEXT[] DEFAULT '{}',
    service_radius_miles INTEGER DEFAULT 50,

    -- Subscription
    subscription_tier VARCHAR(50) DEFAULT 'basic', -- 'basic', 'pro', 'enterprise'
    subscription_status VARCHAR(50) DEFAULT 'active', -- 'active', 'past_due', 'canceled', 'trialing'

    -- Stripe integration
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255),

    -- Notification preferences
    email_alerts BOOLEAN DEFAULT true,
    telegram_alerts BOOLEAN DEFAULT false,
    telegram_chat_id VARCHAR(255),
    discord_webhook_url TEXT,
    sms_alerts BOOLEAN DEFAULT false,
    sms_phone VARCHAR(50),

    -- Stats
    total_leads_claimed INTEGER DEFAULT 0,
    total_leads_converted INTEGER DEFAULT 0,
    total_revenue_generated_usd INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_contractors_email ON contractors(email);
CREATE INDEX idx_contractors_tier ON contractors(subscription_tier);
CREATE INDEX idx_contractors_status ON contractors(subscription_status);
CREATE INDEX idx_contractors_service_states ON contractors USING GIN(service_states);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,

    -- Subscription details
    tier VARCHAR(50) NOT NULL, -- 'basic', 'pro', 'enterprise'
    price_monthly_usd INTEGER NOT NULL,

    -- Stripe
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_price_id VARCHAR(255),

    -- Status
    status VARCHAR(50) DEFAULT 'active',
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_contractor ON subscriptions(contractor_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);

-- ============================================
-- ALERTS TABLE (tracking notifications sent)
-- ============================================
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
    storm_id UUID REFERENCES storms(id) ON DELETE CASCADE,

    -- Alert details
    channel VARCHAR(50) NOT NULL, -- 'email', 'sms', 'telegram', 'discord'
    message_content TEXT,

    -- Tracking
    sent_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,

    -- Metadata
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_alerts_contractor ON alerts(contractor_id);
CREATE INDEX idx_alerts_storm ON alerts(storm_id);
CREATE INDEX idx_alerts_sent_at ON alerts(sent_at DESC);
CREATE INDEX idx_alerts_channel ON alerts(channel);

-- ============================================
-- PAYMENTS TABLE (revenue tracking)
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,

    -- Payment details
    amount_usd INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,

    -- Stripe
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_invoice_id VARCHAR(255),

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'succeeded', 'failed', 'refunded'

    -- Metadata
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_contractor ON payments(contractor_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_paid_at ON payments(paid_at DESC);

-- ============================================
-- ANALYTICS TABLE (aggregate stats)
-- ============================================
CREATE TABLE analytics_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,

    -- System metrics
    total_storms INTEGER DEFAULT 0,
    total_leads_generated INTEGER DEFAULT 0,
    total_leads_claimed INTEGER DEFAULT 0,
    total_leads_converted INTEGER DEFAULT 0,

    -- Revenue
    total_revenue_usd INTEGER DEFAULT 0,
    new_subscribers INTEGER DEFAULT 0,
    churned_subscribers INTEGER DEFAULT 0,

    -- Contractor metrics
    active_contractors INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(date)
);

-- Index
CREATE INDEX idx_analytics_date ON analytics_daily(date DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_storms_updated_at BEFORE UPDATE ON storms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON contractors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update contractor stats when lead is claimed
CREATE OR REPLACE FUNCTION update_contractor_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.claimed_by IS NOT NULL AND (OLD.claimed_by IS NULL OR OLD.claimed_by != NEW.claimed_by) THEN
        UPDATE contractors
        SET total_leads_claimed = total_leads_claimed + 1
        WHERE id = NEW.claimed_by;
    END IF;

    IF NEW.status = 'converted' AND OLD.status != 'converted' THEN
        UPDATE contractors
        SET
            total_leads_converted = total_leads_converted + 1,
            total_revenue_generated_usd = total_revenue_generated_usd + COALESCE(NEW.conversion_value_usd, 0)
        WHERE id = NEW.claimed_by;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contractor_stats_on_lead_change
    AFTER UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_contractor_stats();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Contractors can only see their own data
CREATE POLICY "Contractors can view own data" ON contractors
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Contractors can update own data" ON contractors
    FOR UPDATE USING (auth.uid() = id);

-- Contractors can only see leads they've claimed or available leads
CREATE POLICY "Contractors can view available or claimed leads" ON leads
    FOR SELECT USING (
        status = 'available' OR
        claimed_by = auth.uid()
    );

CREATE POLICY "Contractors can claim available leads" ON leads
    FOR UPDATE USING (
        status = 'available' OR
        claimed_by = auth.uid()
    );

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Insert sample contractor
INSERT INTO contractors (
    company_name,
    contact_name,
    email,
    phone,
    service_states,
    subscription_tier,
    subscription_status
) VALUES (
    'Elite Roofing Co',
    'John Smith',
    'john@eliteroofing.com',
    '+1-555-0100',
    ARRAY['NC', 'SC', 'VA'],
    'pro',
    'active'
);

-- ============================================
-- VIEWS (for easy querying)
-- ============================================

-- Active storms with lead counts
CREATE VIEW active_storms_summary AS
SELECT
    s.*,
    COUNT(l.id) as total_leads,
    COUNT(l.id) FILTER (WHERE l.status = 'available') as available_leads,
    COUNT(l.id) FILTER (WHERE l.status = 'claimed') as claimed_leads,
    AVG(l.damage_score) as avg_damage_score
FROM storms s
LEFT JOIN leads l ON s.id = l.storm_id
WHERE s.status = 'active'
GROUP BY s.id;

-- Contractor performance dashboard
CREATE VIEW contractor_performance AS
SELECT
    c.id,
    c.company_name,
    c.subscription_tier,
    c.total_leads_claimed,
    c.total_leads_converted,
    CASE
        WHEN c.total_leads_claimed > 0
        THEN ROUND((c.total_leads_converted::DECIMAL / c.total_leads_claimed * 100), 2)
        ELSE 0
    END as conversion_rate,
    c.total_revenue_generated_usd,
    COUNT(DISTINCT l.storm_id) as storms_worked,
    MAX(l.claimed_at) as last_claim_date
FROM contractors c
LEFT JOIN leads l ON c.id = l.claimed_by
GROUP BY c.id;

-- ============================================
-- COMMENTS (documentation)
-- ============================================

COMMENT ON TABLE storms IS 'Active and historical storm events from NOAA';
COMMENT ON TABLE leads IS 'Property leads generated from storm damage zones';
COMMENT ON TABLE contractors IS 'Registered contractors subscribing to the platform';
COMMENT ON TABLE subscriptions IS 'Contractor subscription details and billing';
COMMENT ON TABLE alerts IS 'Notification tracking for all channels';
COMMENT ON TABLE payments IS 'Payment transaction history';
COMMENT ON TABLE analytics_daily IS 'Daily aggregate metrics for reporting';
