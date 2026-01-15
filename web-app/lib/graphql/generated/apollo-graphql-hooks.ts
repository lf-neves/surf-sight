import { gql } from '@apollo/client';
import { useQuery, useLazyQuery, useSuspenseQuery, useMutation, skipToken } from '@apollo/client/react';
import * as Apollo from '@apollo/client';

type QueryHookOptions<TData, TVariables> = any;
type LazyQueryHookOptions<TData, TVariables> = any;
type SuspenseQueryHookOptions<TData, TVariables> = any;
type MutationHookOptions<TData, TVariables> = any;
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
  JSON: { input: any; output: any; }
};

export type AiInsights = {
  __typename?: 'AIInsights';
  conditions: Scalars['String']['output'];
  rating: Scalars['Int']['output'];
  recommendations: Array<Scalars['String']['output']>;
  risks: Array<Scalars['String']['output']>;
  skillLevel: Scalars['String']['output'];
};

export type AiSummary = {
  __typename?: 'AISummary';
  createdAt: Scalars['DateTime']['output'];
  forecast: Forecast;
  forecastId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  modelInfo: Scalars['JSON']['output'];
  spot: Spot;
  spotId: Scalars['ID']['output'];
  structured: Scalars['JSON']['output'];
  summary: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: User;
};

export type CreateAiSummaryInput = {
  forecastId: Scalars['ID']['input'];
  modelInfo?: InputMaybe<Scalars['JSON']['input']>;
  spotId: Scalars['ID']['input'];
  structured?: InputMaybe<Scalars['JSON']['input']>;
  summary: Scalars['String']['input'];
};

export type CreateForecastInput = {
  raw: Scalars['JSON']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
  spotId: Scalars['ID']['input'];
  timestamp: Scalars['DateTime']['input'];
};

export type CreateSpotInput = {
  lat: Scalars['Float']['input'];
  lon: Scalars['Float']['input'];
  meta?: InputMaybe<Scalars['JSON']['input']>;
  name: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  type: SpotType;
};

export type CreateUserInput = {
  email: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  skillLevel?: InputMaybe<UserSkillLevel>;
};

export type DatabaseStatus = {
  __typename?: 'DatabaseStatus';
  connected: Scalars['Boolean']['output'];
  error?: Maybe<Scalars['String']['output']>;
  responseTime?: Maybe<Scalars['Int']['output']>;
};

export type FavoriteSpot = {
  __typename?: 'FavoriteSpot';
  createdAt: Scalars['DateTime']['output'];
  notifyWhatsapp: Scalars['Boolean']['output'];
  spot: Spot;
  spotId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['ID']['output'];
};

export type Forecast = {
  __typename?: 'Forecast';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  raw: Scalars['JSON']['output'];
  source: Scalars['String']['output'];
  spot: Spot;
  spotId: Scalars['ID']['output'];
  summaries: Array<AiSummary>;
  timestamp: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  addFavorite: FavoriteSpot;
  createAISummary: AiSummary;
  createForecast: Forecast;
  createSpot: Spot;
  createUser: User;
  deleteAISummary: Scalars['Boolean']['output'];
  deleteForecast: Scalars['Boolean']['output'];
  deleteSpot: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  generateAIInsights: AiSummary;
  login: AuthPayload;
  removeFavorite: Scalars['Boolean']['output'];
  requestForecastData: Scalars['Boolean']['output'];
  requestPasswordReset: Scalars['Boolean']['output'];
  resetPassword: Scalars['Boolean']['output'];
  signup: AuthPayload;
  updateFavorite: FavoriteSpot;
  updateForecast: Forecast;
  updateSpot: Spot;
  updateUser: User;
};


export type MutationAddFavoriteArgs = {
  notifyWhatsapp?: InputMaybe<Scalars['Boolean']['input']>;
  spotId: Scalars['ID']['input'];
};


export type MutationCreateAiSummaryArgs = {
  input: CreateAiSummaryInput;
};


export type MutationCreateForecastArgs = {
  input: CreateForecastInput;
};


export type MutationCreateSpotArgs = {
  input: CreateSpotInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteAiSummaryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteForecastArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSpotArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationGenerateAiInsightsArgs = {
  spotId: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationRemoveFavoriteArgs = {
  spotId: Scalars['ID']['input'];
};


export type MutationRequestForecastDataArgs = {
  email: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  spotId: Scalars['ID']['input'];
};


export type MutationRequestPasswordResetArgs = {
  email: Scalars['String']['input'];
};


export type MutationResetPasswordArgs = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationSignupArgs = {
  input: SignupInput;
};


export type MutationUpdateFavoriteArgs = {
  notifyWhatsapp: Scalars['Boolean']['input'];
  spotId: Scalars['ID']['input'];
};


export type MutationUpdateForecastArgs = {
  id: Scalars['ID']['input'];
  input: UpdateForecastInput;
};


export type MutationUpdateSpotArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSpotInput;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  aiSummary?: Maybe<AiSummary>;
  dbStatus: DatabaseStatus;
  favorites: Array<FavoriteSpot>;
  forecast?: Maybe<Forecast>;
  isFavorite: Scalars['Boolean']['output'];
  latestAISummary?: Maybe<AiSummary>;
  latestForecastForSpot?: Maybe<Forecast>;
  me?: Maybe<User>;
  searchSpots: Array<Spot>;
  spot?: Maybe<Spot>;
  spotBySlug?: Maybe<Spot>;
  spots: Array<Spot>;
  user?: Maybe<User>;
  userByEmail?: Maybe<User>;
  users: Array<User>;
};


export type QueryAiSummaryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryForecastArgs = {
  id: Scalars['ID']['input'];
};


export type QueryIsFavoriteArgs = {
  spotId: Scalars['ID']['input'];
};


export type QueryLatestAiSummaryArgs = {
  spotId: Scalars['ID']['input'];
  timestamp?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryLatestForecastForSpotArgs = {
  spotId: Scalars['ID']['input'];
};


export type QuerySearchSpotsArgs = {
  query: Scalars['String']['input'];
};


export type QuerySpotArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySpotBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserByEmailArgs = {
  email: Scalars['String']['input'];
};

export type SignupInput = {
  email: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
};

export type Spot = {
  __typename?: 'Spot';
  aiInsights?: Maybe<AiInsights>;
  aiSummary?: Maybe<AiSummary>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  lat: Scalars['Float']['output'];
  latestForecastForSpot?: Maybe<Forecast>;
  lon: Scalars['Float']['output'];
  meta?: Maybe<Scalars['JSON']['output']>;
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  type: SpotType;
  updatedAt: Scalars['DateTime']['output'];
};


export type SpotAiInsightsArgs = {
  timestamp?: InputMaybe<Scalars['DateTime']['input']>;
};


export type SpotAiSummaryArgs = {
  timestamp?: InputMaybe<Scalars['DateTime']['input']>;
};

export type SpotType =
  | 'beach'
  | 'other'
  | 'point'
  | 'reef';

export type Subscription = {
  __typename?: 'Subscription';
  _empty?: Maybe<Scalars['String']['output']>;
  favoriteUpdated: FavoriteSpot;
  forecastUpdated: Forecast;
};


export type SubscriptionForecastUpdatedArgs = {
  spotId: Scalars['ID']['input'];
};

export type UpdateForecastInput = {
  raw?: InputMaybe<Scalars['JSON']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateSpotInput = {
  lat?: InputMaybe<Scalars['Float']['input']>;
  lon?: InputMaybe<Scalars['Float']['input']>;
  meta?: InputMaybe<Scalars['JSON']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<SpotType>;
};

export type UpdateUserInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  skillLevel?: InputMaybe<UserSkillLevel>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  favorites: Array<FavoriteSpot>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  skillLevel?: Maybe<UserSkillLevel>;
  updatedAt: Scalars['DateTime']['output'];
};

export type UserSkillLevel =
  | 'advanced'
  | 'beginner'
  | 'intermediate';

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: string, email: string, name?: string | null, phone?: string | null, skillLevel?: UserSkillLevel | null, createdAt: string, updatedAt: string } } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, email: string, name?: string | null, phone?: string | null, skillLevel?: UserSkillLevel | null, createdAt: string, updatedAt: string } | null };

export type RequestPasswordResetMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type RequestPasswordResetMutation = { __typename?: 'Mutation', requestPasswordReset: boolean };

export type SignupMutationVariables = Exact<{
  input: SignupInput;
}>;


export type SignupMutation = { __typename?: 'Mutation', signup: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: string, email: string, name?: string | null, phone?: string | null, skillLevel?: UserSkillLevel | null, createdAt: string, updatedAt: string } } };

export type LatestForecastForSpotQueryVariables = Exact<{
  spotId: Scalars['ID']['input'];
}>;


export type LatestForecastForSpotQuery = { __typename?: 'Query', latestForecastForSpot?: { __typename?: 'Forecast', id: string, spotId: string, timestamp: string, raw: any, source: string, createdAt: string, updatedAt: string } | null };

export type SpotQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SpotQuery = { __typename?: 'Query', spot?: { __typename?: 'Spot', id: string, name: string } | null };

export type SpotAiInsightsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SpotAiInsightsQuery = { __typename?: 'Query', spot?: { __typename?: 'Spot', id: string, name: string, aiInsights?: { __typename?: 'AIInsights', conditions: string, skillLevel: string, recommendations: Array<string>, risks: Array<string>, rating: number } | null } | null };

export type SpotListQueryVariables = Exact<{ [key: string]: never; }>;


export type SpotListQuery = { __typename?: 'Query', spots: Array<{ __typename?: 'Spot', id: string, name: string, slug: string }> };

export type SpotWithForecastQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SpotWithForecastQuery = { __typename?: 'Query', spot?: { __typename?: 'Spot', id: string, name: string, slug: string, lat: number, lon: number, type: SpotType, meta?: any | null, latestForecastForSpot?: { __typename?: 'Forecast', id: string, spotId: string, timestamp: string, raw: any, source: string, createdAt: string, updatedAt: string } | null, aiInsights?: { __typename?: 'AIInsights', conditions: string, skillLevel: string, recommendations: Array<string>, risks: Array<string>, rating: number } | null } | null };


export const LoginDocument = gql`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      email
      name
      phone
      skillLevel
      createdAt
      updatedAt
    }
  }
}
    `;
export type LoginMutationFn = ReturnType<typeof useLoginMutation>[0];

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = ReturnType<typeof useLoginMutation>[1];
export type LoginMutationOptions = any;
export const MeDocument = gql`
    query Me {
  me {
    id
    email
    name
    phone
    skillLevel
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export function useMeSuspenseQuery(baseOptions?: typeof skipToken | SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = ReturnType<typeof useMeQuery>;
export const RequestPasswordResetDocument = gql`
    mutation RequestPasswordReset($email: String!) {
  requestPasswordReset(email: $email)
}
    `;
export type RequestPasswordResetMutationFn = ReturnType<typeof useRequestPasswordResetMutation>[0];

/**
 * __useRequestPasswordResetMutation__
 *
 * To run a mutation, you first call `useRequestPasswordResetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestPasswordResetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestPasswordResetMutation, { data, loading, error }] = useRequestPasswordResetMutation({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useRequestPasswordResetMutation(baseOptions?: MutationHookOptions<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>(RequestPasswordResetDocument, options);
      }
export type RequestPasswordResetMutationHookResult = ReturnType<typeof useRequestPasswordResetMutation>;
export type RequestPasswordResetMutationResult = ReturnType<typeof useRequestPasswordResetMutation>[1];
export type RequestPasswordResetMutationOptions = any;
export const SignupDocument = gql`
    mutation Signup($input: SignupInput!) {
  signup(input: $input) {
    token
    user {
      id
      email
      name
      phone
      skillLevel
      createdAt
      updatedAt
    }
  }
}
    `;
export type SignupMutationFn = ReturnType<typeof useSignupMutation>[0];

/**
 * __useSignupMutation__
 *
 * To run a mutation, you first call `useSignupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signupMutation, { data, loading, error }] = useSignupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSignupMutation(baseOptions?: MutationHookOptions<SignupMutation, SignupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<SignupMutation, SignupMutationVariables>(SignupDocument, options);
      }
export type SignupMutationHookResult = ReturnType<typeof useSignupMutation>;
export type SignupMutationResult = ReturnType<typeof useSignupMutation>[1];
export type SignupMutationOptions = any;
export const LatestForecastForSpotDocument = gql`
    query LatestForecastForSpot($spotId: ID!) {
  latestForecastForSpot(spotId: $spotId) {
    id
    spotId
    timestamp
    raw
    source
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useLatestForecastForSpotQuery__
 *
 * To run a query within a React component, call `useLatestForecastForSpotQuery` and pass it any options that fit your needs.
 * When your component renders, `useLatestForecastForSpotQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLatestForecastForSpotQuery({
 *   variables: {
 *      spotId: // value for 'spotId'
 *   },
 * });
 */
export function useLatestForecastForSpotQuery(baseOptions: QueryHookOptions<LatestForecastForSpotQuery, LatestForecastForSpotQueryVariables> & ({ variables: LatestForecastForSpotQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<LatestForecastForSpotQuery, LatestForecastForSpotQueryVariables>(LatestForecastForSpotDocument, options);
      }
export function useLatestForecastForSpotLazyQuery(baseOptions?: LazyQueryHookOptions<LatestForecastForSpotQuery, LatestForecastForSpotQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<LatestForecastForSpotQuery, LatestForecastForSpotQueryVariables>(LatestForecastForSpotDocument, options);
        }
export function useLatestForecastForSpotSuspenseQuery(baseOptions?: typeof skipToken | SuspenseQueryHookOptions<LatestForecastForSpotQuery, LatestForecastForSpotQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<LatestForecastForSpotQuery, LatestForecastForSpotQueryVariables>(LatestForecastForSpotDocument, options);
        }
export type LatestForecastForSpotQueryHookResult = ReturnType<typeof useLatestForecastForSpotQuery>;
export type LatestForecastForSpotLazyQueryHookResult = ReturnType<typeof useLatestForecastForSpotLazyQuery>;
export type LatestForecastForSpotSuspenseQueryHookResult = ReturnType<typeof useLatestForecastForSpotSuspenseQuery>;
export type LatestForecastForSpotQueryResult = ReturnType<typeof useLatestForecastForSpotQuery>;
export const SpotDocument = gql`
    query Spot($id: ID!) {
  spot(id: $id) {
    id
    name
  }
}
    `;

/**
 * __useSpotQuery__
 *
 * To run a query within a React component, call `useSpotQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpotQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpotQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSpotQuery(baseOptions: QueryHookOptions<SpotQuery, SpotQueryVariables> & ({ variables: SpotQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<SpotQuery, SpotQueryVariables>(SpotDocument, options);
      }
export function useSpotLazyQuery(baseOptions?: LazyQueryHookOptions<SpotQuery, SpotQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<SpotQuery, SpotQueryVariables>(SpotDocument, options);
        }
export function useSpotSuspenseQuery(baseOptions?: typeof skipToken | SuspenseQueryHookOptions<SpotQuery, SpotQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<SpotQuery, SpotQueryVariables>(SpotDocument, options);
        }
export type SpotQueryHookResult = ReturnType<typeof useSpotQuery>;
export type SpotLazyQueryHookResult = ReturnType<typeof useSpotLazyQuery>;
export type SpotSuspenseQueryHookResult = ReturnType<typeof useSpotSuspenseQuery>;
export type SpotQueryResult = ReturnType<typeof useSpotQuery>;
export const SpotAiInsightsDocument = gql`
    query SpotAIInsights($id: ID!) {
  spot(id: $id) {
    id
    name
    aiInsights {
      conditions
      skillLevel
      recommendations
      risks
      rating
    }
  }
}
    `;

/**
 * __useSpotAiInsightsQuery__
 *
 * To run a query within a React component, call `useSpotAiInsightsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpotAiInsightsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpotAiInsightsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSpotAiInsightsQuery(baseOptions: QueryHookOptions<SpotAiInsightsQuery, SpotAiInsightsQueryVariables> & ({ variables: SpotAiInsightsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<SpotAiInsightsQuery, SpotAiInsightsQueryVariables>(SpotAiInsightsDocument, options);
      }
export function useSpotAiInsightsLazyQuery(baseOptions?: LazyQueryHookOptions<SpotAiInsightsQuery, SpotAiInsightsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<SpotAiInsightsQuery, SpotAiInsightsQueryVariables>(SpotAiInsightsDocument, options);
        }
export function useSpotAiInsightsSuspenseQuery(baseOptions?: typeof skipToken | SuspenseQueryHookOptions<SpotAiInsightsQuery, SpotAiInsightsQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<SpotAiInsightsQuery, SpotAiInsightsQueryVariables>(SpotAiInsightsDocument, options);
        }
export type SpotAiInsightsQueryHookResult = ReturnType<typeof useSpotAiInsightsQuery>;
export type SpotAiInsightsLazyQueryHookResult = ReturnType<typeof useSpotAiInsightsLazyQuery>;
export type SpotAiInsightsSuspenseQueryHookResult = ReturnType<typeof useSpotAiInsightsSuspenseQuery>;
export type SpotAiInsightsQueryResult = ReturnType<typeof useSpotAiInsightsQuery>;
export const SpotListDocument = gql`
    query SpotList {
  spots {
    id
    name
    slug
  }
}
    `;

/**
 * __useSpotListQuery__
 *
 * To run a query within a React component, call `useSpotListQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpotListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpotListQuery({
 *   variables: {
 *   },
 * });
 */
export function useSpotListQuery(baseOptions?: QueryHookOptions<SpotListQuery, SpotListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<SpotListQuery, SpotListQueryVariables>(SpotListDocument, options);
      }
export function useSpotListLazyQuery(baseOptions?: LazyQueryHookOptions<SpotListQuery, SpotListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<SpotListQuery, SpotListQueryVariables>(SpotListDocument, options);
        }
export function useSpotListSuspenseQuery(baseOptions?: typeof skipToken | SuspenseQueryHookOptions<SpotListQuery, SpotListQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<SpotListQuery, SpotListQueryVariables>(SpotListDocument, options);
        }
export type SpotListQueryHookResult = ReturnType<typeof useSpotListQuery>;
export type SpotListLazyQueryHookResult = ReturnType<typeof useSpotListLazyQuery>;
export type SpotListSuspenseQueryHookResult = ReturnType<typeof useSpotListSuspenseQuery>;
export type SpotListQueryResult = ReturnType<typeof useSpotListQuery>;
export const SpotWithForecastDocument = gql`
    query SpotWithForecast($id: ID!) {
  spot(id: $id) {
    id
    name
    slug
    lat
    lon
    type
    meta
    latestForecastForSpot {
      id
      spotId
      timestamp
      raw
      source
      createdAt
      updatedAt
    }
    aiInsights {
      conditions
      skillLevel
      recommendations
      risks
      rating
    }
  }
}
    `;

/**
 * __useSpotWithForecastQuery__
 *
 * To run a query within a React component, call `useSpotWithForecastQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpotWithForecastQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpotWithForecastQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSpotWithForecastQuery(baseOptions: QueryHookOptions<SpotWithForecastQuery, SpotWithForecastQueryVariables> & ({ variables: SpotWithForecastQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<SpotWithForecastQuery, SpotWithForecastQueryVariables>(SpotWithForecastDocument, options);
      }
export function useSpotWithForecastLazyQuery(baseOptions?: LazyQueryHookOptions<SpotWithForecastQuery, SpotWithForecastQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<SpotWithForecastQuery, SpotWithForecastQueryVariables>(SpotWithForecastDocument, options);
        }
export function useSpotWithForecastSuspenseQuery(baseOptions?: typeof skipToken | SuspenseQueryHookOptions<SpotWithForecastQuery, SpotWithForecastQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<SpotWithForecastQuery, SpotWithForecastQueryVariables>(SpotWithForecastDocument, options);
        }
export type SpotWithForecastQueryHookResult = ReturnType<typeof useSpotWithForecastQuery>;
export type SpotWithForecastLazyQueryHookResult = ReturnType<typeof useSpotWithForecastLazyQuery>;
export type SpotWithForecastSuspenseQueryHookResult = ReturnType<typeof useSpotWithForecastSuspenseQuery>;
export type SpotWithForecastQueryResult = ReturnType<typeof useSpotWithForecastQuery>;