import { db } from "../src/db/drizzle";
import { channel } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const ch = await db.query.channel.findFirst({
    where: eq(channel.type, "webform")
  });

  if (!ch) {
    console.log("No webform channel found.");
    return;
  }

  const endpoint = `http://localhost:3000/api/forms/${ch.id}/submit`;
  console.log(`Submitting to: ${endpoint}`);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: "Test User",
      phone: "1234567890",
      email: ""
    })
  });

  console.log("Status:", res.status);
  console.log("Response:", await res.text());
}

run().catch(console.error);
