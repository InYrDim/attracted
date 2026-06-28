ALTER TABLE "automation_rule" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "business" ADD COLUMN "onboarding_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "business" ADD COLUMN "onboarding_data" jsonb DEFAULT '{}'::jsonb NOT NULL;