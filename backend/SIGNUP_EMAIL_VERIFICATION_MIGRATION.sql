-- Signup email verification state for cross-device magic-link syncing
-- Run this in the Supabase SQL Editor after your base schema.

CREATE TABLE IF NOT EXISTS signup_email_verifications (
    email VARCHAR(255) PRIMARY KEY,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired')),
    sent_at TIMESTAMP DEFAULT now(),
    expires_at TIMESTAMP NOT NULL,
    verification_token TEXT DEFAULT '',
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signup_email_verifications_status
    ON signup_email_verifications(status);

CREATE INDEX IF NOT EXISTS idx_signup_email_verifications_expires_at
    ON signup_email_verifications(expires_at);

