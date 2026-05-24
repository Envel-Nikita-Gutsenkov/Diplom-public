import { useState, useEffect } from "react"





export function useCsrfToken(): string {
  const [token, setToken] = useState<string>("")

  useEffect(() => {
    let active = true

    async function fetchToken() {
      try {
        const response = await fetch("/api/csrf")
        if (!response.ok) {
          throw new Error(`CSRF API error: ${response.statusText}`)
        }
        const data = await response.json()
        if (active && data.csrfToken) {
          setToken(data.csrfToken)
        }
      } catch (error) {
        console.error("Failed to load CSRF token:", error)
      }
    }

    fetchToken()

    return () => {
      active = false
    }
  }, [])

  return token
}
