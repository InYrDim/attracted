ALTER TABLE "business_member" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "business_member" ADD COLUMN "invited_email" text;