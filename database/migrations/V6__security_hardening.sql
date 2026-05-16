-- V6__security_hardening.sql

ALTER TABLE users 
ADD COLUMN failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN mfa_secret TEXT,
ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN refresh_token TEXT,
ADD COLUMN token_version INTEGER DEFAULT 1;

-- Add a table for AI service secrets if needed, or just a config column
ALTER TABLE products ADD COLUMN internal_secret_hash TEXT;
