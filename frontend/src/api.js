export const API_URL = import.meta.env.VITE_API_URL;
export const DECIMER_API_URL = import.meta.env.VITE_DECIMER_API_URL;

export async function getCurrentUser(accessToken) {
  const res = await fetch(`${API_URL}/api/auth/me/`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  if (!res.ok) {
    throw new Error("Failed to fetch user data");
  }
  return res.json();
}