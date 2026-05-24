import { NextResponse } from "next/server"
import { getCsrfToken } from "@/lib/csrf"

export const dynamic = 'force-dynamic'

export async function GET() {
  const token = await getCsrfToken()
  return NextResponse.json({ csrfToken: token })
}
