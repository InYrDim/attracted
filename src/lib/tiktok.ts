interface SendTikTokMessageParams {
  ttAccountId: string;
  accessToken: string;
  to: string;
  text: string;
}

export async function sendTikTokMessage({ ttAccountId, accessToken, to, text }: SendTikTokMessageParams) {
  // TikTok Messaging API Endpoint (Placeholder for exact TikTok DM endpoint)
  const url = `https://open.tiktokapis.com/v2/message/send/`;
  
  const payload = {
    recipient_id: to,
    message: {
      text: text,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("TikTok API Error:", data);
    throw new Error(data.error?.message || "Failed to send TikTok message");
  }

  return data;
}
