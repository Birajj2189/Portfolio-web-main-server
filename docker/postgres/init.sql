-- Creates the auth service database if it doesn't exist.
-- Runs automatically when the Postgres container initializes for the first time.
SELECT 'CREATE DATABASE portfolio_auth'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'portfolio_auth')\gexec
