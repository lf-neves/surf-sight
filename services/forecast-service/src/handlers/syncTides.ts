import { fetchAllSpots } from "../lib/httpClient";
import { sendMessagesBatch, TideSyncMessage } from "../lib/sqsClient";
import { HttpStatusCode, logger } from "@surf-sight/core";

interface EnvironmentVariables {
  SPOT_SERVICE_URL: string;
  TIDE_SYNC_QUEUE_URL: string;
}

/**
 * Lambda handler for syncing tide data for all spots
 * Runs every 6 hours via EventBridge Scheduler
 */
export async function handler(): Promise<{
  statusCode: number;
  body: string;
}> {
  const env = process.env as unknown as EnvironmentVariables;

  // Validate environment variables
  if (!env.SPOT_SERVICE_URL) {
    throw new Error("SPOT_SERVICE_URL environment variable is required.");
  }
  if (!env.TIDE_SYNC_QUEUE_URL) {
    throw new Error("TIDE_SYNC_QUEUE_URL environment variable is required.");
  }

  const startTime = Date.now();
  logger.info("Starting tide sync job.", {
    timestamp: new Date().toISOString(),
    spotServiceUrl: env.SPOT_SERVICE_URL,
  });

  try {
    // Fetch all spots
    const spots = await fetchAllSpots(env.SPOT_SERVICE_URL);
    logger.info(`Fetched ${spots.length} spots.`);

    if (spots.length === 0) {
      logger.info("No spots found, skipping sync.");
      return {
        statusCode: HttpStatusCode.OK,
        body: JSON.stringify({ message: "No spots to sync" }),
      };
    }

    // Prepare messages for SQS
    const messages: TideSyncMessage[] = spots
      .filter((spot) => spot.lat != null && spot.lng != null)
      .map((spot) => ({
        spotId: spot.id,
        lat: spot.lat,
        lng: spot.lng,
      }));

    // Filter out any spots that failed validation
    const invalidSpots = spots.filter(
      (spot) => spot.lat == null || spot.lng == null
    );
    if (invalidSpots.length > 0) {
      logger.info(
        `Skipping ${invalidSpots.length} spots with missing coordinates.`,
        {
          invalidSpotIds: invalidSpots.map((s) => s.id),
        }
      );
    }

    // Send messages to SQS in batches
    await sendMessagesBatch(env.TIDE_SYNC_QUEUE_URL, messages);

    const duration = Date.now() - startTime;
    logger.info("Tide sync job completed successfully.", {
      duration: `${duration}ms`,
      spotsProcessed: messages.length,
      spotsSkipped: invalidSpots.length,
    });

    return {
      statusCode: HttpStatusCode.OK,
      body: JSON.stringify({
        message: "Tide sync completed",
        spotsProcessed: messages.length,
        spotsSkipped: invalidSpots.length,
        duration: `${duration}ms`,
      }),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.info("Tide sync job failed.", {
      error: errorMessage,
      duration: `${duration}ms`,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return error response but don't throw - let AWS retries handle it
    return {
      statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({
        error: "Tide sync job failed.",
        message: errorMessage,
      }),
    };
  }
}
