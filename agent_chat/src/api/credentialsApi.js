// --- API request function
export async function createCredential({ name, provider_id, api_key, meta_data }, apiKey) {
  const payload = {
    name,
    provider_id,
    credentials: { api_key },
    meta_data: meta_data ? JSON.parse(meta_data) : {},
  };

  const res = await fetch("https://agent-prod.studio.lyzr.ai/v3/tools/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey, // Lyzr API key needed here
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg);
  }
  return res.json();
}