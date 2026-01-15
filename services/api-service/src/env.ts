export const env = {
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
};

// Validate required environment variables
if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is required.');
}

if (!env.jwtSecret && env.nodeEnv === 'production') {
  throw new Error('JWT_SECRET is required in production.');
}
