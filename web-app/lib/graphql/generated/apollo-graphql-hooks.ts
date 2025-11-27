import { gql } from '@apollo/client';
import { useQuery, useLazyQuery, useSuspenseQuery, skipToken } from '@apollo/client/react';
import * as Apollo from '@apollo/client';

type QueryHookOptions<TData, TVariables> = any;
type LazyQueryHookOptions<TData, TVariables> = any;
type SuspenseQueryHookOptions<TData, TVariables> = any;
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
  removeFavorite: Scalars['Boolean']['output'];
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


export type MutationRemoveFavoriteArgs = {
  spotId: Scalars['ID']['input'];
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
  favorites: Array<FavoriteSpot>;
  forecast?: Maybe<Forecast>;
  forecastsForSpot: Array<Forecast>;
  isFavorite: Scalars['Boolean']['output'];
  latestAISummary?: Maybe<AiSummary>;
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


export type QueryForecastsForSpotArgs = {
  nextHours?: InputMaybe<Scalars['Int']['input']>;
  spotId: Scalars['ID']['input'];
};


export type QueryIsFavoriteArgs = {
  spotId: Scalars['ID']['input'];
};


export type QueryLatestAiSummaryArgs = {
  spotId: Scalars['ID']['input'];
  timestamp?: InputMaybe<Scalars['DateTime']['input']>;
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

export type Spot = {
  __typename?: 'Spot';
  aiInsights?: Maybe<AiInsights>;
  aiSummary?: Maybe<AiSummary>;
  createdAt: Scalars['DateTime']['output'];
  forecast: Array<Forecast>;
  id: Scalars['ID']['output'];
  lat: Scalars['Float']['output'];
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


export type SpotForecastArgs = {
  nextHours?: InputMaybe<Scalars['Int']['input']>;
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

export type SpotQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SpotQuery = { __typename?: 'Query', spot?: { __typename?: 'Spot', id: string, name: string } | null };

export type SpotListQueryVariables = Exact<{ [key: string]: never; }>;


export type SpotListQuery = { __typename?: 'Query', spots: Array<{ __typename?: 'Spot', id: string, name: string }> };


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
export const SpotListDocument = gql`
    query SpotList {
  spots {
    id
    name
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