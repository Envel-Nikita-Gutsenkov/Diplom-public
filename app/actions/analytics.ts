"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getOlympiadResults(olympiadId: string) {
  try {
    const results = await prisma.result.findMany({
      where: { olympiadId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            group: true,
          },
        } as any,
      },
      orderBy: { totalScore: "desc" },
    })
    console.log(`[ANALYTICS] Found ${results.length} results for ${olympiadId}`)

    return results
  } catch (error) {
    console.error(`[ANALYTICS] Error in getOlympiadResults for ${olympiadId}:`, error)
    return []
  }
}

export async function getUserOlympiadStats(userId: string, olympiadId: string) {
  console.log(`[ANALYTICS] getUserOlympiadStats called for user: ${userId}, olympiad: ${olympiadId}`)
  try {
    const tasks = await prisma.task.findMany({
      where: { olympiadId },
      include: {
        submissions: {
          where: { userId },
        },
      },
    })

    const result = await prisma.result.findFirst({
      where: { userId, olympiadId },
      include: {
        user: {
            select: {
                id: true,
                name: true,
                email: true,
                group: true,
                image: true,
            }
        } as any
      }
    })

    const allResults = await prisma.result.findMany({
      where: { olympiadId },
      orderBy: { totalScore: "desc" },
    })

    const rank = allResults.findIndex((r) => r.userId === userId) + 1

    console.log(`[ANALYTICS] getUserOlympiadStats results: tasks=${tasks.length}, resultFound=${!!result}, violationsCount=${result?.violations?.length || 0}`)

    return { 
      tasks, 
      result: result ? { ...result, rank } : null 
    }
  } catch (error) {
    console.error(`[ANALYTICS] Error in getUserOlympiadStats for ${userId} in ${olympiadId}:`, error)
    return null
  }
}
