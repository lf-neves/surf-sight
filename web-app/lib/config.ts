/**
 * Application configuration
 * Uses environment variables with fallback defaults
 */

export const config = {
  apiUrl: process.env.GRAPHQL_API_URL || 'http://localhost:4000/graphql',
} as const;
