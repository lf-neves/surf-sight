-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateTable
CREATE TABLE "forecast_service_events" (
    "forecastServiceEventId" UUID NOT NULL,
    "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'pending',
    "payload" JSONB NOT NULL DEFAULT '{}',
    "retries" INTEGER NOT NULL DEFAULT 0,
    "eventType" TEXT NOT NULL,
    "enqueuerAwsRequestId" VARCHAR(255),
    "processorAwsRequestIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forecast_service_events_pkey" PRIMARY KEY ("forecastServiceEventId")
);

-- CreateIndex
CREATE INDEX "forecast_service_events_processingStatus_idx" ON "forecast_service_events"("processingStatus");

-- CreateIndex
CREATE INDEX "forecast_service_events_eventType_idx" ON "forecast_service_events"("eventType");

-- CreateIndex
CREATE INDEX "forecast_service_events_createdAt_idx" ON "forecast_service_events"("createdAt");
