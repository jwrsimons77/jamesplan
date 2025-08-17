import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn('DATABASE_URL not set. Be sure Railway injects it or set it locally.');
}

export const pool = new Pool({
  connectionString,
  // Railway Postgres often requires SSL in some regions. This config works both locally and on Railway.
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});
