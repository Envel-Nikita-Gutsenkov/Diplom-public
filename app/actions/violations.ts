"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

export async function logViolation(olympiadId: string, type: string, taskId?: string) {
  const h = await headers()
  console.log(`[VIOLATION LOG] START: type=${type}, olympiad=${olympiadId}, task=${taskId || 'none'}`)
  console.log(`[VIOLATION LOG] Cookie present: ${!!h.get('cookie')}`)

  const session = await auth()
  let userId = (session?.user as any)?.id


  if (!userId && session?.user?.email) {
    console.log(`[VIOLATION LOG] ID missing in session, attempting fallback to email: ${session.user.email}`)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (user) {
      userId = user.id
      console.log(`[VIOLATION LOG] Fallback success: found ID ${userId} for email ${session.user.email}`)
    }
  }

  if (!userId) {
    console.warn(`[VIOLATION LOG] Unauthenticated attempt to log violation: ${type}. Session: ${JSON.stringify(session)}`)
    return { error: "Not authenticated" }
  }

  const timestamp = new Date().toLocaleString("ru-RU")
  const violationEntry = `[${timestamp}] ${type}`

  try {
    if (taskId) {

      const submission = await prisma.submission.findFirst({
        where: {
          taskId,
          userId,
        }
      })

      if (submission) {
        await prisma.submission.update({
          where: { id: submission.id },
          data: {
            violations: {
              push: violationEntry
            }
          } as any
        })
        console.log(`[VIOLATION LOG] Successfully logged to submission ${submission.id}`)
        revalidatePath(`/admin/olympiads/${olympiadId}/results/${userId}`)
        return { success: true }
      }

    }

    
    const result = await prisma.result.findFirst({
      where: {
        olympiadId,
        userId,
      }
    })

    if (!result) {
      console.warn(`[VIOLATION LOG] Result record not found for user ${userId} in olympiad ${olympiadId}`)
      return { error: "Result not found" }
    }

    await prisma.result.update({
      where: { id: result.id },
      data: {
        violations: {
          push: violationEntry
        }
      } as any
    })

    console.log(`[VIOLATION LOG] Successfully logged to result ${result.id}`)
    revalidatePath(`/admin/olympiads/${olympiadId}/results/${userId}`)
    revalidatePath(`/admin/olympiads/${olympiadId}/results`)
    
    return { success: true }
  } catch (error) {
    console.error("[VIOLATION LOG ERROR]:", error)
    return { error: "Failed to log violation" }
  }
}
