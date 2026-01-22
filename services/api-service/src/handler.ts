import { ApolloServer } from '@apollo/server';
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from '@as-integrations/aws-lambda';
import { logger, HttpStatusCode } from '@surf-sight/core';
import { schema } from './graphql/schema';
import { createContext, getUserFromRequest } from './context';
import { UserFacingError } from './errors';

// Create Apollo Server instance
const server = new ApolloServer({
  schema,
  formatError: (formattedError: any) => {
    const originalError = formattedError.originalError;

    // If it's a UserFacingError, return it as-is with the flag
    if (UserFacingError.isUserFacingError(originalError)) {
      return {
        message: originalError.message,
        extensions: {
          code: originalError.code,
          statusCode: originalError.statusCode,
          isUserFacing: true,
        },
      };
    }

    // For non-user-facing errors, return them as-is (raw errors)
    // The Next.js middleware/client will convert them to user-facing errors
    logger.error('GraphQL Error:', {
      message: formattedError.message,
      originalError: originalError?.message,
      stack: originalError?.stack,
      cause: originalError?.cause,
      code: originalError?.code,
      detail: originalError?.detail,
      extensions: formattedError.extensions,
    });

    return {
      message: formattedError.message,
      extensions: {
        code: formattedError.extensions?.code || 'INTERNAL_ERROR',
        statusCode:
          formattedError.extensions?.statusCode ||
          HttpStatusCode.INTERNAL_SERVER_ERROR,
        isUserFacing: false,
        ...(process.env.NODE_ENV === 'development' && {
          stack: formattedError.extensions?.stack,
        }),
      },
    };
  },
});

// Create request handler for API Gateway HTTP API (v2)
const requestHandler = handlers.createAPIGatewayProxyEventV2RequestHandler();

// Initialize environment variables from SSM if needed (before handler creation)
// This ensures DATABASE_URL is available when the Drizzle client initializes
let envInitialized = false;
let envInitializationPromise: Promise<void> | null = null;

async function ensureEnvInitialized() {
  // If already initialized, return immediately
  if (envInitialized && process.env.DATABASE_URL) {
    return;
  }

  // If initialization is in progress, wait for it
  if (envInitializationPromise) {
    await envInitializationPromise;
    return;
  }

  // Start initialization
  envInitializationPromise = (async () => {
    // Check if DATABASE_URL is missing or empty
    const currentDbUrl = process.env.DATABASE_URL || '';
    logger.info(`[INIT] Checking DATABASE_URL: ${currentDbUrl ? 'exists' : 'missing/empty'}`);
    
    if (!currentDbUrl || currentDbUrl.trim() === '') {
      try {
        logger.info('[INIT] Fetching DATABASE_URL from SSM Parameter Store...');
        const { getEnvAsync } = await import('./env');
        const env = await getEnvAsync(); // This will fetch from SSM and set process.env.DATABASE_URL
        
        if (process.env.DATABASE_URL) {
          logger.info('[INIT] ✅ Successfully initialized DATABASE_URL from SSM');
        } else {
          logger.error('[INIT] ❌ getEnvAsync completed but DATABASE_URL still not set');
          throw new Error('Failed to set DATABASE_URL from SSM');
        }
      } catch (error: any) {
        logger.error('[INIT] ❌ Failed to initialize environment from SSM:', {
          error: error.message,
          stack: error.stack,
        });
        throw error; // Re-throw so we know initialization failed
      }
    } else {
      logger.info('[INIT] ✅ DATABASE_URL already available in environment');
    }
    envInitialized = true;
  })();

  await envInitializationPromise;
}

// Create Lambda handler with context
// Use a broad type to avoid tying the public type to aws-lambda's type declarations
export const handler: any = startServerAndCreateLambdaHandler(
  server,
  requestHandler,
  {
    context: async ({ event }) => {
      try {
        // Ensure environment variables are initialized from SSM if needed
        // This MUST complete before createContext() which initializes the Drizzle client
        await ensureEnvInitialized();
        
        // Verify DATABASE_URL is set before proceeding
        if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
          const error = new Error('DATABASE_URL is required but was not set from SSM Parameter Store');
          logger.error('[CONTEXT]', error);
          throw error;
        }
        
        logger.info('[CONTEXT] Creating context with DATABASE_URL available');
        
        const headers = event.headers ?? {};
        const user = getUserFromRequest(
          headers as Record<string, string | string[] | undefined>
        );

        return createContext(user);
      } catch (error) {
        logger.error('[CONTEXT] Error creating context:', error);
        throw error;
      }
    },
  }
);
