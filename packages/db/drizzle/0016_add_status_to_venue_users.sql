CREATE TYPE "venue_user_status" AS ENUM('joined', 'checking', 'completed', 'failed');
ALTER TABLE "venue_users" ADD COLUMN "status" "venue_user_status" NOT NULL DEFAULT 'joined';
