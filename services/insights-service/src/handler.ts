import type { SQSEvent, SQSRecord } from 'aws-lambda';
import { logger } from '@surf-sight/core';
import { runInsightGeneration } from '@surf-sight/api-service/insights';

type InsightJobBody = { spotId: string };

/**
 * Agents/insights worker: consumes insight jobs from the queue.
 * Delegates to api-service runInsightGeneration (load spot/forecast, OpenAI, save to DB).
 */
export async function handler(event: SQSEvent): Promise<void> {
  for (const record of event.Records) {
    await processRecord(record);
  }
}

async function processRecord(record: SQSRecord): Promise<void> {
  const body = JSON.parse(record.body) as InsightJobBody;
  const { spotId } = body;

  if (!spotId) {
    logger.warn('[processInsightJob] Message missing spotId', { body });
    return;
  }

  try {
    await runInsightGeneration(spotId);
  } catch (error) {
    logger.error('[processInsightJob] Failed to generate insights', { spotId, error });
    throw error;
  }
}
