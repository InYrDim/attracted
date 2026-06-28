import { POST } from "../src/app/api/webhooks/whatsapp/[channelId]/route";

async function run() {
  const channelId = "ch_7b71409c-051f-4365-833c-fa4862b72941"; // from the test output
  
  const req = new Request(`http://localhost/api/webhooks/whatsapp/${channelId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": "192.168.1.220",
    },
    body: JSON.stringify({
      object: "whatsapp_business_account",
      entry: [{
        changes: [{
          value: {
            contacts: [{ profile: { name: "E2E Test User" }, wa_id: "628123456789" }],
            messages: [{ id: "wamessage123", from: "628123456789", type: "text", text: { body: "I want to buy!" } }]
          }
        }]
      }]
    })
  });

  const res = await POST(req, { params: Promise.resolve({ channelId }) });
  console.log("Response status:", res.status);
  console.log("Response text:", await res.text());
}

run().catch(console.error);
