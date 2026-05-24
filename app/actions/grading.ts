"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { executePythonCode } from "@/lib/grading/code-executor"

export async function updateSubmissionGrade(submissionId: string, isCorrect: boolean, score: number, violations?: string[]) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return { error: "Access denied" }
    }

    const data: any = { isCorrect, score }
    if (violations) {
      data.violations = violations
    }

    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data,
      include: {
        task: true,
        user: {
          include: {
            results: true
          }
        }
      }
    })


    const allSubmissions = await prisma.submission.findMany({
      where: {
        userId: submission.userId,
        task: {
          olympiadId: submission.task.olympiadId
        }
      }
    })

    const totalScore = allSubmissions.reduce((acc, sub) => acc + (sub.score || 0), 0)

    await prisma.result.updateMany({
      where: {
        userId: submission.userId,
        olympiadId: submission.task.olympiadId
      },
      data: {
        totalScore,
        updatedAt: new Date()
      }
    })

    revalidatePath(`/admin/olympiads/${submission.task.olympiadId}/results/${submission.userId}`)
    revalidatePath("/dashboard/results")
    

    const resultRecord = await prisma.result.findFirst({
      where: {
        userId: submission.userId,
        olympiadId: submission.task.olympiadId
      }
    })
    
    if (resultRecord) {
      revalidatePath(`/dashboard/results/${resultRecord.id}`)
    }

    return { success: true, result: resultRecord }

  } catch (error) {
    console.error("Failed to update grade:", error)
    return { error: "Failed to update grade" }
  }
}

export async function autoRegradeSubmission(submissionId: string) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return { error: "Access denied" }
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { task: true }
    })

    if (!submission) return { error: "Submission not found" }
    
    let taskData: any;
    try {
      taskData = JSON.parse(submission.task.content)
    } catch (e) {
      return { error: "Invalid task content" }
    }

    if (taskData.type !== 'CODE' || !taskData.autoCheck) {
      return { error: "Not an auto-checked CODE task" }
    }

    const testCases = Array.isArray(taskData.testCases) ? taskData.testCases : []
    const result = await executePythonCode(submission.answer, testCases, submission.task.points)

    if (result.score === null) {
      await updateSubmissionGrade(submissionId, false, 0, [result.details])
      return { success: false, error: "System error during regrade, sent to manual", details: result.details }
    } else {
      await updateSubmissionGrade(submissionId, result.success, result.score, result.success ? [] : [result.details])
      return { success: true, score: result.score, isCorrect: result.success }
    }
  } catch (error) {
    console.error("Regrade failed:", error)
    return { error: "Failed to regrade submission" }
  }
}
