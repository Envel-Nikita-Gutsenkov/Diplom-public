"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function getUserResults() {
  try {
    const session = await auth()
    if (!session?.user?.email) return []

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return []

    const results = await prisma.result.findMany({
      where: { userId: user.id },
      include: { 
        olympiad: {
          include: {
            tasks: {
              select: { id: true }
            }
          }
        } 
      },
      orderBy: { createdAt: "desc" },
    })


    return await Promise.all(results.map(async (res) => {
      const pendingCount = await prisma.submission.count({
        where: {
          userId: user.id,
          taskId: { in: res.olympiad.tasks.map(t => t.id) },
          score: null 
        }
      })
      
      return {
        ...res,
        isPending: pendingCount > 0
      }
    }))
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getUserResultDetail(resultId: string) {
  try {
    const session = await auth()
    if (!session?.user?.email) return null

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return null

    const result = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        olympiad: {
          include: {
            tasks: {
              include: {
                submissions: {
                  where: { userId: user.id }
                }
              }
            }
          }
        }
      }
    })

    if (!result || result.userId !== user.id) return null

    return result
  } catch (error) {
    console.error(error)
    return null
  }
}
