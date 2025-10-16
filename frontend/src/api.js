export const API_URL = import.meta.env.VITE_API_URL;
export const DECIMER_API_URL = import.meta.env.VITE_DECIMER_API_URL;
export const FAILED_IMAGE_URL = "https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/LD7WEPSAP7XPVEERGVIKMYX24Q.JPG&w=1800&h=1800"

export async function getCurrentUser(accessToken) {
  const res = await fetch(`${API_URL}/api/auth/me/`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "ngrok-skip-browser-warning": "true",
    }
  });
  if (!res.ok) {
    throw new Error("Failed to fetch user data");
  }
  return res.json();
}