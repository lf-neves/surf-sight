export const env = {
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  typesense: {
    nodes: [
      {
        host: process.env.TYPESENSE_HOST || 'localhost',
        port: parseInt(process.env.TYPESENSE_PORT || '8108', 10),
        protocol: process.env.TYPESENSE_PROTOCOL || 'http',
      },
    ],
    apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
    connectionTimeoutSeconds: parseInt(process.env.TYPESENSE_CONNECTION_TIMEOUT || '5', 10),
  },
};

// Validate required environment variables
if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is required.');
}

if (!env.jwtSecret && env.nodeEnv === 'production') {
  throw new Error('JWT_SECRET is required in production.');
}

