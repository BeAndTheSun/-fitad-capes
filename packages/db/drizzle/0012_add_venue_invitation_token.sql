ALTER TABLE "venue" ADD COLUMN "invitation_token" varchar(256);-->statement-breakpoint
ALTER TABLE "venue" ADD CONSTRAINT "venue_invitation_token_unique" UNIQUE("invitation_token");