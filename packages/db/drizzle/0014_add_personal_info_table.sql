CREATE TABLE "personal_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT timezone('UTC', NOW()) NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" varchar(256),
	"phone_number" varchar(50),
	"fitness_goal" varchar(256),
	"sponsoring" varchar(256),
	CONSTRAINT "personal_info_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "personal_info" ADD CONSTRAINT "personal_info_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;