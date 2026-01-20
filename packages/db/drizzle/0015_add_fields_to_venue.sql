ALTER TABLE "venue" ADD COLUMN IF NOT EXISTS "phone_number" varchar(128);
ALTER TABLE "venue" ADD COLUMN IF NOT EXISTS "company_website" varchar(256);
ALTER TABLE "venue" ADD COLUMN IF NOT EXISTS "superfit_menu_link" varchar(256);
ALTER TABLE "venue" ADD COLUMN IF NOT EXISTS "social_media_page" varchar(256);