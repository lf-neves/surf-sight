import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { User, Spot, Forecast, AISummary, FavoriteSpot } from '@prisma/client';
import { GraphQLContext } from '../context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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

export type GraphqlAiInsights = {
  __typename?: 'AIInsights';
  conditions: Scalars['String']['output'];
  rating: Scalars['Int']['output'];
  recommendations: Array<Scalars['String']['output']>;
  risks: Array<Scalars['String']['output']>;
  skillLevel: Scalars['String']['output'];
};

export type GraphqlAiSummary = {
  __typename?: 'AISummary';
  createdAt: Scalars['DateTime']['output'];
  forecast: GraphqlForecast;
  forecastId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  modelInfo: Scalars['JSON']['output'];
  spot: GraphqlSpot;
  spotId: Scalars['ID']['output'];
  structured: Scalars['JSON']['output'];
  summary: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type GraphqlCreateAiSummaryInput = {
  forecastId: Scalars['ID']['input'];
  modelInfo?: InputMaybe<Scalars['JSON']['input']>;
  spotId: Scalars['ID']['input'];
  structured?: InputMaybe<Scalars['JSON']['input']>;
  summary: Scalars['String']['input'];
};

export type GraphqlCreateForecastInput = {
  raw: Scalars['JSON']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
  spotId: Scalars['ID']['input'];
  timestamp: Scalars['DateTime']['input'];
};

export type GraphqlCreateSpotInput = {
  lat: Scalars['Float']['input'];
  lon: Scalars['Float']['input'];
  meta?: InputMaybe<Scalars['JSON']['input']>;
  name: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  type: GraphqlSpotType;
};

export type GraphqlCreateUserInput = {
  email: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  skillLevel?: InputMaybe<GraphqlUserSkillLevel>;
};

export type GraphqlDatabaseStatus = {
  __typename?: 'DatabaseStatus';
  connected: Scalars['Boolean']['output'];
  error?: Maybe<Scalars['String']['output']>;
  responseTime?: Maybe<Scalars['Int']['output']>;
};

export type GraphqlFavoriteSpot = {
  __typename?: 'FavoriteSpot';
  createdAt: Scalars['DateTime']['output'];
  notifyWhatsapp: Scalars['Boolean']['output'];
  spot: GraphqlSpot;
  spotId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: GraphqlUser;
  userId: Scalars['ID']['output'];
};

export type GraphqlForecast = {
  __typename?: 'Forecast';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  raw: Scalars['JSON']['output'];
  source: Scalars['String']['output'];
  spot: GraphqlSpot;
  spotId: Scalars['ID']['output'];
  summaries: Array<GraphqlAiSummary>;
  timestamp: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type GraphqlMutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  addFavorite: GraphqlFavoriteSpot;
  createAISummary: GraphqlAiSummary;
  createForecast: GraphqlForecast;
  createSpot: GraphqlSpot;
  createUser: GraphqlUser;
  deleteAISummary: Scalars['Boolean']['output'];
  deleteForecast: Scalars['Boolean']['output'];
  deleteSpot: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  removeFavorite: Scalars['Boolean']['output'];
  updateFavorite: GraphqlFavoriteSpot;
  updateForecast: GraphqlForecast;
  updateSpot: GraphqlSpot;
  updateUser: GraphqlUser;
};


export type GraphqlMutationAddFavoriteArgs = {
  notifyWhatsapp?: InputMaybe<Scalars['Boolean']['input']>;
  spotId: Scalars['ID']['input'];
};


export type GraphqlMutationCreateAiSummaryArgs = {
  input: GraphqlCreateAiSummaryInput;
};


export type GraphqlMutationCreateForecastArgs = {
  input: GraphqlCreateForecastInput;
};


export type GraphqlMutationCreateSpotArgs = {
  input: GraphqlCreateSpotInput;
};


export type GraphqlMutationCreateUserArgs = {
  input: GraphqlCreateUserInput;
};


export type GraphqlMutationDeleteAiSummaryArgs = {
  id: Scalars['ID']['input'];
};


export type GraphqlMutationDeleteForecastArgs = {
  id: Scalars['ID']['input'];
};


export type GraphqlMutationDeleteSpotArgs = {
  id: Scalars['ID']['input'];
};


export type GraphqlMutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type GraphqlMutationRemoveFavoriteArgs = {
  spotId: Scalars['ID']['input'];
};


export type GraphqlMutationUpdateFavoriteArgs = {
  notifyWhatsapp: Scalars['Boolean']['input'];
  spotId: Scalars['ID']['input'];
};


export type GraphqlMutationUpdateForecastArgs = {
  id: Scalars['ID']['input'];
  input: GraphqlUpdateForecastInput;
};


export type GraphqlMutationUpdateSpotArgs = {
  id: Scalars['ID']['input'];
  input: GraphqlUpdateSpotInput;
};


export type GraphqlMutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: GraphqlUpdateUserInput;
};

export type GraphqlQuery = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  aiSummary?: Maybe<GraphqlAiSummary>;
  dbStatus: GraphqlDatabaseStatus;
  favorites: Array<GraphqlFavoriteSpot>;
  forecast?: Maybe<GraphqlForecast>;
  forecastsForSpot: Array<GraphqlForecast>;
  isFavorite: Scalars['Boolean']['output'];
  latestAISummary?: Maybe<GraphqlAiSummary>;
  me?: Maybe<GraphqlUser>;
  searchSpots: Array<GraphqlSpot>;
  spot?: Maybe<GraphqlSpot>;
  spotBySlug?: Maybe<GraphqlSpot>;
  spots: Array<GraphqlSpot>;
  user?: Maybe<GraphqlUser>;
  userByEmail?: Maybe<GraphqlUser>;
  users: Array<GraphqlUser>;
};


export type GraphqlQueryAiSummaryArgs = {
  id: Scalars['ID']['input'];
};


export type GraphqlQueryForecastArgs = {
  id: Scalars['ID']['input'];
};


export type GraphqlQueryForecastsForSpotArgs = {
  nextHours?: InputMaybe<Scalars['Int']['input']>;
  spotId: Scalars['ID']['input'];
};


export type GraphqlQueryIsFavoriteArgs = {
  spotId: Scalars['ID']['input'];
};


export type GraphqlQueryLatestAiSummaryArgs = {
  spotId: Scalars['ID']['input'];
  timestamp?: InputMaybe<Scalars['DateTime']['input']>;
};


export type GraphqlQuerySearchSpotsArgs = {
  query: Scalars['String']['input'];
};


export type GraphqlQuerySpotArgs = {
  id: Scalars['ID']['input'];
};


export type GraphqlQuerySpotBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type GraphqlQueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type GraphqlQueryUserByEmailArgs = {
  email: Scalars['String']['input'];
};

export type GraphqlSpot = {
  __typename?: 'Spot';
  aiInsights?: Maybe<GraphqlAiInsights>;
  aiSummary?: Maybe<GraphqlAiSummary>;
  createdAt: Scalars['DateTime']['output'];
  forecast: Array<GraphqlForecast>;
  id: Scalars['ID']['output'];
  lat: Scalars['Float']['output'];
  lon: Scalars['Float']['output'];
  meta?: Maybe<Scalars['JSON']['output']>;
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  type: GraphqlSpotType;
  updatedAt: Scalars['DateTime']['output'];
};


export type GraphqlSpotAiInsightsArgs = {
  timestamp?: InputMaybe<Scalars['DateTime']['input']>;
};


export type GraphqlSpotAiSummaryArgs = {
  timestamp?: InputMaybe<Scalars['DateTime']['input']>;
};


export type GraphqlSpotForecastArgs = {
  nextHours?: InputMaybe<Scalars['Int']['input']>;
};

export enum GraphqlSpotType {
  beach = 'beach',
  other = 'other',
  point = 'point',
  reef = 'reef'
}

export type GraphqlSubscription = {
  __typename?: 'Subscription';
  _empty?: Maybe<Scalars['String']['output']>;
  favoriteUpdated: GraphqlFavoriteSpot;
  forecastUpdated: GraphqlForecast;
};


export type GraphqlSubscriptionForecastUpdatedArgs = {
  spotId: Scalars['ID']['input'];
};

export type GraphqlUpdateForecastInput = {
  raw?: InputMaybe<Scalars['JSON']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['DateTime']['input']>;
};

export type GraphqlUpdateSpotInput = {
  lat?: InputMaybe<Scalars['Float']['input']>;
  lon?: InputMaybe<Scalars['Float']['input']>;
  meta?: InputMaybe<Scalars['JSON']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<GraphqlSpotType>;
};

export type GraphqlUpdateUserInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  skillLevel?: InputMaybe<GraphqlUserSkillLevel>;
};

export type GraphqlUser = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  favorites: Array<GraphqlFavoriteSpot>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  skillLevel?: Maybe<GraphqlUserSkillLevel>;
  updatedAt: Scalars['DateTime']['output'];
};

export enum GraphqlUserSkillLevel {
  advanced = 'advanced',
  beginner = 'beginner',
  intermediate = 'intermediate'
}

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type GraphqlResolversTypes = ResolversObject<{
  AIInsights: ResolverTypeWrapper<GraphqlAiInsights>;
  AISummary: ResolverTypeWrapper<AISummary>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CreateAISummaryInput: GraphqlCreateAiSummaryInput;
  CreateForecastInput: GraphqlCreateForecastInput;
  CreateSpotInput: GraphqlCreateSpotInput;
  CreateUserInput: GraphqlCreateUserInput;
  DatabaseStatus: ResolverTypeWrapper<GraphqlDatabaseStatus>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  FavoriteSpot: ResolverTypeWrapper<FavoriteSpot>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Forecast: ResolverTypeWrapper<Forecast>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  Spot: ResolverTypeWrapper<Spot>;
  SpotType: GraphqlSpotType;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  UpdateForecastInput: GraphqlUpdateForecastInput;
  UpdateSpotInput: GraphqlUpdateSpotInput;
  UpdateUserInput: GraphqlUpdateUserInput;
  User: ResolverTypeWrapper<User>;
  UserSkillLevel: GraphqlUserSkillLevel;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type GraphqlResolversParentTypes = ResolversObject<{
  AIInsights: GraphqlAiInsights;
  AISummary: AISummary;
  Boolean: Scalars['Boolean']['output'];
  CreateAISummaryInput: GraphqlCreateAiSummaryInput;
  CreateForecastInput: GraphqlCreateForecastInput;
  CreateSpotInput: GraphqlCreateSpotInput;
  CreateUserInput: GraphqlCreateUserInput;
  DatabaseStatus: GraphqlDatabaseStatus;
  DateTime: Scalars['DateTime']['output'];
  FavoriteSpot: FavoriteSpot;
  Float: Scalars['Float']['output'];
  Forecast: Forecast;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  Mutation: {};
  Query: {};
  Spot: Spot;
  String: Scalars['String']['output'];
  Subscription: {};
  UpdateForecastInput: GraphqlUpdateForecastInput;
  UpdateSpotInput: GraphqlUpdateSpotInput;
  UpdateUserInput: GraphqlUpdateUserInput;
  User: User;
}>;

export type GraphqlAiInsightsResolvers<ContextType = GraphQLContext, ParentType extends GraphqlResolversParentTypes['AIInsights'] = GraphqlResolversParentTypes['AIInsights']> = ResolversObject<{
  conditions?: Resolver<GraphqlResolversTypes['String'], ParentType, ContextType>;
  rating?: Resolver<GraphqlResolversTypes['Int'], ParentType, ContextType>;
  recommendations?: Resolver<Array<GraphqlResolversTypes['String']>, ParentType, ContextType>;
  risks?: Resolver<Array<GraphqlResolversTypes['String']>, ParentType, ContextType>;
  skillLevel?: Resolver<GraphqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GraphqlAiSummaryResolvers<ContextType = GraphQLContext, ParentType extends GraphqlResolversParentTypes['AISummary'] = GraphqlResolversParentTypes['AISummary']> = ResolversObject<{
  createdAt?: Resolver<GraphqlResolversTypes['DateTime'], ParentType, ContextType>;
  forecast?: Resolver<GraphqlResolversTypes['Forecast'], ParentType, ContextType>;
  forecastId?: Resolver<GraphqlResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<GraphqlResolversTypes['ID'], ParentType, ContextType>;
  modelInfo?: Resolver<GraphqlResolversTypes['JSON'], ParentType, ContextType>;
  spot?: Resolver<GraphqlResolversTypes['Spot'], ParentType, ContextType>;
  spotId?: Resolver<GraphqlResolversTypes['ID'], ParentType, ContextType>;
  structured?: Resolver<GraphqlResolversTypes['JSON'], ParentType, ContextType>;
  summary?: Resolver<GraphqlResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<GraphqlResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GraphqlDatabaseStatusResolvers<ContextType = GraphQLContext, ParentType extends GraphqlResolversParentTypes['DatabaseStatus'] = GraphqlResolversParentTypes['DatabaseStatus']> = ResolversObject<{
  connected?: Resolver<GraphqlResolversTypes['Boolean'], ParentType, ContextType>;
  error?: Resolver<Maybe<GraphqlResolversTypes['String']>, ParentType, ContextType>;
  responseTime?: Resolver<Maybe<GraphqlResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface GraphqlDateTimeScalarConfig extends GraphQLScalarTypeConfig<GraphqlResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type GraphqlFavoriteSpotResolvers<ContextType = GraphQLContext, ParentType extends GraphqlResolversParentTypes['FavoriteSpot'] = GraphqlResolversParentTypes['FavoriteSpot']> = ResolversObject<{
  createdAt?: Resolver<GraphqlResolversTypes['DateTime'], ParentType, ContextType>;
  notifyWhatsapp?: Resolver<GraphqlResolversTypes['Boolean'], ParentType, ContextType>;
  spot?: Resolver<GraphqlResolversTypes['Spot'], ParentType, ContextType>;
  spotId?: Resolver<GraphqlResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<GraphqlResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<GraphqlResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<GraphqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GraphqlForecastResolvers<ContextType = GraphQLContext, ParentType extends GraphqlResolversParentTypes['Forecast'] = GraphqlResolversParentTypes['Forecast']> = ResolversObject<{
  createdAt?: Resolver<GraphqlResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<GraphqlResolversTypes['ID'], ParentType, ContextType>;
  raw?: Resolver<GraphqlResolversTypes['JSON'], ParentType, ContextType>;
  source?: Resolver<GraphqlResolversTypes['String'], ParentType, ContextType>;
  spot?: Resolver<GraphqlResolversTypes['Spot'], ParentType, ContextType>;
  spotId?: Resolver<GraphqlResolversTypes['ID'], ParentType, ContextType>;
  summaries?: Resolver<Array<GraphqlResolversTypes['AISummary']>, ParentType, ContextType>;
  timestamp?: Resolver<GraphqlResolversTypes['DateTime'], ParentType, ContextType>;
  updatedAt?: Resolver<GraphqlResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface GraphqlJsonScalarConfig extends GraphQLScalarTypeConfig<GraphqlResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type GraphqlMutationResolvers<ContextType = GraphQLContext, ParentType extends GraphqlResolversParentTypes['Mutation'] = GraphqlResolversParentTypes['Mutation']> = ResolversObject<{
  _empty?: Resolver<Maybe<GraphqlResolversTypes['String']>, ParentType, ContextType>;
  addFavorite?: Resolver<GraphqlResolversTypes['FavoriteSpot'], ParentType, ContextType, RequireFields<GraphqlMutationAddFavoriteArgs, 'spotId'>>;
  createAISummary?: Resolver<GraphqlResolversTypes['AISummary'], ParentType, ContextType, RequireFields<GraphqlMutationCreateAiSummaryArgs, 'input'>>;
  createForecast?: Resolver<GraphqlResolversTypes['Forecast'], ParentType, ContextType, RequireFields<GraphqlMutationCreateForecastArgs, 'input'>>;
  createSpot?: Resolver<GraphqlResolversTypes['Spot'], ParentType, ContextType, RequireFields<GraphqlMutationCreateSpotArgs, 'input'>>;
  createUser?: Resolver<GraphqlResolversTypes['User'], ParentType, ContextType, RequireFields<GraphqlMutationCreateUserArgs, 'input'>>;
  deleteAISummary?: Resolver<GraphqlResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GraphqlMutationDeleteAiSummaryArgs, 'id'>>;
  deleteForecast?: Resolver<GraphqlResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GraphqlMutationDeleteForecastArgs, 'id'>>;
  deleteSpot?: Resolver<GraphqlResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GraphqlMutationDeleteSpotArgs, 'id'>>;
  deleteUser?: Resolver<GraphqlResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GraphqlMutationDeleteUserArgs, 'id'>>;
  removeFavorite?: Resolver<GraphqlResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GraphqlMutationRemoveFavoriteArgs, 'spotId'>>;
  updateFavorite?: Resolver<GraphqlResolversTypes['FavoriteSpot'], ParentType, ContextType, RequireFields<GraphqlMutationUpdateFavoriteArgs, 'notifyWhatsapp' | 'spotId'>>;
  updateForecast?: Resolver<GraphqlResolversTypes['Forecast'], ParentType, ContextType, RequireFields<GraphqlMutationUpdateForecastArgs, 'id' | 'input'>>;
  updateSpot?: Resolver<GraphqlResolversTypes['Spot'], ParentType, ContextType, RequireFields<GraphqlMutationUpdateSpotArgs, 'id' | 'input'>>;
  updateUser?: Resolver<GraphqlResolversTypes['User'], ParentType, ContextType, RequireFields<GraphqlMutationUpdateUserArgs, 'id' | 'input'>>;
}>;

export type GraphqlQueryResolvers<ContextType = GraphQLContext, ParentType extends GraphqlResolversParentTypes['Query'] = GraphqlResolversParentTypes['Query']> = ResolversObject<{
  _empty?: Resolver<Maybe<GraphqlResolversTypes['String']>, ParentType, ContextType>;
  aiSummary?: Resolver<Maybe<GraphqlResolversTypes['AISummary']>, ParentType, ContextType, RequireFields<GraphqlQueryAiSummaryArgs, 'id'>>;
  dbStatus?: Resolver<GraphqlResolversTypes['DatabaseStatus'], ParentType, ContextType>;
  favorites?: Resolver<Array<GraphqlResolversTypes['FavoriteSpot']>, ParentType, ContextType>;
  forecast?: Resolver<Maybe<GraphqlResolversTypes['Forecast']>, ParentType, ContextType, RequireFields<GraphqlQueryForecastArgs, 'id'>>;
  forecastsForSpot?: Resolver<Array<GraphqlResolversTypes['Forecast']>, ParentType, ContextType, RequireFields<GraphqlQueryForecastsForSpotArgs, 'spotId'>>;
  isFavorite?: Resolver<GraphqlResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GraphqlQueryIsFavoriteArgs, 'spotId'>>;
  latestAISummary?: Resolver<Maybe<GraphqlResolversTypes['AISummary']>, ParentType, ContextType, RequireFields<GraphqlQueryLatestAiSummaryArgs, 'spotId'>>;
  me?: Resolver<Maybe<GraphqlResolversTypes['User']>, ParentType, ContextType>;
  searchSpots?: Resolver<Array<GraphqlResolversTypes['Spot']>, ParentType, ContextType, RequireFields<GraphqlQuerySearchSpotsArgs, 'query'>>;
  spot?: Resolver<Maybe<GraphqlResolversTypes['Spot']>, ParentType, ContextType, RequireFields<GraphqlQuerySpotArgs, 'id'>>;
  spotBySlug?: Resolver<Maybe<GraphqlResolversTypes['Spot']>, ParentType, ContextType, RequireFields<GraphqlQuerySpotBySlugArgs, 'slug'>>;
  spots?: Resolver<Array<GraphqlResolversTypes['Spot']>, ParentType, ContextType>;
  user?: Resolver<Maybe<GraphqlResolversTypes['User']>, ParentType, ContextType, RequireFields<GraphqlQueryUserArgs, 'id'>>;
  userByEmail?: Resolver<Maybe<GraphqlResolversTypes['User']>, ParentType, ContextType, RequireFields<GraphqlQueryUserByEmailArgs, 'email'>>;
  users?: Resolver<Array<GraphqlResolversTypes['User']>, ParentType, ContextType>;
}>;

export type GraphqlSpotResolvers<ContextType = GraphQLContext, ParentType extends GraphqlResolversParentTypes['Spot'] = GraphqlResolversParentTypes['Spot']> = ResolversObject<{
  aiInsights?: Resolver<Maybe<GraphqlResolversTypes['AIInsights']>, ParentType, ContextType, Partial<GraphqlSpotAiInsightsArgs>>;
  aiSummary?: Resolver<Maybe<GraphqlResolversTypes['AISummary']>, ParentType, ContextType, Partial<GraphqlSpotAiSummaryArgs>>;
  createdAt?: Resolver<GraphqlResolversTypes['DateTime'], ParentType, ContextType>;
  forecast?: Resolver<Array<GraphqlResolversTypes['Forecast']>, ParentType, ContextType, RequireFields<GraphqlSpotForecastArgs, 'nextHours'>>;
  id?: Resolver<GraphqlResolversTypes['ID'], ParentType, ContextType>;
  lat?: Resolver<GraphqlResolversTypes['Float'], ParentType, ContextType>;
  lon?: Resolver<GraphqlResolversTypes['Float'], ParentType, ContextType>;
  meta?: Resolver<Maybe<GraphqlResolversTypes['JSON']>, ParentType, ContextType>;
  name?: Resolver<GraphqlResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<GraphqlResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<GraphqlResolversTypes['SpotType'], ParentType, ContextType>;
  updatedAt?: Resolver<GraphqlResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GraphqlSubscriptionResolvers<ContextType = GraphQLContext, ParentType extends GraphqlResolversParentTypes['Subscription'] = GraphqlResolversParentTypes['Subscription']> = ResolversObject<{
  _empty?: SubscriptionResolver<Maybe<GraphqlResolversTypes['String']>, "_empty", ParentType, ContextType>;
  favoriteUpdated?: SubscriptionResolver<GraphqlResolversTypes['FavoriteSpot'], "favoriteUpdated", ParentType, ContextType>;
  forecastUpdated?: SubscriptionResolver<GraphqlResolversTypes['Forecast'], "forecastUpdated", ParentType, ContextType, RequireFields<GraphqlSubscriptionForecastUpdatedArgs, 'spotId'>>;
}>;

export type GraphqlUserResolvers<ContextType = GraphQLContext, ParentType extends GraphqlResolversParentTypes['User'] = GraphqlResolversParentTypes['User']> = ResolversObject<{
  createdAt?: Resolver<GraphqlResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<GraphqlResolversTypes['String'], ParentType, ContextType>;
  favorites?: Resolver<Array<GraphqlResolversTypes['FavoriteSpot']>, ParentType, ContextType>;
  id?: Resolver<GraphqlResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<GraphqlResolversTypes['String']>, ParentType, ContextType>;
  phone?: Resolver<Maybe<GraphqlResolversTypes['String']>, ParentType, ContextType>;
  skillLevel?: Resolver<Maybe<GraphqlResolversTypes['UserSkillLevel']>, ParentType, ContextType>;
  updatedAt?: Resolver<GraphqlResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GraphqlResolvers<ContextType = GraphQLContext> = ResolversObject<{
  AIInsights?: GraphqlAiInsightsResolvers<ContextType>;
  AISummary?: GraphqlAiSummaryResolvers<ContextType>;
  DatabaseStatus?: GraphqlDatabaseStatusResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  FavoriteSpot?: GraphqlFavoriteSpotResolvers<ContextType>;
  Forecast?: GraphqlForecastResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Mutation?: GraphqlMutationResolvers<ContextType>;
  Query?: GraphqlQueryResolvers<ContextType>;
  Spot?: GraphqlSpotResolvers<ContextType>;
  Subscription?: GraphqlSubscriptionResolvers<ContextType>;
  User?: GraphqlUserResolvers<ContextType>;
}>;

