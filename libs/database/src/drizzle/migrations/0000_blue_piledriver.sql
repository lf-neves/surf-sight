CREATE TYPE "public"."job_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."spot_type" AS ENUM('beach', 'reef', 'point', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_skill_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(255),
	"phone" varchar(50),
	"skill_level" "user_skill_level",
	"reset_token" varchar(255),
	"reset_token_expiry" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "spots" (
	"spot_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"lat" double precision NOT NULL,
	"lon" double precision NOT NULL,
	"type" "spot_type" NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "spots_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "forecasts" (
	"forecast_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"spot_id" uuid NOT NULL,
	"timestamp" timestamp NOT NULL,
	"raw" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source" varchar(50) DEFAULT 'stormglass' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "forecasts_spot_id_timestamp_key" UNIQUE("spot_id","timestamp")
);
--> statement-breakpoint
CREATE TABLE "ai_summaries" (
	"ai_summary_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"forecast_id" uuid NOT NULL,
	"spot_id" uuid NOT NULL,
	"summary" text NOT NULL,
	"structured" jsonb DEFAULT '{}'::jsonb,
	"model_info" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorite_spots" (
	"user_id" uuid NOT NULL,
	"spot_id" uuid NOT NULL,
	"notify_whatsapp" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_spots_user_id_spot_id_pk" PRIMARY KEY("user_id","spot_id")
);
--> statement-breakpoint
CREATE TABLE "job_events" (
	"job_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(100) NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb,
	"status" "job_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forecast_service_events" (
	"forecast_service_event_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"processing_status" "job_status" DEFAULT 'pending' NOT NULL,
	"retries" integer DEFAULT 0 NOT NULL,
	"enqueuer_aws_request_id" text,
	"processor_aws_request_ids" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "forecasts" ADD CONSTRAINT "forecasts_spot_id_spots_spot_id_fk" FOREIGN KEY ("spot_id") REFERENCES "public"."spots"("spot_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summaries" ADD CONSTRAINT "ai_summaries_forecast_id_forecasts_forecast_id_fk" FOREIGN KEY ("forecast_id") REFERENCES "public"."forecasts"("forecast_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summaries" ADD CONSTRAINT "ai_summaries_spot_id_spots_spot_id_fk" FOREIGN KEY ("spot_id") REFERENCES "public"."spots"("spot_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_spots" ADD CONSTRAINT "favorite_spots_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_spots" ADD CONSTRAINT "favorite_spots_spot_id_spots_spot_id_fk" FOREIGN KEY ("spot_id") REFERENCES "public"."spots"("spot_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "spots_slug_idx" ON "spots" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "spots_location_idx" ON "spots" USING btree ("lat","lon");--> statement-breakpoint
CREATE INDEX "forecasts_spot_id_idx" ON "forecasts" USING btree ("spot_id");--> statement-breakpoint
CREATE INDEX "forecasts_timestamp_idx" ON "forecasts" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "ai_summaries_spot_id_idx" ON "ai_summaries" USING btree ("spot_id");--> statement-breakpoint
CREATE INDEX "ai_summaries_forecast_id_idx" ON "ai_summaries" USING btree ("forecast_id");--> statement-breakpoint
CREATE INDEX "ai_summaries_created_at_idx" ON "ai_summaries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "favorite_spots_user_id_idx" ON "favorite_spots" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "favorite_spots_spot_id_idx" ON "favorite_spots" USING btree ("spot_id");--> statement-breakpoint
CREATE INDEX "job_events_status_idx" ON "job_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_events_type_idx" ON "job_events" USING btree ("type");--> statement-breakpoint
CREATE INDEX "job_events_created_at_idx" ON "job_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "forecast_service_events_processing_status_idx" ON "forecast_service_events" USING btree ("processing_status");--> statement-breakpoint
CREATE INDEX "forecast_service_events_event_type_idx" ON "forecast_service_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "forecast_service_events_created_at_idx" ON "forecast_service_events" USING btree ("created_at");