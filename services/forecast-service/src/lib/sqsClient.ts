import {
  SQSClient,
  SendMessageBatchCommand,
  SendMessageBatchRequestEntry,
} from "@aws-sdk/client-sqs";
import { logger } from "@surf-sight/core";

const sqsClient = new SQSClient({});

export interface TideSyncMessage {
  spotId: string;
  lat: number;
  lng: number;
}

const BATCH_SIZE = 10;

/**
 * Sends messages to SQS in batches of up to 10 messages
 */
export async function sendMessagesBatch(
  queueUrl: string,
  messages: TideSyncMessage[]
): Promise<void> {
  if (messages.length === 0) {
    return;
  }

  // Split messages into batches of 10
  const batches: TideSyncMessage[][] = [];
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    batches.push(messages.slice(i, i + BATCH_SIZE));
  }

  // Send each batch
  for (const batch of batches) {
    const entries: SendMessageBatchRequestEntry[] = batch.map(
      (message, index) => ({
        Id: `${index}`,
        MessageBody: JSON.stringify(message),
      })
    );

    try {
      const command = new SendMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: entries,
      });

      const response = await sqsClient.send(command);

      // Log any failed messages
      if (response.Failed && response.Failed.length > 0) {
        logger.info("Failed to send some messages.", {
          failed: response.Failed,
          queueUrl,
        });
      }

      if (response.Successful) {
        logger.info(
          `Successfully sent ${response.Successful.length} messages to SQS.`
        );
      }
    } catch (error) {
      logger.info("Error sending batch to SQS.", {
        error: error instanceof Error ? error.message : String(error),
        queueUrl,
        batchSize: batch.length,
      });
      // Re-throw to let AWS retries handle it
      throw error;
    }
  }
}
