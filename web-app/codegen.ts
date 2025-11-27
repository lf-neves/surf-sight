import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * GraphQL Code Generator Configuration
 *
 * This configuration fetches the schema from the running API server.
 *
 * To use schema files directly instead (when API server is not running):
 *   USE_SCHEMA_FILES=true pnpm codegen
 *
 * You can override the API URL using the GRAPHQL_API_URL environment variable:
 *   GRAPHQL_API_URL=http://localhost:4000/graphql pnpm codegen
 */
const useSchemaFiles = process.env.USE_SCHEMA_FILES === "true";

const config: CodegenConfig = {
  overwrite: true,
  schema: useSchemaFiles
    ? "../services/api-service/src/graphql/modules/**/*.graphql"
    : process.env.GRAPHQL_API_URL || "http://localhost:4000/graphql",
  documents: "app/api/graphql/**/*.graphql",
  generates: {
    "lib/graphql/generated/apollo-graphql-hooks.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        watch: true,
        withHooks: true,
        withComponent: false,
        withHOC: false,
        skipTypename: false,
        enumsAsTypes: true,
        scalars: {
          DateTime: "string",
          JSON: "any",
        },
        presetConfig: {
          baseTypesPath: "types.ts",
          importAllFragmentsFrom: "~types",
        },
        dedupeFragments: true,
        nonOptionalTypename: false,
        suspense: false,
      },
    },
  },
};

export default config;
