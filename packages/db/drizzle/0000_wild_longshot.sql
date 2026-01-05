CREATE EXTENSION vector;
CREATE TYPE "public"."platform" AS ENUM('zapier', 'shopify');--> statement-breakpoint
CREATE TYPE "public"."keyName" AS ENUM('WEBHOOK_URL', 'API_KEY', 'SHOPIFY_URL', 'SHOPIFY_ACCESS_TOKEN');--> statement-breakpoint
CREATE TYPE "public"."direction" AS ENUM('outgoing', 'inbound');--> statement-breakpoint
CREATE TYPE "public"."table_actions" AS ENUM('create', 'update', 'delete', 'enable', 'disable', 'invite');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'member', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."event_table_name" AS ENUM('feature_flag', 'member_invitation', 'password_recovery_token', 'user_feature_flag', 'user_workspace', 'user', 'workspace', 'workspace_profile');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('create', 'update', 'delete', 'enable', 'disable', 'invite');--> statement-breakpoint
CREATE TYPE "public"."platform_event_type" AS ENUM('ZAPIER_EVENT');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('success', 'failure', 'pending', 'error', 'not_found');--> statement-breakpoint
CREATE TABLE "chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"workspaceId" uuid,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"workspaceId" uuid,
	"tableName" text NOT NULL,
	"rowId" uuid NOT NULL,
	"data" jsonb NOT NULL,
	"embedding" vector(1536) NOT NULL,
	CONSTRAINT "embeddings_tableName_rowId_unique" UNIQUE("tableName","rowId")
);
--> statement-breakpoint
CREATE TABLE "feature_flag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"flag" varchar(64) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"released" boolean DEFAULT false NOT NULL,
	"workspaceId" uuid NOT NULL,
	CONSTRAINT "feature_flag_workspaceId_flag_unique" UNIQUE("workspaceId","flag")
);
--> statement-breakpoint
CREATE TABLE "integration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"platform" "platform" NOT NULL,
	"enabled" boolean NOT NULL,
	"workspaceId" uuid NOT NULL,
	CONSTRAINT "integration_platform_workspaceId_unique" UNIQUE("platform","workspaceId")
);
--> statement-breakpoint
CREATE TABLE "integration_key" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"name" "keyName" NOT NULL,
	"value" text NOT NULL,
	"keyName" "keyName" NOT NULL,
	"integrationId" uuid NOT NULL,
	CONSTRAINT "integration_key_name_integrationId_unique" UNIQUE("name","integrationId")
);
--> statement-breakpoint
CREATE TABLE "member_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"token" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"role" "role" DEFAULT 'member' NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"userId" uuid,
	"workspaceId" uuid NOT NULL,
	CONSTRAINT "member_invitations_token_unique" UNIQUE("token"),
	CONSTRAINT "unique_email_workspace" UNIQUE("email","workspaceId")
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"chatId" uuid NOT NULL,
	"direction" "direction" NOT NULL,
	"userId" uuid,
	"senderId" uuid,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_recovery_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" varchar(256) NOT NULL,
	"used" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tables_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"userId" uuid NOT NULL,
	"workspaceId" uuid,
	"action" "table_actions" NOT NULL,
	"tableName" varchar NOT NULL,
	"actionDescription" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_feature_flags" (
	"userId" uuid NOT NULL,
	"featureFlagId" uuid NOT NULL,
	"released" boolean NOT NULL,
	CONSTRAINT "user_feature_flags_userId_featureFlagId_pk" PRIMARY KEY("userId","featureFlagId")
);
--> statement-breakpoint
CREATE TABLE "user_workspaces" (
	"userId" uuid NOT NULL,
	"workspaceId" uuid NOT NULL,
	"role" "role" DEFAULT 'member' NOT NULL,
	CONSTRAINT "user_workspaces_userId_workspaceId_pk" PRIMARY KEY("userId","workspaceId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"email" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	"active" boolean NOT NULL,
	"password" varchar(256) NOT NULL,
	"is2faEnabled" boolean DEFAULT false NOT NULL,
	"secret2fa" varchar(256),
	"profileImage" text,
	"isSuperAdmin" boolean DEFAULT false NOT NULL,
	"gtmId" varchar DEFAULT '',
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"platformEventType" "platform_event_type",
	"targetUrl" text NOT NULL,
	"payload" jsonb NOT NULL,
	"response" jsonb,
	"status" "status" NOT NULL,
	"errorMessage" text,
	"platform" "platform" NOT NULL,
	"eventType" "event_type" NOT NULL,
	"eventTableName" "event_table_name" NOT NULL,
	"workspaceId" uuid NOT NULL,
	"integrationKeyId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"name" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_profile" (
	"workspace_id" uuid NOT NULL,
	"description" text NOT NULL,
	"logoFile" varchar(256) NOT NULL,
	"instagramUrl" varchar(256),
	"facebookUrl" varchar(256),
	"companyUrl" varchar(256),
	"linkedinUrl" varchar(256),
	CONSTRAINT "workspace_profile_workspace_id_pk" PRIMARY KEY("workspace_id")
);
--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flag" ADD CONSTRAINT "feature_flag_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration" ADD CONSTRAINT "integration_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_key" ADD CONSTRAINT "integration_key_integrationId_integration_id_fk" FOREIGN KEY ("integrationId") REFERENCES "public"."integration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_invitations" ADD CONSTRAINT "member_invitations_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_invitations" ADD CONSTRAINT "member_invitations_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_chatId_chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_recovery_tokens" ADD CONSTRAINT "password_recovery_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tables_history" ADD CONSTRAINT "tables_history_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tables_history" ADD CONSTRAINT "tables_history_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_feature_flags" ADD CONSTRAINT "user_feature_flags_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_feature_flags" ADD CONSTRAINT "user_feature_flags_featureFlagId_feature_flag_id_fk" FOREIGN KEY ("featureFlagId") REFERENCES "public"."feature_flag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_workspaces" ADD CONSTRAINT "user_workspaces_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_workspaces" ADD CONSTRAINT "user_workspaces_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_integrationKeyId_integration_key_id_fk" FOREIGN KEY ("integrationKeyId") REFERENCES "public"."integration_key"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_profile" ADD CONSTRAINT "workspace_profile_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "embeddings_embedding_index" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops);