import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { useServer } from "graphql-ws/lib/use/ws";
import { WebSocketServer } from "ws";
import express from "express";
import { createServer as createHttpServer, type Server } from "http";
import cors from "cors";
import { schema } from "./graphql/schema";
import { createContext, getUserFromRequest } from "./context";
import { env } from "./env";
import { logger } from "@surf-sight/core";

let serverCleanup: ReturnType<typeof useServer> | null = null;

export async function createServer(): Promise<{
  app: express.Express;
  httpServer: Server;
  server: ApolloServer;
}> {
  const app = express();
  const httpServer: Server = createHttpServer(app);

  // Create WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  // Set up WebSocket server first
  serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        // Extract user from WebSocket connection params
        const headers =
          (ctx.connectionParams?.headers as Record<string, string>) || {};
        const user = getUserFromRequest(headers);
        return createContext(user);
      },
    },
    wsServer
  );

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              if (serverCleanup) {
                await serverCleanup.dispose();
              }
            },
          };
        },
      },
    ],
  });

  await server.start();

  // Set up GraphQL endpoint
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const user = getUserFromRequest(
          req.headers as Record<string, string | string[] | undefined>
        );

        return createContext(user);
      },
    })
  );

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return { app, httpServer, server };
}

export async function startServer() {
  const { httpServer } = await createServer();

  httpServer.listen(env.port, () => {
    logger.info(`🚀 Server ready at http://localhost:${env.port}/graphql`);
    logger.info(
      `📡 WebSocket server ready at ws://localhost:${env.port}/graphql`
    );
  });
}
