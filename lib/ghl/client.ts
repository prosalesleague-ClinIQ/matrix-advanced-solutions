/**
 * Matrix Advanced Solutions — GoHighLevel API Client
 *
 * Low-level HTTP client for the GHL/LeadConnector API.
 * Used server-side only (API routes). Never expose on the client.
 *
 * Env vars required:
 *   GHL_API_KEY      — Private Integration API key
 *   GHL_LOCATION_ID  — Sub-account Location ID
 */

const GHL_BASE_URL = "https://services.leadconnectorhq.com";

function getConfig() {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    return null; // GHL not configured — skip silently
  }

  return { apiKey, locationId };
}

function headers(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Version: "2021-07-28",
  };
}

// ─── Contact Operations ─────────────────────────────────────────

export interface GHLContactData {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  tags?: string[];
  customFields?: Array<{ key: string; value: string | number | boolean }>;
  assignedTo?: string;
}

export async function findContactByEmail(
  email: string
): Promise<string | null> {
  const config = getConfig();
  if (!config) return null;

  try {
    const url = new URL(`${GHL_BASE_URL}/contacts/search/duplicate`);
    url.searchParams.set("locationId", config.locationId);
    url.searchParams.set("email", email);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: headers(config.apiKey),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.contact?.id ?? null;
  } catch (err) {
    console.error("[GHL] findContactByEmail error:", err);
    return null;
  }
}

export async function upsertContact(
  contact: GHLContactData
): Promise<string | null> {
  const config = getConfig();
  if (!config) return null;

  try {
    const payload = {
      ...contact,
      locationId: config.locationId,
    };

    const res = await fetch(`${GHL_BASE_URL}/contacts/upsert`, {
      method: "POST",
      headers: headers(config.apiKey),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[GHL] upsertContact failed:", res.status, errBody);
      return null;
    }

    const data = await res.json();
    return data?.contact?.id ?? null;
  } catch (err) {
    console.error("[GHL] upsertContact error:", err);
    return null;
  }
}

export async function addTag(
  contactId: string,
  tag: string
): Promise<boolean> {
  const config = getConfig();
  if (!config) return false;

  try {
    const res = await fetch(`${GHL_BASE_URL}/contacts/${contactId}/tags`, {
      method: "POST",
      headers: headers(config.apiKey),
      body: JSON.stringify({ tags: [tag] }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[GHL] addTag failed:", res.status, errBody);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[GHL] addTag error:", err);
    return false;
  }
}

export async function removeTag(
  contactId: string,
  tag: string
): Promise<boolean> {
  const config = getConfig();
  if (!config) return false;

  try {
    const res = await fetch(`${GHL_BASE_URL}/contacts/${contactId}/tags`, {
      method: "DELETE",
      headers: headers(config.apiKey),
      body: JSON.stringify({ tags: [tag] }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[GHL] removeTag failed:", res.status, errBody);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[GHL] removeTag error:", err);
    return false;
  }
}

export async function updateContact(
  contactId: string,
  updates: Record<string, unknown>
): Promise<boolean> {
  const config = getConfig();
  if (!config) return false;

  try {
    const res = await fetch(`${GHL_BASE_URL}/contacts/${contactId}`, {
      method: "PUT",
      headers: headers(config.apiKey),
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[GHL] updateContact failed:", res.status, errBody);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[GHL] updateContact error:", err);
    return false;
  }
}

export async function updateCustomFields(
  contactId: string,
  customFields: Array<{ key: string; value: string | number | boolean }>
): Promise<boolean> {
  const config = getConfig();
  if (!config) return false;

  try {
    const res = await fetch(`${GHL_BASE_URL}/contacts/${contactId}`, {
      method: "PUT",
      headers: headers(config.apiKey),
      body: JSON.stringify({ customFields }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[GHL] updateCustomFields failed:", res.status, errBody);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[GHL] updateCustomFields error:", err);
    return false;
  }
}
