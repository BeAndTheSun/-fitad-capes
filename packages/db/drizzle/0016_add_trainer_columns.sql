ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trainerName" varchar(256);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trainerPhone" varchar(64);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trainerEmail" varchar(256);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trainerAddress" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trainerSocialUrl" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trainerBio" text;
