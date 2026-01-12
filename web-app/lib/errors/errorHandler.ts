/**
 * Centralized error handling for user-facing errors
 */

// HttpStatusCode constants for frontend use
const HttpStatusCode = {
  INTERNAL_SERVER_ERROR: 500,
} as const;

export interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
    statusCode?: number;
    isUserFacing?: boolean;
  };
}

export interface GraphQLResponse {
  errors?: GraphQLError[];
  data?: any;
}

const GENERIC_ERROR_MESSAGE =
  "Something went wrong. We're investigating the problem and will reach out to you when we solve it.";

/**
 * Extracts user-facing error message from GraphQL response
 */
export function getUserFacingError(
  error: unknown,
  response?: GraphQLResponse
): string {
  // Check if it's a GraphQL response with errors
  if (response?.errors && response.errors.length > 0) {
    const graphqlError = response.errors[0];
    
    // If error is marked as user-facing, return its message
    if (graphqlError.extensions?.isUserFacing) {
      return graphqlError.message;
    }
    
    // Otherwise, return generic error
    return GENERIC_ERROR_MESSAGE;
  }

  // Check if it's an Apollo error
  if (error && typeof error === 'object' && 'graphQLErrors' in error) {
    const apolloError = error as any;
    if (apolloError.graphQLErrors && apolloError.graphQLErrors.length > 0) {
      const graphqlError = apolloError.graphQLErrors[0];
      
      // If error is marked as user-facing, return its message
      if (graphqlError.extensions?.isUserFacing) {
        return graphqlError.message;
      }
      
      // If it's a server error (500+) that wasn't converted yet, return generic
      const statusCode = graphqlError.extensions?.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR;
      if (statusCode >= HttpStatusCode.INTERNAL_SERVER_ERROR) {
        return GENERIC_ERROR_MESSAGE;
      }
    }
  }

  // Check if it's a network error (500, etc.)
  if (error && typeof error === 'object' && 'networkError' in error) {
    const networkError = (error as any).networkError;
    if (networkError?.statusCode && networkError.statusCode >= HttpStatusCode.INTERNAL_SERVER_ERROR) {
      return GENERIC_ERROR_MESSAGE;
    }
  }

  // Default to generic error
  return GENERIC_ERROR_MESSAGE;
}
