import type { Context, Handler } from 'aws-lambda';

import { AWS } from '../modular-aws-sdk';
import { logger } from '../logger';
import { syntheticUuid, uuid } from '../uuid';

const sqs = new AWS.SQS();

type SqsSendMessageReturn = ReturnType<
  ReturnType<typeof sqs.sendMessage>['promise']
>;

export async function sqsEnqueueWithLocalSupport({
  queueUrl,
  messageBody,
  delaySeconds,
  localHandler,
}: {
  queueUrl: string;
  messageBody: string;
  delaySeconds?: number;
  localHandler?: Promise<{ handler: Handler }> | undefined;
}): SqsSendMessageReturn {
  logger.info('Enqueuing SQS.Message to SQS.Queue[%s].', queueUrl, {
    messageBody,
    delaySeconds,
  });

  if (process.env.API_ENV === 'development') {
    if (!localHandler) {
      logger.info(
        'No local handler provided, skipping local simulation of SQS enqueue. Message will be ignored.',
        messageBody
      );

      return {
        MessageId: 'local-simulation-skipped',
      } as unknown as SqsSendMessageReturn;
    }

    const messageId = uuid();
    const resolvedLocalHandler = (await localHandler).handler;

    setImmediate(() => {
      void resolvedLocalHandler(
        {
          Records: [
            {
              messageId,
              body: messageBody,
            },
          ],
        },
        { awsRequestId: syntheticUuid() } as Context,
        () => {}
      );
    });

    logger.info(
      'Locally simulated enqueuing of SQS.Message[%s] to SQS.Queue[%s].',
      messageId,
      queueUrl,
      { messageBody, delaySeconds }
    );

    return { MessageId: messageId } as unknown as SqsSendMessageReturn;
  }

  const sqsSendMessageResponse = await sqs
    .sendMessage({
      QueueUrl: queueUrl,
      MessageBody: messageBody,
      DelaySeconds: delaySeconds,
    })
    .promise();

  logger.info(
    'Enqueued SQS.Message[%s] to SQS.Queue[%s].',
    sqsSendMessageResponse.MessageId,
    queueUrl,
    { messageBody, delaySeconds }
  );

  return sqsSendMessageResponse;
}
