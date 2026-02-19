#!/usr/bin/env node
/**
 * Post-generation script to fix Apollo Client imports in generated hooks
 *
 * This script fixes the issue where codegen generates:
 *   import * as Apollo from '@apollo/client';
 *   Apollo.useQuery(...)
 *
 * But it should be:
 *   import { useQuery, useLazyQuery, useSuspenseQuery, skipToken } from '@apollo/client/react';
 *   useQuery(...)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const hooksFile = join(
  __dirname,
  '../lib/graphql/generated/apollo-graphql-hooks.ts'
);

try {
  let content = readFileSync(hooksFile, 'utf-8');

  // Step 1: Add react imports right after the gql import
  // Remove any existing react imports first
  content = content.replace(
    /import\s+\{[^}]*useQuery[^}]*\}\s+from\s+['"]@apollo\/client\/react['"];?\s*\n?/g,
    ''
  );

  // Add the react imports after the gql import
  content = content.replace(
    /(import\s+\{\s*gql\s*\}\s+from\s+['"]@apollo\/client['"];)/,
    "$1\nimport { useQuery, useLazyQuery, useSuspenseQuery, useMutation, skipToken } from '@apollo/client/react';"
  );

  // Step 2: Add custom type definitions after the Apollo namespace import
  // Remove any existing type definitions first
  content = content.replace(
    /type\s+QueryHookOptions<[^>]+>\s*=\s*any;\s*\n?/g,
    ''
  );
  content = content.replace(
    /type\s+LazyQueryHookOptions<[^>]+>\s*=\s*any;\s*\n?/g,
    ''
  );
  content = content.replace(
    /type\s+SuspenseQueryHookOptions<[^>]+>\s*=\s*any;\s*\n?/g,
    ''
  );

  // Add type definitions after Apollo import
  content = content.replace(
    /(import\s+\*\s+as\s+Apollo\s+from\s+['"]@apollo\/client['"];)/,
    '$1\n\ntype QueryHookOptions<TData, TVariables> = any;\ntype LazyQueryHookOptions<TData, TVariables> = any;\ntype SuspenseQueryHookOptions<TData, TVariables> = any;\ntype MutationHookOptions<TData, TVariables> = any;'
  );

  // Step 3: Replace ALL Apollo.* references with direct references
  // This must be done in a specific order to avoid partial replacements

  // Replace Apollo.useQuery -> useQuery
  content = content.replace(/Apollo\.useQuery/g, 'useQuery');

  // Replace Apollo.useLazyQuery -> useLazyQuery
  content = content.replace(/Apollo\.useLazyQuery/g, 'useLazyQuery');

  // Replace Apollo.useSuspenseQuery -> useSuspenseQuery
  content = content.replace(/Apollo\.useSuspenseQuery/g, 'useSuspenseQuery');

  // Replace Apollo.useMutation -> useMutation
  content = content.replace(/Apollo\.useMutation/g, 'useMutation');

  // Replace Apollo.skipToken -> skipToken
  content = content.replace(/Apollo\.skipToken/g, 'skipToken');

  // Replace Apollo.QueryHookOptions -> QueryHookOptions
  content = content.replace(/Apollo\.QueryHookOptions/g, 'QueryHookOptions');

  // Replace Apollo.LazyQueryHookOptions -> LazyQueryHookOptions
  content = content.replace(
    /Apollo\.LazyQueryHookOptions/g,
    'LazyQueryHookOptions'
  );

  // Replace Apollo.SuspenseQueryHookOptions -> SuspenseQueryHookOptions
  content = content.replace(
    /Apollo\.SuspenseQueryHookOptions/g,
    'SuspenseQueryHookOptions'
  );

  // Replace Apollo.MutationHookOptions -> MutationHookOptions
  content = content.replace(
    /Apollo\.MutationHookOptions/g,
    'MutationHookOptions'
  );

  // Replace Apollo.MutationResult -> ReturnType<typeof useMutation>
  // This is a bit tricky - we'll use a pattern that matches the mutation name
  content = content.replace(
    /export type (\w+MutationResult) = Apollo\.MutationResult<(\w+)>;/g,
    (_match, typeName) => {
      // Extract base name: LoginMutationResult -> Login
      const baseName = typeName.replace(/MutationResult$/, '');
      const hookName = `use${baseName}Mutation`;
      return `export type ${typeName} = ReturnType<typeof ${hookName}>[1];`;
    }
  );

  // Replace Apollo.BaseMutationOptions -> any (simplified, but ensure we don't create invalid syntax)
  // First replace the full type with generic parameters
  content = content.replace(/Apollo\.BaseMutationOptions<[^>]+>/g, 'any');
  // Then replace any remaining instances without parameters
  content = content.replace(/Apollo\.BaseMutationOptions/g, 'any');

  // Replace Apollo.MutationFunction - this is complex, we'll use a helper type
  content = content.replace(
    /export type (\w+MutationFn) = Apollo\.MutationFunction<(\w+),\s*(\w+)>;/g,
    (_match, typeName) => {
      // Extract base name: LoginMutationFn -> Login
      const baseName = typeName.replace(/MutationFn$/, '');
      const hookName = `use${baseName}Mutation`;
      return `export type ${typeName} = ReturnType<typeof ${hookName}>[0];`;
    }
  );

  // Replace Apollo.SkipToken -> typeof skipToken
  content = content.replace(/Apollo\.SkipToken/g, 'typeof skipToken');

  // Step 4: Replace Apollo.QueryResult with ReturnType<typeof hookName>
  // Pattern: SpotQueryQueryResult -> useSpotQueryQuery
  // Pattern: SpotListQueryQueryResult -> useSpotListQueryQuery
  content = content.replace(
    /export\s+type\s+(\w+QueryResult)\s*=\s*Apollo\.QueryResult<(\w+),\s*(\w+)>;/g,
    (_match, typeName) => {
      // Extract base name: SpotQueryQueryResult -> SpotQuery
      const baseName = typeName.replace(/QueryResult$/, '');
      const hookName = `use${baseName}Query`;
      return `export type ${typeName} = ReturnType<typeof ${hookName}>;`;
    }
  );

  // Also handle cases where it might already be partially replaced
  content = content.replace(
    /export\s+type\s+(\w+QueryResult)\s*=\s*ReturnType<typeof\s+(\w+Query)>;/g,
    (match, typeName, existingHook) => {
      // If the hook name doesn't start with 'use', fix it
      if (!existingHook.startsWith('use')) {
        const baseName = typeName.replace(/QueryResult$/, '');
        const hookName = `use${baseName}Query`;
        return `export type ${typeName} = ReturnType<typeof ${hookName}>;`;
      }
      return match; // Already correct
    }
  );

  writeFileSync(hooksFile, content, 'utf-8');
  // eslint-disable-next-line no-console -- script output
  console.log('✅ Fixed Apollo Client imports in generated hooks');
} catch (error) {
  // eslint-disable-next-line no-console -- script output
  console.error('❌ Error fixing Apollo imports:', error);
  process.exit(1);
}
