ALTER TABLE "chat" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "chat" ALTER COLUMN "createdAt" SET DEFAULT timezone('UTC', NOW());--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "createdAt" SET DEFAULT timezone('UTC', NOW());--> statement-breakpoint
ALTER TABLE "feature_flag" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "feature_flag" ALTER COLUMN "createdAt" SET DEFAULT timezone('UTC', NOW());--> statement-breakpoint
ALTER TABLE "integration" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "integration" ALTER COLUMN "createdAt" SET DEFAULT timezone('UTC', NOW());--> statement-breakpoint
ALTER TABLE "integration_key" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "integration_key" ALTER COLUMN "createdAt" SET DEFAULT timezone('UTC', NOW());--> statement-breakpoint
ALTER TABLE "member_invitations" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "member_invitations" ALTER COLUMN "createdAt" SET DEFAULT timezone('UTC', NOW());--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "createdAt" SET DEFAULT timezone('UTC', NOW());--> statement-breakpoint
ALTER TABLE "password_recovery_tokens" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "password_recovery_tokens" ALTER COLUMN "createdAt" SET DEFAULT timezone('UTC', NOW());--> statement-breakpoint
ALTER TABLE "tables_history" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tables_history" ALTER COLUMN "createdAt" SET DEFAULT timezone('UTC', NOW());--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "createdAt" SET DEFAULT timezone('UTC', NOW());--> statement-breakpoint
ALTER TABLE "webhook-events" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "webhook-events" ALTER COLUMN "createdAt" SET DEFAULT timezone('UTC', NOW());--> statement-breakpoint
ALTER TABLE "webhooks" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "webhooks" ALTER COLUMN "createdAt" SET DEFAULT timezone('UTC', NOW());--> statement-breakpoint
ALTER TABLE "workspace" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "workspace" ALTER COLUMN "createdAt" SET DEFAULT timezone('UTC', NOW());