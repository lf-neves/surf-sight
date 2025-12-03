/**
 * @important Do not import directly from aws-sdk as this significantly increases the bundle size
 * and cold start times.
 */
/* eslint-disable import/no-extraneous-dependencies */
import type { Tracer } from '@aws-lambda-powertools/tracer';
import CloudFront from 'aws-sdk/clients/cloudfront';
import CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import IAM from 'aws-sdk/clients/iam';
import Lambda from 'aws-sdk/clients/lambda';
import S3 from 'aws-sdk/clients/s3';
import SecretsManager from 'aws-sdk/clients/secretsmanager';
import SESV2 from 'aws-sdk/clients/sesv2';
import SQS from 'aws-sdk/clients/sqs';
import SSM from 'aws-sdk/clients/ssm';
import StepFunctions from 'aws-sdk/clients/stepfunctions';

import { logger } from './logger';
import { tracer } from './tracer';

export const AWS = (() => {
  const registeredServices = {
    DynamoDB,
    S3,
    IAM,
    CognitoIdentityServiceProvider,
    SQS,
    SSM,
    SecretsManager,
    CloudFront,
    Lambda,
    StepFunctions,
    SESV2,
  };

  const serviceConstructorsCache: Partial<
    Record<keyof typeof registeredServices, unknown>
  > = {};
  const initializedServicesWithTracing: Record<string, unknown> = {};

  return new Proxy(
    {},
    {
      get(_target, serviceName: keyof typeof registeredServices) {
        const Service = registeredServices[serviceName];

        if (!Service) {
          throw new Error(
            `You first need to register ${serviceName} as a valid service in the modular AWS SDK.`
          );
        }

        // setup the service constructor cache for the service
        if (!serviceConstructorsCache[serviceName]) {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          serviceConstructorsCache[serviceName] =
            function _proxied_modular_aws_sdk_service() {
              return initializedServicesWithTracing[serviceName];
            };

          if (process.env.API_ENV !== 'test') {
            // @ts-expect-error this copies the static properties from the original service class
            Object.assign(serviceConstructorsCache[serviceName], Service);
          } else if (serviceName === 'DynamoDB') {
            /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
            // @ts-expect-error maybe there is a better solution for that?
            serviceConstructorsCache.DynamoDB.DocumentClient = jest.requireMock(
              'aws-sdk/clients/__DUMMY__'
            ).default;
            /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
          }
        }

        // if the service has already been initialized, then return the cached version
        if (initializedServicesWithTracing[serviceName]) {
          return serviceConstructorsCache[serviceName];
        }

        const service = new Service({ region: 'us-east-1' });

        if (process.env.API_ENV === 'test') {
          // @ts-expect-error this is a workaround to avoid type errors
          service.__SERVICE_NAME__ = serviceName;
        }

        initializedServicesWithTracing[serviceName] =
          tracer.captureAWSClient(service);

        return serviceConstructorsCache[serviceName];
      },
    }
  );
})() as {
  DynamoDB: typeof DynamoDB;
  S3: typeof S3;
  IAM: typeof IAM;
  CognitoIdentityServiceProvider: typeof CognitoIdentityServiceProvider;
  SQS: typeof SQS;
  SSM: typeof SSM;
  SecretsManager: typeof SecretsManager;
  CloudFront: typeof CloudFront;
  Lambda: typeof Lambda;
  StepFunctions: typeof StepFunctions;
  SESV2: typeof SESV2;
};

export function configureAWSXRaySdkProvider(provider: {
  setContextMissingStrategy: Tracer['provider']['setContextMissingStrategy'];
  setLogger: Tracer['provider']['setLogger'];
}) {
  // if running in the Lambda environment (i.e. not locally), then we want to log errors
  if (process.env.LAMBDA_TASK_ROOT) {
    provider.setContextMissingStrategy('LOG_ERROR');
  } else {
    provider.setContextMissingStrategy('IGNORE_ERROR');
  }

  provider.setLogger({
    error: (...args: unknown[]) => {
      // ignore subsegment too large to send errors, as they're not actionable: https://github.com/aws/aws-xray-sdk-node/issues/283
      if (
        typeof args[0] === 'string' &&
        /subsegment too large to send/i.test(args[0])
      ) {
        return logger;
      }

      return logger.error(...args);
    },
    warn: logger.warn.bind(logger),
    info: logger.info.bind(logger),
    debug: logger.debug.bind(logger),
  });
}
