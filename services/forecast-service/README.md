# Forecast Service - Tide Sync Cron Job

This service contains a scheduled Lambda function that periodically syncs tide data for all surf spots.

## 🏗️ Architecture

- **AWS Lambda**: Serverless function that runs the sync job
- **EventBridge Scheduler**: Triggers the Lambda every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
- **AWS SQS**: Queue where tide sync messages are enqueued (`tide-sync-queue`)
- **Node.js/TypeScript**: Runtime and language

## 📁 Project Structure

```
services/forecast-service/
├── src/
│   ├── handlers/
│   │   └── syncTides.ts          # Lambda handler
│   └── lib/
│       ├── httpClient.ts         # HTTP client for fetching spots
│       └── sqsClient.ts          # SQS client for enqueueing messages
├── sst.config.ts                 # SST infrastructure configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Setup

### Prerequisites

- Node.js 20.x or later
- pnpm (or npm/yarn)
- AWS CLI configured with appropriate credentials
- SST CLI installed globally: `npm install -g sst`

### Installation

```bash
cd services/forecast-service
pnpm install
```

## 🔐 Environment Variables

The following environment variables must be set:

| Variable                 | Description                           | Example                                                         |
| ------------------------ | ------------------------------------- | --------------------------------------------------------------- |
| `SPOT_SERVICE_URL`       | Base URL of the spot service API      | `https://api.example.com`                                       |
| `TIDE_PROVIDER_API_KEY`  | API key for the tide provider service | `your-api-key`                                                  |
| `TIDE_PROVIDER_BASE_URL` | Base URL of the tide provider API     | `https://tide-api.example.com`                                  |
| `TIDE_SYNC_QUEUE_URL`    | SQS queue URL for tide sync messages  | `https://sqs.us-east-1.amazonaws.com/123456789/tide-sync-queue` |

### Setting Environment Variables

#### For Local Development

Create a `.env` file in the project root:

```env
SPOT_SERVICE_URL=https://api.example.com
TIDE_PROVIDER_API_KEY=your-api-key
TIDE_PROVIDER_BASE_URL=https://tide-api.example.com
TIDE_SYNC_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/tide-sync-queue
```

#### For Deployment

Set environment variables in your deployment environment or pass them during SST deployment:

```bash
export SPOT_SERVICE_URL=https://api.example.com
export TIDE_PROVIDER_API_KEY=your-api-key
export TIDE_PROVIDER_BASE_URL=https://tide-api.example.com
export TIDE_SYNC_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/tide-sync-queue
```

## 🚀 Deployment

### Deploy to AWS

```bash
# Build the project
pnpm build

# Deploy with SST
pnpm deploy
```

Or using SST directly:

```bash
sst deploy
```

### Development Mode

Run in development mode with live reloading:

```bash
pnpm dev
```

## 🔄 How It Works

1. **Scheduled Trigger**: EventBridge Scheduler triggers the Lambda function every 6 hours at:

   - 00:00 UTC
   - 06:00 UTC
   - 12:00 UTC
   - 18:00 UTC

2. **Fetch Spots**: The handler fetches all spots from `SPOT_SERVICE_URL/api/spots`

3. **Enqueue Messages**: For each spot, a message is enqueued to the SQS queue with:

   ```json
   {
     "spotId": "string",
     "lat": 0.0,
     "lng": 0.0
   }
   ```

4. **Batch Processing**: Messages are sent in batches of 10 (SQS maximum) for efficiency

5. **Error Handling**:
   - Failures on individual spots don't stop the entire sync
   - Structured error logging for debugging
   - AWS retries handle external request failures

## 📊 Monitoring

The Lambda function logs structured JSON for:

- Job start/completion
- Number of spots processed
- Errors and failures
- Duration metrics

View logs in CloudWatch Logs under the function name.

## 🧪 Testing

### Type Checking

```bash
pnpm type-check
```

### Build

```bash
pnpm build
```

## 📝 Notes

- The SQS queue (`tide-sync-queue`) must exist before deployment
- Ensure the Lambda execution role has permissions to:
  - Send messages to the SQS queue
  - Write CloudWatch Logs
- The function has a 5-minute timeout and 512 MB memory allocation
- Spots without valid coordinates (lat/lng) are automatically skipped
