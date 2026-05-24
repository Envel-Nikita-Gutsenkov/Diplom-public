"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { executePythonCode } from "@/lib/grading/code-executor"
import { revalidatePath } from "next/cache"

export async function submitAnswer(taskId: string, answer: string) {
  console.log(`[SUBMIT_ANSWER] Task: ${taskId}, Answer length: ${answer.length}`);
  try {
    const session = await auth()
    if (!session?.user?.email) return { error: "Not authenticated" }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return { error: "User not found" }


    const existingSubmission = await prisma.submission.findFirst({
      where: {
        userId: user.id,
        taskId: taskId,
      },
    })

    if (existingSubmission) {
      await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: { answer },
      })
    } else {
      await prisma.submission.create({
        data: {
          userId: user.id,
          taskId,
          answer,
        },
      })
    }
    console.log(`[SUBMIT_ANSWER] OK for task ${taskId}`);
    return { success: true }
  } catch (error) {
    console.error(`[SUBMIT_ANSWER] Error for task ${taskId}:`, error)
    return { error: "Failed to submit answer" }
  }
}

export async function startOlympiad(olympiadId: string) {
  try {
    const session = await auth()
    if (!session?.user?.email) return { error: "Not authenticated" }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return { error: "User not found" }

    const olympiad = await prisma.olympiad.findUnique({
      where: { id: olympiadId },
      select: { duration: true, endDate: true }
    })
    if (!olympiad) return { error: "Olympiad not found" }

    const existingResult = await prisma.result.findFirst({
      where: { userId: user.id, olympiadId }
    })

    const now = new Date()
    
    if (now > olympiad.endDate) {
      if (!existingResult || !existingResult.isSubmitted) {
        await finishOlympiad(olympiadId)
      }
      return { success: true, isSubmitted: true }
    }

    if (!existingResult) {
      const newResult = await prisma.result.create({
        data: {
          userId: user.id,
          olympiadId,
          totalScore: 0,
          startedAt: now,
        }
      })
      return { success: true, startedAt: newResult.startedAt }
    }

    if (olympiad.duration && !existingResult.isSubmitted) {
        const start = new Date(existingResult.startedAt).getTime()
        const end = start + olympiad.duration * 60 * 1000
        if (now.getTime() > end) {
            await finishOlympiad(olympiadId)
            return { success: true, isSubmitted: true, startedAt: existingResult.startedAt }
        }
    }

    return { success: true, startedAt: existingResult.startedAt, isSubmitted: existingResult.isSubmitted }
  } catch (error) {
    console.error("[ACTION_START] Error:", error)
    return { error: "Failed to start" }
  }
}

export async function finishOlympiad(olympiadId: string) {
  console.log(`[FINISH_ACTION] Starting for olympiad: ${olympiadId}`);
  try {
    const session = await auth()
    if (!session?.user?.email) {
      console.error("[FINISH_ACTION] Not authenticated");
      return { error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      console.error("[FINISH_ACTION] User not found");
      return { error: "User not found" };
    }

    console.log(`[FINISH_ACTION] User: ${user.email} (${user.id})`);

    const tasks = await prisma.task.findMany({
        where: { olympiadId }
    })
    console.log(`[FINISH_ACTION] Found ${tasks.length} tasks`);

    const submissions = await prisma.submission.findMany({
        where: {
            userId: user.id,
            taskId: { in: tasks.map(t => t.id) }
        }
    })
    console.log(`[FINISH_ACTION] Found ${submissions.length} submissions`);

    let totalScore = 0
    const updates = []

    for (const task of tasks) {
        const sub = submissions.find(s => s.taskId === task.id)
        if (!sub) continue

        try {
            const taskData = JSON.parse(task.content)
            if (taskData.type === 'MULTIPLE_CHOICE' || taskData.type === 'CHECKBOX') {
                let correctOptions: number[] = []
                if (Array.isArray(taskData.correctOptions)) {
                    correctOptions = taskData.correctOptions.map(Number)
                } else if (taskData.correctOption !== undefined) {
                    correctOptions = [Number(taskData.correctOption)]
                }
                correctOptions.sort((a, b) => a - b)
                
                let isCorrect = false
                if (taskData.type === 'MULTIPLE_CHOICE') {
                    isCorrect = correctOptions.includes(parseInt(sub.answer))
                } else {
                    const userAnswers = sub.answer.split(',').filter(x => x.trim() !== "").map(Number).sort((a, b) => a - b)
                    isCorrect = userAnswers.length === correctOptions.length && 
                                 userAnswers.every((val, index) => val === correctOptions[index])
                }

                const score = isCorrect ? task.points : 0
                if (isCorrect) totalScore += score
                
                updates.push(prisma.submission.update({
                    where: { id: sub.id },
                    data: { isCorrect, score }
                }))
            } else if (taskData.type === 'TEXT') {
                const targetAnswers: string[] = []
                if (Array.isArray(taskData.correctOptions)) {
                    targetAnswers.push(...taskData.correctOptions.map(String).filter((s: string) => s.trim() !== ""))
                } else if (taskData.correctOption !== undefined && taskData.correctOption !== null) {
                    targetAnswers.push(String(taskData.correctOption))
                }

                if (targetAnswers.length > 0) {
                    const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ')
                    const userNormalized = normalize(sub.answer || "")
                    const isCorrect = targetAnswers.some(target => normalize(target) === userNormalized)
                    
                    const score = isCorrect ? task.points : 0
                    if (isCorrect) totalScore += score

                    updates.push(prisma.submission.update({
                        where: { id: sub.id },
                        data: { isCorrect, score }
                    }))
                } else {
                    updates.push(prisma.submission.update({
                        where: { id: sub.id },
                        data: { score: null, isCorrect: null } 
                    }))
                }
            } else if (taskData.type === 'CODE') {
                if (taskData.autoCheck && sub.answer && sub.answer.trim().length > 0) {
                    const testCases = Array.isArray(taskData.testCases) ? taskData.testCases : []
                    const result = await executePythonCode(sub.answer, testCases, task.points)
                    
                    if (result.score === null) {
                        updates.push(prisma.submission.update({
                            where: { id: sub.id },
                            data: { 
                                score: null, 
                                isCorrect: null,
                                violations: [result.details]
                            } 
                        }))
                    } else {
                        totalScore += result.score
                        updates.push(prisma.submission.update({
                            where: { id: sub.id },
                            data: { 
                                isCorrect: result.success, 
                                score: result.score,
                                violations: result.success ? [] : [result.details]
                            }
                        }))
                    }
                } else {
                    updates.push(prisma.submission.update({
                        where: { id: sub.id },
                        data: { score: null, isCorrect: null } 
                    }))
                }
            }
        } catch (e) {
            console.error("[FINISH_ACTION] Error grading task", task.id, e)
        }
    }

    console.log(`[FINISH_ACTION] Final score: ${totalScore}. Preparing ${updates.length + 1} updates.`);

    const existingResult = await prisma.result.findFirst({
        where: { userId: user.id, olympiadId }
    })

    if (existingResult) {
        updates.push(prisma.result.update({
            where: { id: existingResult.id },
            data: { 
                totalScore,
                isSubmitted: true,
                finishedAt: new Date()
            }
        }))
    } else {
        updates.push(prisma.result.create({
            data: {
                userId: user.id,
                olympiadId,
                totalScore,
                startedAt: new Date(),
                finishedAt: new Date(),
                isSubmitted: true
            }
        }))
    }

    console.log("[FINISH_ACTION] Executing transaction...");
    await prisma.$transaction(updates)
    console.log("[FINISH_ACTION] Transaction successful. Revalidating path...");
    
    try {
      revalidatePath("/dashboard/results")
      console.log("[FINISH_ACTION] Revalidation successful");
    } catch (revErr) {
      console.warn("[FINISH_ACTION] Revalidation failed (ignoring):", revErr);
    }

    console.log("[FINISH_ACTION] Done!");
    return { success: true }
  } catch (error) {
    console.error("[ACTION_FINISH] Fatal Error:", error)
    return { error: "Failed to finish olympiad" }
  }
}
