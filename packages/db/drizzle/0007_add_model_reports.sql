CREATE TYPE "public"."report_status" AS ENUM('pending', 'done');--> statement-breakpoint
ALTER TYPE "public"."event_table_name" ADD VALUE 'reports';--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT timezone('UTC', NOW()) NOT NULL,
	"name" varchar(256) NOT NULL,
	"workspace_id" uuid NOT NULL,
	"downloadUrl" varchar(256),
	"from" timestamp NOT NULL,
	"to" timestamp NOT NULL,
	"report_status" "report_status" DEFAULT 'pending',
	"exportedTable" varchar(256) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "public"."message" ALTER COLUMN "direction" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."direction";--> statement-breakpoint
CREATE TYPE "public"."direction" AS ENUM('inbound', 'outgoing');--> statement-breakpoint
ALTER TABLE "public"."message" ALTER COLUMN "direction" SET DATA TYPE "public"."direction" USING "direction"::"public"."direction";