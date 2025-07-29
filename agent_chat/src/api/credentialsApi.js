// --- API request function
export async function createCredential({ name, provider_id, meta_data, api_key }) {
  const payload = {
    name,
    provider_id,
    meta_data: meta_data ? JSON.parse(meta_data) : {},
    credentials: { api_key },
  };

  const res = await fetch("https://localhost:6121/v1/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg);
  }
  return res.json();
}