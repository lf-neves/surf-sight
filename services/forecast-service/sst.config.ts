import { SSTConfig } from "sst";
import { Function, Cron } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "surf-sight-forecast-service",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      // Lambda function for syncing tides
      const syncTidesFunction = new Function(stack, "SyncTidesFunction", {
        handler: "src/handlers/syncTides.handler",
        runtime: "nodejs20.x",
        timeout: "5 minutes",
        memory: "512 MB",
        environment: {
          SPOT_SERVICE_URL: process.env.SPOT_SERVICE_URL || "",
          TIDE_PROVIDER_API_KEY: process.env.TIDE_PROVIDER_API_KEY || "",
          TIDE_PROVIDER_BASE_URL: process.env.TIDE_PROVIDER_BASE_URL || "",
          TIDE_SYNC_QUEUE_URL: process.env.TIDE_SYNC_QUEUE_URL || "",
        },
      });

      // EventBridge Cron schedule - runs every 6 hours
      // 00:00, 06:00, 12:00, 18:00 UTC
      new Cron(stack, "TideSyncCron", {
        schedule: "cron(0 0,6,12,18 * * ? *)", // Every 6 hours at minute 0
        job: syncTidesFunction,
      });

      stack.addOutputs({
        SyncTidesFunctionName: syncTidesFunction.functionName,
      });
    });
  },
} satisfies SSTConfig;
