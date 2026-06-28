import { InferSelectModel } from "drizzle-orm";
import * as schema from "@/db/schema";
import * as authSchema from "@/db/auth-schema";

// Base Models
export type Product = InferSelectModel<typeof schema.product>;
export type Lead = InferSelectModel<typeof schema.lead>;
export type Order = InferSelectModel<typeof schema.order>;
export type Channel = InferSelectModel<typeof schema.channel>;
export type Conversation = InferSelectModel<typeof schema.conversation>;
export type Message = InferSelectModel<typeof schema.message>;
export type BusinessMember = InferSelectModel<typeof schema.businessMember>;
export type User = InferSelectModel<typeof authSchema.user>;
export type AdAccount = InferSelectModel<typeof schema.adAccount>;
export type AdCampaign = InferSelectModel<typeof schema.adCampaign>;
export type AutomationRule = InferSelectModel<typeof schema.automationRule>;

// Extended Relational Models
export type LeadWithRelations = Lead & {
  channel?: Channel;
  assignedAgent?: (BusinessMember & { user: User }) | null;
  orders?: Order[];
};

export type ConversationWithRelations = Conversation & {
  lead?: Lead;
  channel?: Channel;
  messages?: Message[];
};
