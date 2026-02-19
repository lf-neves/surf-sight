import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Connection pool for Lambda (reuse connections)
let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function createDrizzleClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Reuse existing pool if available (important for Lambda)
  if (!pool) {
    let connectionString = process.env.DATABASE_URL || '';

    // Remove SSL-related query parameters from connection string
    // We'll handle SSL configuration via the ssl object to have full control
    connectionString = connectionString.replace(/[?&]sslmode=[^&]*/g, '');
    connectionString = connectionString.replace(
      /[?&]uselibpqcompat=[^&]*/g,
      ''
    );

    // Clean up any double ? or trailing & or ?&
    connectionString = connectionString.replace(/\?&+/g, '?');
    connectionString = connectionString.replace(/[?&]$/, '');
    if (connectionString.includes('?') && !connectionString.match(/\?[^=]+=/)) {
      // Remove trailing ? if no params remain
      connectionString = connectionString.replace(/\?$/, '');
    }

    // Longer timeout when not in Lambda (e.g. serverless-offline, seed, migrations + remote RDS)
    const defaultTimeout = process.env.AWS_LAMBDA_FUNCTION_NAME ? 2000 : 30000;
    const envTimeout = process.env.DATABASE_CONNECTION_TIMEOUT_MS
      ? Math.min(
          60000,
          Math.max(
            1000,
            parseInt(process.env.DATABASE_CONNECTION_TIMEOUT_MS, 10) ||
              defaultTimeout
          )
        )
      : defaultTimeout;
    const connectionTimeoutMillis = envTimeout;
    // Local Postgres (localhost) typically doesn't use SSL; RDS and other remote DBs do
    const isLocalHost =
      /@localhost(\/|:|\?|$)/i.test(connectionString) ||
      /@127\.0\.0\.1(\/|:|\?|$)/.test(connectionString);
    const ssl = isLocalHost ? false : { rejectUnauthorized: false }; // RDS self-signed certs

    pool = new Pool({
      connectionString,
      // Connection pool settings optimized for Lambda
      max: 1, // Lambda typically uses 1 connection per instance
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis,
      // Keep TCP connection alive so remote DBs (RDS) don't close idle connections
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      ssl,
    });

    // On pool error (e.g. connection dropped), clear refs so next use creates a new pool
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      const p = pool;
      pool = null;
      db = null;
      _drizzleDb = null;
      if (p) p.end().catch(() => {});
    });
  }

  // Reuse existing db instance if available
  if (!db) {
    db = drizzle(pool, { schema });
  }

  return db;
}

// Lazy initialization - only create client when accessed
// This ensures DATABASE_URL is available (important for Lambda)
let _drizzleDb: ReturnType<typeof drizzle> | null = null;

function getDrizzleDb() {
  if (!_drizzleDb) {
    _drizzleDb = createDrizzleClient();
  }
  return _drizzleDb;
}

/**
 * Resets the connection pool (ends it and clears cached refs).
 * Next DB access will create a new pool. Use after connection errors to recover.
 */
export async function resetDatabasePool(): Promise<void> {
  if (pool) {
    try {
      await pool.end();
    } catch (e) {
      console.error('[database] Error ending pool:', e);
    }
    pool = null;
  }
  db = null;
  _drizzleDb = null;
}

// Export as a Proxy to maintain backward compatibility
// The proxy intercepts property access and initializes on first use
export const drizzleDb = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const db = getDrizzleDb();
    const value = (db as Record<string | symbol, unknown>)[prop];
    // If it's a function, bind it to the db instance
    if (typeof value === 'function') {
      return value.bind(db);
    }
    return value;
  },
  // Support for 'in' operator
  has(_target, prop) {
    const db = getDrizzleDb();
    return prop in db;
  },
  // Support for Object.keys() and other introspection
  ownKeys(_target) {
    const db = getDrizzleDb();
    return Reflect.ownKeys(db);
  },
  getOwnPropertyDescriptor(_target, prop) {
    const db = getDrizzleDb();
    return Reflect.getOwnPropertyDescriptor(db, prop);
  },
});

// Export schema for use in services
export * from './schema';
