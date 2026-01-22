import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Clean up and configure DATABASE_URL for drizzle-kit
// We need SSL enabled but without certificate verification for RDS
let databaseUrl = process.env.DATABASE_URL;
// Remove existing sslmode parameters
databaseUrl = databaseUrl.replace(/[?&]sslmode=[^&]*/g, '');
databaseUrl = databaseUrl.replace(/[?&]uselibpqcompat=[^&]*/g, '');
databaseUrl = databaseUrl.replace(/\?&+/g, '?');
databaseUrl = databaseUrl.replace(/[?&]$/, '');

// Add sslmode=require to ensure SSL is used
// We'll disable certificate verification via NODE_TLS_REJECT_UNAUTHORIZED
if (databaseUrl.includes('?')) {
  databaseUrl += '&sslmode=require';
} else {
  databaseUrl += '?sslmode=require';
}

// Set NODE_TLS_REJECT_UNAUTHORIZED=0 to accept RDS self-signed certificates
// This allows SSL encryption while skipping certificate verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export default defineConfig({
  schema: './src/drizzle/schema/index.ts',
  out: './src/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
});
