import { ApolloServer } from '@apollo/server';
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from '@as-integrations/aws-lambda';
import { logger } from '@surf-sight/core';
import { schema } from './graphql/schema';
import { createContext, getUserFromRequest } from './context';

// Create Apollo Server instance
const server = new ApolloServer({
  schema,
  formatError: (formattedError) => {
    logger.error('GraphQL Error:', formattedError);
    return {
      message: formattedError.message,
      extensions: {
        code: formattedError.extensions?.code,
        ...(process.env.NODE_ENV === 'development' && {
          stack: formattedError.extensions?.stack,
        }),
      },
    };
  },
});

// Create request handler for API Gateway HTTP API (v2)
const requestHandler = handlers.createAPIGatewayProxyEventV2RequestHandler();

// Create Lambda handler with context
// Use a broad type to avoid tying the public type to aws-lambda's type declarations
export const handler: any = startServerAndCreateLambdaHandler(
  server,
  requestHandler,
  {
    context: async ({ event }) => {
      try {
        const headers = event.headers ?? {};
        const user = getUserFromRequest(
          headers as Record<string, string | string[] | undefined>
        );

        return createContext(user);
      } catch (error) {
        logger.error('Error creating context:', error);
        throw error;
      }
    },
  }
);
