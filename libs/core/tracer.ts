import { Tracer } from '@aws-lambda-powertools/tracer';

export const tracer = new Tracer({ serviceName: process.env.SERVICE_NAME });

tracer.provider.setContextMissingStrategy('LOG_ERROR');
