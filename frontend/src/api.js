// In production (Vercel), VITE_API_URL is set to the Render backend URL.
// In local development, it falls back to localhost.
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// Wraps fetch with a timeout. If the server takes longer than `ms`, the
// request is cancelled and an error is thrown instead of hanging forever.
function fetchWithTimeout(url, options = {}, ms = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal })
    .then((res) => { clearTimeout(timer); return res; })
    .catch((err) => { clearTimeout(timer); throw err; });
}

export async function getItems({ purchased = null, category = null, search = null, sort = null } = {}) {
  const params = new URLSearchParams();
  if (purchased !== null) params.append("purchased", purchased);
  if (category) params.append("category", category);
  if (search) params.append("search", search);
  if (sort) params.append("sort", sort);
  const query = params.toString() ? `?${params}` : "";
  const res = await fetchWithTimeout(`${BASE_URL}/items${query}`);
  if (!res.ok) throw new Error("Failed to load items");
  return res.json();
}

export async function getHistory() {
  const res = await fetchWithTimeout(`${BASE_URL}/items/history`);
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}

export async function createItem(item) {
  const res = await fetchWithTimeout(`${BASE_URL}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("Failed to create item");
  return res.json();
}

export async function updateItem(id, data) {
  const res = await fetchWithTimeout(`${BASE_URL}/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update item");
  return res.json();
}

export async function togglePurchased(id) {
  const res = await fetchWithTimeout(`${BASE_URL}/items/${id}/purchased`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to toggle item");
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetchWithTimeout(`${BASE_URL}/items/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete item");
}
