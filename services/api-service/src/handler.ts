import { ApolloServer } from '@apollo/server';
import { startServerAndCreateLambdaHandler } from '@as-integrations/aws-lambda';
import { schema } from './graphql/schema';
import { createContext, getUserFromRequest } from './context';

const server = new ApolloServer<ReturnType<typeof createContext>>({
  schema,
});

export const handler = startServerAndCreateLambdaHandler(server, {
  context: async ({ event }) => {
    const headers = event.headers ?? {};
    const user = getUserFromRequest(
      headers as Record<string, string | string[] | undefined>
    );

    return createContext(user);
  },
});
