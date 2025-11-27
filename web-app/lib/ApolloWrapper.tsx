"use client";

import { HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";

export function ApolloClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApolloNextAppProvider
      makeClient={() => {
        const httpLink = new HttpLink({
          uri: "http://localhost:4000/graphql",
          fetchOptions: {
            credentials: "include",
          },
        });

        return new ApolloClient({
          link: httpLink,
          cache: new InMemoryCache(),
        });
      }}
    >
      {children}
    </ApolloNextAppProvider>
  );
}
