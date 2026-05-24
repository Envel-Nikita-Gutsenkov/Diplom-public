import { cookies, headers } from "next/headers"





export async function getCsrfToken(): Promise<string> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get("csrf_secret")?.value || ""
  } catch (error) {
    console.error("Error retrieving CSRF secret cookie:", error)
    return ""
  }
}





export async function validateCsrfRequest(
  request?: Request,
  formData?: FormData
): Promise<void> {
  
  
  const cookieStore = await cookies()
  const secret = cookieStore.get("csrf_secret")?.value

  if (!secret) {
    throw new Error("CSRF Validation Failed: No session CSRF secret found.")
  }

  let token: string | null = null

  
  if (formData) {
    token = formData.get("csrf_token") as string | null
  }

  
  if (!token && request) {
    token = request.headers.get("x-csrf-token")
  }

  
  if (!token) {
    try {
      const headersList = await headers()
      token = headersList.get("x-csrf-token")
    } catch (e) {
      
    }
  }

  if (!token || token !== secret) {
    console.warn(`[CSRF WARNING] Failed validation. Token: ${token}, Secret: ${secret}`)
    throw new Error("CSRF Validation Failed: Invalid CSRF Token.")
  }
}
