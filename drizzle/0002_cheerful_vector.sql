CREATE TABLE "click_log" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"click_id" text,
	"ip_hash" text,
	"user_agent" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"matched_lead_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "click_log" ADD CONSTRAINT "click_log_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "click_log" ADD CONSTRAINT "click_log_matched_lead_id_lead_id_fk" FOREIGN KEY ("matched_lead_id") REFERENCES "public"."lead"("id") ON DELETE set null ON UPDATE no action;