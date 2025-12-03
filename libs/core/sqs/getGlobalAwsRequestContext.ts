import type { Context } from 'aws-lambda';
import { syntheticUuid } from '../uuid';

let globalAwsRequestContext: Context;

export function getGlobalAwsRequestContext(): Context {
  // add awsRequestId if it is missing, because it's required for events processing to work locally
  if (
    process.env.API_ENV === 'development' &&
    !globalAwsRequestContext?.awsRequestId
  ) {
    return {
      ...globalAwsRequestContext,
      // use syntheticUuid, so it's easy to identify that this is a ID that came forced from here
      awsRequestId: syntheticUuid(),
      functionName: 'local-dev',
      // 15 minutes, maximum Lambda timeout
      getRemainingTimeInMillis: () => 15 * 60 * 1000,
      invokedFunctionArn:
        'arn:aws:lambda:us-east-1:123456789012:function:local-dev',
    } as Context;
  }

  return globalAwsRequestContext;
}
