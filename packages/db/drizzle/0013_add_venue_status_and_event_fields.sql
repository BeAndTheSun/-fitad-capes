CREATE TYPE "public"."venue_user_status" AS ENUM('joined', 'checking', 'completed', 'failed');--> statement-breakpoint
ALTER TABLE "venue" ADD COLUMN "isActive" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "venue" ADD COLUMN "start_event_time" timestamp;--> statement-breakpoint
ALTER TABLE "venue" ADD COLUMN "end_event_time" timestamp;--> statement-breakpoint
ALTER TABLE "venue" ADD COLUMN "checking_token" varchar(256);--> statement-breakpoint
ALTER TABLE "venue_users" ADD COLUMN "status" "venue_user_status" DEFAULT 'joined' NOT NULL;--> statement-breakpoint
ALTER TABLE "venue" ADD CONSTRAINT "venue_checking_token_unique" UNIQUE("checking_token");