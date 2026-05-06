export async function sendTelegramPhoto({
  botToken,
  chatId,
  photoUrl,
  caption,
}: {
  botToken: string;
  chatId: string;
  photoUrl: string;
  caption: string;
}) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photoUrl,
      caption,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Telegram sendPhoto failed: ${response.status} ${text}`);
  }

  return response.json();
}

export async function sendTelegramMessage({
  botToken,
  chatId,
  text,
}: {
  botToken: string;
  chatId: string;
  text: string;
}) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Telegram sendMessage failed: ${response.status} ${responseText}`);
  }

  return response.json();
}
