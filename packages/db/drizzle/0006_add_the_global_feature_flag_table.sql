CREATE TABLE "global_feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT timezone('UTC', NOW()) NOT NULL,
	"flag" varchar(64) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"released" boolean DEFAULT false NOT NULL,
	"allowWorkspaceControl" boolean DEFAULT false NOT NULL,
	CONSTRAINT "global_feature_flags_flag_unique" UNIQUE("flag")
);
--> statement-breakpoint
-- ALTER TABLE "feature_flag" DROP CONSTRAINT "feature_flag_workspaceId_flag_unique";--> statement-breakpoint
ALTER TABLE "feature_flag" ADD COLUMN "globalFeatureFlagId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "feature_flag" ADD CONSTRAINT "feature_flag_globalFeatureFlagId_global_feature_flags_id_fk" FOREIGN KEY ("globalFeatureFlagId") REFERENCES "public"."global_feature_flags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flag" ADD CONSTRAINT "feature_flag_workspaceId_globalFeatureFlagId_unique" UNIQUE("workspaceId","globalFeatureFlagId");

INSERT INTO "global_feature_flags" ("flag", "description", "released", "allowWorkspaceControl") VALUES
('REPORTS_MODULE', 'Module for generating reports.', false, false),
('HISTORY_MODULE', 'Module that displays a chronological history of user actions, updates, and system events.', false, false),
('CHATS_MODULE', 'Interactive chat module that allows users to ask questions about the workspace and receive automated or real-time assistance through AI.', false, false),
('MEMBERS_MANAGEMENT', 'Module for managing workspace members, including member information and role assignment.', false, false),
('WEBHOOKS_MODULE', 'Module for configuring webhooks to send selected application events to external services.', false, false),
('INTEGRATIONS_MODULE', 'Module that enables integration of the workspace with third-party platforms.', false, false),
('TWO_FACTOR_AUTH', 'Security module that allows enabling two-factor authentication (2FA) during login.', false, false)
ON CONFLICT ("flag") DO NOTHING;