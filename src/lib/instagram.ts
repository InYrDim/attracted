interface SendIGMessageParams {
  igAccountId: string;
  accessToken: string;
  to: string;
  text: string;
}

export async function sendInstagramMessage({ igAccountId, accessToken, to, text }: SendIGMessageParams) {
  const url = `https://graph.facebook.com/v25.0/${igAccountId}/messages`;
  
  const payload = {
    recipient: {
      id: to,
    },
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
    console.error("Instagram API Error:", data);
    throw new Error(data.error?.message || "Failed to send Instagram message");
  }

  return data;
}
