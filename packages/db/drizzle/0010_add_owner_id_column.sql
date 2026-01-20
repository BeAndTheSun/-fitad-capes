ALTER TABLE "venue" ADD COLUMN IF NOT EXISTS "ownerId" uuid;
ALTER TABLE "venue" ADD COLUMN IF NOT EXISTS "createdAt" timestamp with time zone DEFAULT timezone('UTC', NOW()) NOT NULL;
ALTER TABLE "venue" ADD CONSTRAINT "venue_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
