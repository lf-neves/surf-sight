-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "SpotType" AS ENUM ('beach', 'reef', 'point', 'other');

-- CreateEnum
CREATE TYPE "UserSkillLevel" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateTable
CREATE TABLE "ai_summaries" (
    "aiSummaryId" UUID NOT NULL,
    "forecastId" UUID NOT NULL,
    "spotId" UUID NOT NULL,
    "summary" TEXT NOT NULL,
    "structured" JSONB NOT NULL DEFAULT '{}',
    "modelInfo" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_summaries_pkey" PRIMARY KEY ("aiSummaryId")
);

-- CreateTable
CREATE TABLE "favorite_spots" (
    "userId" UUID NOT NULL,
    "spotId" UUID NOT NULL,
    "notifyWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "favorite_spots_pkey" PRIMARY KEY ("userId","spotId")
);

-- CreateTable
CREATE TABLE "forecasts" (
    "forecastId" UUID NOT NULL,
    "spotId" UUID NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "raw" JSONB NOT NULL DEFAULT '{}',
    "source" TEXT NOT NULL DEFAULT 'stormglass',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forecasts_pkey" PRIMARY KEY ("forecastId")
);

-- CreateTable
CREATE TABLE "job_events" (
    "jobId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "status" "JobStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_events_pkey" PRIMARY KEY ("jobId")
);

-- CreateTable
CREATE TABLE "spots" (
    "spotId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "type" "SpotType" NOT NULL,
    "meta" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spots_pkey" PRIMARY KEY ("spotId")
);

-- CreateTable
CREATE TABLE "users" (
    "userId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "skillLevel" "UserSkillLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "ai_summaries_spotId_idx" ON "ai_summaries"("spotId");

-- CreateIndex
CREATE INDEX "ai_summaries_forecastId_idx" ON "ai_summaries"("forecastId");

-- CreateIndex
CREATE INDEX "ai_summaries_createdAt_idx" ON "ai_summaries"("createdAt");

-- CreateIndex
CREATE INDEX "favorite_spots_userId_idx" ON "favorite_spots"("userId");

-- CreateIndex
CREATE INDEX "favorite_spots_spotId_idx" ON "favorite_spots"("spotId");

-- CreateIndex
CREATE INDEX "forecasts_spotId_idx" ON "forecasts"("spotId");

-- CreateIndex
CREATE INDEX "forecasts_timestamp_idx" ON "forecasts"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "forecasts_spotId_timestamp_key" ON "forecasts"("spotId", "timestamp");

-- CreateIndex
CREATE INDEX "job_events_status_idx" ON "job_events"("status");

-- CreateIndex
CREATE INDEX "job_events_type_idx" ON "job_events"("type");

-- CreateIndex
CREATE INDEX "job_events_createdAt_idx" ON "job_events"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "spots_slug_key" ON "spots"("slug");

-- CreateIndex
CREATE INDEX "spots_slug_idx" ON "spots"("slug");

-- CreateIndex
CREATE INDEX "spots_lat_lon_idx" ON "spots"("lat", "lon");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- AddForeignKey
ALTER TABLE "ai_summaries" ADD CONSTRAINT "ai_summaries_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "forecasts"("forecastId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_summaries" ADD CONSTRAINT "ai_summaries_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "spots"("spotId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_spots" ADD CONSTRAINT "favorite_spots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_spots" ADD CONSTRAINT "favorite_spots_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "spots"("spotId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecasts" ADD CONSTRAINT "forecasts_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "spots"("spotId") ON DELETE CASCADE ON UPDATE CASCADE;
