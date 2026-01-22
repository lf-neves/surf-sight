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
    connectionString = connectionString.replace(/[?&]uselibpqcompat=[^&]*/g, '');
    
    // Clean up any double ? or trailing & or ?&
    connectionString = connectionString.replace(/\?&+/g, '?');
    connectionString = connectionString.replace(/[?&]$/, '');
    if (connectionString.includes('?') && !connectionString.match(/\?[^=]+=/)) {
      // Remove trailing ? if no params remain
      connectionString = connectionString.replace(/\?$/, '');
    }
    
    pool = new Pool({
      connectionString,
      // Connection pool settings optimized for Lambda
      max: 1, // Lambda typically uses 1 connection per instance
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      // Explicitly configure SSL for RDS
      // RDS uses self-signed certificates, so we need to disable strict verification
      // This ensures SSL encryption is used but certificate validation is skipped
      ssl: {
        rejectUnauthorized: false, // Accept RDS self-signed certificates
      },
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
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

// Export as a Proxy to maintain backward compatibility
// The proxy intercepts property access and initializes on first use
export const drizzleDb = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const db = getDrizzleDb();
    const value = (db as any)[prop];
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
