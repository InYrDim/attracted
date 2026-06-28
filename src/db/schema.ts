import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, jsonb, pgEnum, integer } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const memberRoleEnum = pgEnum("member_role", ["owner", "admin", "agent"]);
export const leadStatusEnum = pgEnum("lead_status", ["new_lead", "contacted", "interested", "order", "delivered", "lost"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "shipped", "delivered", "cancelled"]);
export const channelTypeEnum = pgEnum("channel_type", ["whatsapp", "instagram", "tiktok", "webform"]);
export const adPlatformEnum = pgEnum("ad_platform", ["meta", "tiktok", "google"]);
export const senderTypeEnum = pgEnum("sender_type", ["lead", "agent", "system"]);
export const actionTypeEnum = pgEnum("action_type", ["send_message", "assign_agent", "notify", "change_status"]);

export const business = pgTable("business", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  plan: text("plan").default("Starter").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businessMember = pgTable("business_member", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => business.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: memberRoleEnum("role").default("agent").notNull(),
  invitedAt: timestamp("invited_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

export const product = pgTable("product", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => business.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: integer("base_price").notNull(),
  variants: jsonb("variants"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const channel = pgTable("channel", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => business.id, { onDelete: "cascade" }),
  type: channelTypeEnum("type").notNull(),
  name: text("name").notNull(),
  config: jsonb("config"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adAccount = pgTable("ad_account", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => business.id, { onDelete: "cascade" }),
  platform: adPlatformEnum("platform").notNull(),
  accountId: text("account_id").notNull(),
  accessToken: text("access_token"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adCampaign = pgTable("ad_campaign", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => business.id, { onDelete: "cascade" }),
  adAccountId: text("ad_account_id").notNull().references(() => adAccount.id, { onDelete: "cascade" }),
  platformCampaignId: text("platform_campaign_id").notNull(),
  name: text("name").notNull(),
  status: text("status"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lead = pgTable("lead", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => business.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  channelId: text("channel_id").notNull().references(() => channel.id, { onDelete: "restrict" }),
  adId: text("ad_id"),
  clickId: text("click_id"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmContent: text("utm_content"),
  status: leadStatusEnum("status").default("new_lead").notNull(),
  assignedAgentId: text("assigned_agent_id").references(() => businessMember.id, { onDelete: "set null" }),
  firstRespondedAt: timestamp("first_responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const order = pgTable("order", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => business.id, { onDelete: "cascade" }),
  leadId: text("lead_id").notNull().references(() => lead.id, { onDelete: "restrict" }),
  agentId: text("agent_id").references(() => businessMember.id, { onDelete: "set null" }),
  items: jsonb("items").notNull(),
  totalPrice: integer("total_price").notNull(),
  shippingAddress: text("shipping_address"),
  shippingCourier: text("shipping_courier"),
  trackingNumber: text("tracking_number"),
  status: orderStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const conversation = pgTable("conversation", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => business.id, { onDelete: "cascade" }),
  leadId: text("lead_id").notNull().references(() => lead.id, { onDelete: "cascade" }),
  channelId: text("channel_id").notNull().references(() => channel.id, { onDelete: "restrict" }),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const message = pgTable("message", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull().references(() => conversation.id, { onDelete: "cascade" }),
  senderType: senderTypeEnum("sender_type").notNull(),
  content: text("content"),
  attachments: jsonb("attachments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const automationRule = pgTable("automation_rule", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => business.id, { onDelete: "cascade" }),
  trigger: text("trigger").notNull(),
  conditions: jsonb("conditions"),
  actionType: actionTypeEnum("action_type").notNull(),
  actionConfig: jsonb("action_config"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clickLog = pgTable("click_log", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => business.id, { onDelete: "cascade" }),
  clickId: text("click_id"),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  matchedLeadId: text("matched_lead_id").references(() => lead.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const businessRelations = relations(business, ({ one, many }) => ({
  owner: one(user, {
    fields: [business.ownerId],
    references: [user.id],
  }),
  members: many(businessMember),
  products: many(product),
  leads: many(lead),
  orders: many(order),
  channels: many(channel),
  adAccounts: many(adAccount),
  automationRules: many(automationRule),
  adCampaigns: many(adCampaign),
  clickLogs: many(clickLog),
}));

export const businessMemberRelations = relations(businessMember, ({ one, many }) => ({
  business: one(business, {
    fields: [businessMember.businessId],
    references: [business.id],
  }),
  user: one(user, {
    fields: [businessMember.userId],
    references: [user.id],
  }),
  assignedLeads: many(lead),
  orders: many(order),
}));

export const productRelations = relations(product, ({ one }) => ({
  business: one(business, {
    fields: [product.businessId],
    references: [business.id],
  }),
}));

export const channelRelations = relations(channel, ({ one, many }) => ({
  business: one(business, {
    fields: [channel.businessId],
    references: [business.id],
  }),
  leads: many(lead),
  conversations: many(conversation),
}));

export const leadRelations = relations(lead, ({ one, many }) => ({
  business: one(business, {
    fields: [lead.businessId],
    references: [business.id],
  }),
  channel: one(channel, {
    fields: [lead.channelId],
    references: [channel.id],
  }),
  assignedAgent: one(businessMember, {
    fields: [lead.assignedAgentId],
    references: [businessMember.id],
  }),
  orders: many(order),
  conversation: one(conversation, {
    fields: [lead.id],
    references: [conversation.leadId],
  }),
  clickLogs: many(clickLog),
}));

export const orderRelations = relations(order, ({ one }) => ({
  business: one(business, {
    fields: [order.businessId],
    references: [business.id],
  }),
  lead: one(lead, {
    fields: [order.leadId],
    references: [lead.id],
  }),
  agent: one(businessMember, {
    fields: [order.agentId],
    references: [businessMember.id],
  }),
}));

export const conversationRelations = relations(conversation, ({ one, many }) => ({
  business: one(business, {
    fields: [conversation.businessId],
    references: [business.id],
  }),
  lead: one(lead, {
    fields: [conversation.leadId],
    references: [lead.id],
  }),
  channel: one(channel, {
    fields: [conversation.channelId],
    references: [channel.id],
  }),
  messages: many(message),
}));

export const messageRelations = relations(message, ({ one }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
}));

export const adAccountRelations = relations(adAccount, ({ one, many }) => ({
  business: one(business, {
    fields: [adAccount.businessId],
    references: [business.id],
  }),
  campaigns: many(adCampaign),
}));

export const adCampaignRelations = relations(adCampaign, ({ one }) => ({
  business: one(business, {
    fields: [adCampaign.businessId],
    references: [business.id],
  }),
  adAccount: one(adAccount, {
    fields: [adCampaign.adAccountId],
    references: [adAccount.id],
  }),
}));

export const automationRuleRelations = relations(automationRule, ({ one }) => ({
  business: one(business, {
    fields: [automationRule.businessId],
    references: [business.id],
  }),
}));

export const clickLogRelations = relations(clickLog, ({ one }) => ({
  business: one(business, {
    fields: [clickLog.businessId],
    references: [business.id],
  }),
  matchedLead: one(lead, {
    fields: [clickLog.matchedLeadId],
    references: [lead.id],
  }),
}));
