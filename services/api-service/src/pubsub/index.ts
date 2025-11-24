import { PubSub } from "graphql-subscriptions";

/**
 * In-memory PubSub implementation
 *
 * This is designed to be easily replaceable with RedisPubSub later.
 * To swap implementations, simply replace this file's contents
 * or export a different pubsub instance.
 */
export const pubsub = new PubSub();
