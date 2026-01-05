CREATE TABLE "webhook-events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"targetUrl" text NOT NULL,
	"payload" jsonb NOT NULL,
	"response" jsonb,
	"status" "status" NOT NULL,
	"errorMessage" text,
	"platform" text NOT NULL,
	"eventType" "event_type" NOT NULL,
	"eventTableName" "event_table_name" NOT NULL,
	"workspaceId" uuid NOT NULL,
	"webhookId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "webhooks" DROP CONSTRAINT "webhooks_integrationKeyId_integration_key_id_fk";
--> statement-breakpoint
ALTER TABLE "webhooks" ALTER COLUMN "platform" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "webhooks" ADD COLUMN "url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "webhook-events" ADD CONSTRAINT "webhook-events_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook-events" ADD CONSTRAINT "webhook-events_webhookId_webhooks_id_fk" FOREIGN KEY ("webhookId") REFERENCES "public"."webhooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" DROP COLUMN "platformEventType";--> statement-breakpoint
ALTER TABLE "webhooks" DROP COLUMN "targetUrl";--> statement-breakpoint
ALTER TABLE "webhooks" DROP COLUMN "payload";--> statement-breakpoint
ALTER TABLE "webhooks" DROP COLUMN "response";--> statement-breakpoint
ALTER TABLE "webhooks" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "webhooks" DROP COLUMN "errorMessage";--> statement-breakpoint
ALTER TABLE "webhooks" DROP COLUMN "eventType";--> statement-breakpoint
ALTER TABLE "webhooks" DROP COLUMN "eventTableName";--> statement-breakpoint
ALTER TABLE "webhooks" DROP COLUMN "integrationKeyId";--> statement-breakpoint
DROP TYPE "public"."platform_event_type";
