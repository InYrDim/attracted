import { db } from "../src/db/drizzle";
import { business, channel, lead } from "../src/db/schema";
import { eq, desc } from "drizzle-orm";

async function runE2E() {
  console.log("🚀 Starting End-to-End Tracking & Webhook Test\n");

  // 1. Get first business and channel
  const testBusiness = await db.query.business.findFirst();
  if (!testBusiness) {
    console.error("❌ No business found in the database. Please create one in the dashboard first.");
    process.exit(1);
  }

  let testChannel = await db.query.channel.findFirst({
    where: eq(channel.businessId, testBusiness.id)
  });

  if (!testChannel) {
    console.log("⚠️ No channel found. Creating a dummy WhatsApp channel...");
    const newChannelId = `ch_${crypto.randomUUID()}`;
    await db.insert(channel).values({
      id: newChannelId,
      businessId: testBusiness.id,
      type: "whatsapp",
      name: "Test WA",
      config: { phoneNumberId: "123", accessToken: "abc" }
    });
    testChannel = await db.query.channel.findFirst({ where: eq(channel.id, newChannelId) });
  }

  console.log(`✅ Using Business: ${testBusiness.name} (${testBusiness.id})`);
  console.log(`✅ Using Channel: ${testChannel?.name} (${testChannel?.id})`);

  const mockIp = `192.168.1.${Math.floor(Math.random() * 255)}`;
  const mockFbclid = `IwAR_${Date.now()}`;

  // 2. Simulate Ad Click
  console.log(`\n🖱️  Simulating Meta Ad Click (fbclid: ${mockFbclid}) from IP: ${mockIp}`);
  
  const trackRes = await fetch("http://localhost:3000/api/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": mockIp,
    },
    body: JSON.stringify({
      b: testBusiness.id,
      fbclid: mockFbclid,
      utm_source: "facebook",
      utm_campaign: "black_friday_sale"
    })
  });

  if (trackRes.ok) {
    console.log("✅ Click successfully tracked!");
  } else {
    console.error("❌ Failed to track click:", await trackRes.text());
    process.exit(1);
  }

  // 3. Simulate WhatsApp Message (Webhook)
  console.log(`\n💬 Simulating Incoming WhatsApp Message from the same IP...`);
  
  const waPayload = {
    object: "whatsapp_business_account",
    entry: [{
      changes: [{
        value: {
          contacts: [{ profile: { name: "E2E Test User" }, wa_id: `62812${Math.floor(Math.random() * 1000000)}` }],
          messages: [{ id: `wam_${Date.now()}_${Math.random()}`, from: `62812${Math.floor(Math.random() * 1000000)}`, type: "text", text: { body: "I want to buy the summer bundle!" } }]
        }
      }]
    }]
  };

  const waRes = await fetch(`http://localhost:3000/api/webhooks/whatsapp/${testChannel?.id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": mockIp, // Match IP to test attribution
    },
    body: JSON.stringify(waPayload)
  });

  if (waRes.ok) {
    console.log("✅ Webhook processed successfully!");
  } else {
    console.error("❌ Failed to process webhook:", await waRes.text());
    process.exit(1);
  }

  // 4. Verify Attribution in DB
  console.log(`\n🔍 Verifying Lead Attribution in Database...`);
  const newLead = await db.query.lead.findFirst({
    where: eq(lead.businessId, testBusiness.id),
    orderBy: [desc(lead.createdAt)]
  });

  if (newLead && newLead.clickId === mockFbclid) {
    console.log(`🎉 SUCCESS! Lead "${newLead.name}" was perfectly attributed!`);
    console.log(`   Source: ${newLead.utmSource}`);
    console.log(`   Campaign: ${newLead.utmCampaign}`);
    console.log(`   Click ID: ${newLead.clickId}`);
  } else {
    console.log(`❌ Attribution failed. Lead clickId: ${newLead?.clickId}, Expected: ${mockFbclid}`);
  }

  process.exit(0);
}

runE2E();
