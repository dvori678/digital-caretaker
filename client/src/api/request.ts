const BASE = import.meta.env.VITE_API_URL

function getToken() {
  const user = sessionStorage.getItem("user")
  if (!user) return null
  return JSON.parse(user).token
}

export async function request(path: string, options: RequestInit = {}) {
  const token = getToken()
  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
  }
  catch {
    throw new Error("אין חיבור לשרת, נסו שוב בעוד רגע");
  }
  const data = await response.json()
  if (!response.ok) throw new Error(data.message)
  return data
}