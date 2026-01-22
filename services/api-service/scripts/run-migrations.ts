#!/usr/bin/env tsx

/**
 * Run database migrations before deployment
 * Fetches DATABASE_URL from Parameter Store and runs Drizzle migrations
 */

import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { execSync } from 'child_process';
import * as path from 'path';

const region = process.env.AWS_REGION || 'us-east-2';
const profile = process.env.AWS_PROFILE || 'surf-sight';

async function getDatabaseUrl(): Promise<string> {
  const ssmClient = new SSMClient({
    region,
    ...(profile && {
      credentials: require('@aws-sdk/credential-providers').fromIni({ profile }),
    }),
  });

  try {
    // Try to get the complete DATABASE_URL first
    const command = new GetParameterCommand({
      Name: '/surf-sight/db/url',
      WithDecryption: true,
    });

    const response = await ssmClient.send(command);
    if (response.Parameter?.Value) {
      return response.Parameter.Value;
    }
  } catch (error: any) {
    if (error.name === 'ParameterNotFound') {
      console.log('⚠️  /surf-sight/db/url not found, trying individual parameters...');
    } else {
      throw error;
    }
  }

  // Fallback: construct from individual parameters
  console.log('📋 Constructing DATABASE_URL from individual parameters...');
  const params = [
    '/surf-sight/db/host',
    '/surf-sight/db/port',
    '/surf-sight/db/name',
    '/surf-sight/db/user',
    '/surf-sight/db/password',
  ];

  const values: Record<string, string> = {};

  for (const paramName of params) {
    try {
      const command = new GetParameterCommand({
        Name: paramName,
        WithDecryption: true,
      });
      const response = await ssmClient.send(command);
      if (response.Parameter?.Value) {
        const key = paramName.split('/').pop() || '';
        values[key] = response.Parameter.Value;
      }
    } catch (error: any) {
      if (error.name === 'ParameterNotFound') {
        throw new Error(`Missing required parameter: ${paramName}`);
      }
      throw error;
    }
  }

  const dbUrl = `postgresql://${values.user}:${values.password}@${values.host}:${values.port}/${values.name}?schema=public`;
  return dbUrl;
}

async function runMigrations() {
  console.log('🚀 Running database migrations...');
  console.log(`   Region: ${region}`);
  console.log(`   Profile: ${profile}`);
  console.log('');

  try {
    // Get DATABASE_URL from Parameter Store
    console.log('📥 Fetching DATABASE_URL from Parameter Store...');
    const databaseUrl = await getDatabaseUrl();
    console.log('✅ DATABASE_URL retrieved successfully');
    console.log('');

    // Set DATABASE_URL as environment variable
    process.env.DATABASE_URL = databaseUrl;

    // Change to database package directory
    const databasePackagePath = path.resolve(__dirname, '../../../libs/database');
    console.log(`📦 Running migrations from: ${databasePackagePath}`);
    console.log('');

    // Run drizzle-kit push
    console.log('🔄 Executing: drizzle-kit push');
    execSync('pnpm db:push', {
      cwd: databasePackagePath,
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
    });

    console.log('');
    console.log('✅ Database migrations completed successfully!');
  } catch (error: any) {
    console.error('');
    console.error('❌ Migration failed:');
    if (error.message) {
      console.error(`   ${error.message}`);
    }
    if (error.stderr) {
      console.error(`   ${error.stderr.toString()}`);
    }
    process.exit(1);
  }
}

// Run migrations
runMigrations().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
