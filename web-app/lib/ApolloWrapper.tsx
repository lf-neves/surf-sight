"use client";

import { HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { onError } from "@apollo/client/link/error";
import { config } from "./config";

// HttpStatusCode constants for frontend use
const HttpStatusCode = {
  UNAUTHORIZED: 401,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export function ApolloClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApolloNextAppProvider
      makeClient={() => {
        const httpLink = new HttpLink({
          uri: config.apiUrl,
          fetchOptions: {
            credentials: "include",
          },
        });

        // Auth link to add JWT token to headers
        const authLink = setContext((_, { headers }) => {
          // Get token from localStorage
          const token =
            typeof window !== "undefined"
              ? localStorage.getItem("token")
              : null;

          return {
            headers: {
              ...headers,
              authorization: token ? `Bearer ${token}` : "",
            },
          };
        });

        // Error link to handle token expiration, auth errors, and convert raw errors to user-facing
        const errorLink = onError((error: any) => {
          const GENERIC_ERROR_MESSAGE =
            "Something went wrong. We're investigating the problem and will reach out to you when we solve it.";

          if (error.graphQLErrors) {
            error.graphQLErrors.forEach((graphQLError) => {
              // Handle authentication errors
              if (
                graphQLError.extensions?.code === "UNAUTHENTICATED" ||
                graphQLError.extensions?.statusCode === HttpStatusCode.UNAUTHORIZED ||
                graphQLError.message.includes("Authentication required") ||
                graphQLError.message.includes("Invalid") ||
                graphQLError.message.includes("expired")
              ) {
                // Clear auth data and redirect to login
                if (typeof window !== "undefined") {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }
              }

              // Convert non-user-facing errors (500s, etc.) to user-facing errors
              if (!graphQLError.extensions?.isUserFacing) {
                const statusCode = graphQLError.extensions?.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR;
                
                // For server errors (500+), convert to generic user-facing error
                if (statusCode >= HttpStatusCode.INTERNAL_SERVER_ERROR) {
                  graphQLError.message = GENERIC_ERROR_MESSAGE;
                  graphQLError.extensions = {
                    ...graphQLError.extensions,
                    isUserFacing: true,
                    code: 'INTERNAL_ERROR',
                    statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
                  };
                }
              }
            });
          }

          if (error.networkError) {
            // Handle network errors that might indicate auth issues
            const networkError = error.networkError as any;
            
            if (networkError.statusCode === HttpStatusCode.UNAUTHORIZED) {
              if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
              }
            }

            // Convert network errors (500+) to user-facing errors
            if (networkError.statusCode >= HttpStatusCode.INTERNAL_SERVER_ERROR) {
              // Create a GraphQL error structure for network errors
              if (!error.graphQLErrors) {
                error.graphQLErrors = [];
              }
              error.graphQLErrors.push({
                message: GENERIC_ERROR_MESSAGE,
                extensions: {
                  code: 'INTERNAL_ERROR',
                  statusCode: networkError.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR,
                  isUserFacing: true,
                },
              } as any);
            }
          }
        });

        return new ApolloClient({
          link: from([errorLink, authLink, httpLink]),
          cache: new InMemoryCache(),
        });
      }}
    >
      {children}
    </ApolloNextAppProvider>
  );
}
