/*
  Warnings:

  - Changed the type of `eventType` on the `forecast_service_events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ForecastServiceEventType" AS ENUM ('FORECASTS_UPDATE_ENQUEUED');

-- AlterTable
ALTER TABLE "forecast_service_events" DROP COLUMN "eventType",
ADD COLUMN     "eventType" "ForecastServiceEventType" NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "forecast_service_events_eventType_idx" ON "forecast_service_events"("eventType");
