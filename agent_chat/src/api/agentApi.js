export async function createAgent(payload) {
  const res = await fetch("https://localhost:6121/v1/agents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let message;
    try {
      message = await res.text();
    } catch {
      message = `Failed with status ${res.status}`;
    }
    throw new Error(message);
  }
  return res.json();
}

export function parseFeatureConfig(str) {
  // Try to parse as JSON. Fallback to empty object
  try {
    const val = JSON.parse(str);
    return typeof val === "object" && val !== null ? val : {};
  } catch {
    return {};
  }
}

export function parseResponseFormat(str) {
  try {
    const val = JSON.parse(str);
    return typeof val === "object" && val !== null ? val : {};
  } catch {
    return {};
  }
}