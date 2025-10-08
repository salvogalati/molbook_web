import { API_URL } from "../api";

export async function fetchUIState({ scope = "projects_dashboard"}) {
  const qs = new URLSearchParams({ scope }).toString();
  const res = await fetch(`${API_URL}/api/ui-state?${qs}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}` }
  });
  if (!res.ok) throw new Error("Cannot load UI state");
  return res.json();
}

export async function saveUIState({ scope = "projects_dashboard", state }) {
  const qs = new URLSearchParams({ scope }).toString();
  const res = await fetch(`${API_URL}/api/ui-state?${qs}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    body: JSON.stringify({ scope, state })
  });
  if (!res.ok) throw new Error("Cannot save UI state");
  return res.json();
}
