-- Migration 006: Domain ownership verification

ALTER TABLE providers ADD COLUMN IF NOT EXISTS domain_verification_code VARCHAR(255);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT false;
