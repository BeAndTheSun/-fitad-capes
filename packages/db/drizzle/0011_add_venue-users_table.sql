CREATE TABLE "venue_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"venueId" uuid NOT NULL,
	"comments" text
);

ALTER TABLE "venue_users" ADD CONSTRAINT "venue_users_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "venue_users" ADD CONSTRAINT "venue_users_venueId_venue_id_fk" FOREIGN KEY ("venueId") REFERENCES "public"."venue"("id") ON DELETE cascade ON UPDATE no action;