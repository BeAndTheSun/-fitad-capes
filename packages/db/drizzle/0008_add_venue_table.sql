CREATE TABLE IF NOT EXISTS "venue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('UTC'::text, now()) NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"logo_file" varchar(256),
	"brand_color" varchar(7),
	"address" varchar(256),
	"city" varchar(128),
	"country" varchar(128)
);
