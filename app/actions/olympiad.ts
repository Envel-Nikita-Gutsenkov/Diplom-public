"use server"

import prisma from "@/lib/prisma"
import type { Olympiad } from "@prisma/client"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

const OlympiadSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  isActive: z.boolean().optional(),
  colorTheme: z.string().optional(),
  emoji: z.string().optional(),
  duration: z.coerce.number().optional().nullable(),
  preventCopyPaste: z.boolean().optional(),
  preventBlur: z.boolean().optional(),
  shuffleTasks: z.boolean().optional(),
})

const TaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  points: z.coerce.number().min(1),
})

export async function createOlympiad(prevState: unknown, formData: FormData) {
  const validatedFields = OlympiadSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isActive: formData.get("isActive") === "on",
    colorTheme: formData.get("colorTheme") || undefined,
    emoji: formData.get("emoji") || undefined,
    duration: formData.get("duration"),
    preventCopyPaste: formData.get("preventCopyPaste") === "on",
    preventBlur: formData.get("preventBlur") === "on",
    shuffleTasks: formData.get("shuffleTasks") === "on",
  })

  if (!validatedFields.success) {
    console.error("ZOD ERROR:", validatedFields.error.flatten())
    return { error: "Invalid fields" }
  }

  const { title, description, startDate, endDate, isActive, colorTheme, emoji, preventCopyPaste, preventBlur, shuffleTasks } = validatedFields.data
  const questionsJson = formData.get("questions") as string
  const questions = questionsJson ? JSON.parse(questionsJson) : []

  const themes = ["indigo", "blue", "sky", "cyan", "teal", "emerald", "green", "lime", "amber", "orange", "red", "rose", "pink", "fuchsia", "purple", "violet", "slate"]
  const randomTheme = themes[Math.floor(Math.random() * themes.length)]
  
  const emojis = ["🚀", "💡", "🧠", "🏆", "🎨", "🧪", "🌍", "📚", "💻", "✨", "🛰️", "🤖", "🧬", "📊"]
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]

  try {
    await prisma.$transaction(async (tx) => {
      const olympiad = await tx.olympiad.create({
        data: {
          title,
          description,
          startDate,
          endDate,
          isActive: isActive || false,
          colorTheme: colorTheme || randomTheme,
          emoji: emoji || randomEmoji,
          duration: validatedFields.data.duration || null,
          preventCopyPaste: preventCopyPaste || false,
          preventBlur: preventBlur || false,
          shuffleTasks: shuffleTasks || false,
        } as any,
      })

      if (questions.length > 0) {
        await tx.task.createMany({
          data: questions.map((q: any) => ({
            title: q.title || "Untitled Task",
            description: q.content || "No description",
            content: JSON.stringify({
              type: q.type,
              options: q.options,
              correctOptions: Array.isArray(q.correctOptions) ? q.correctOptions : (q.correctOption !== undefined ? [q.correctOption] : []),
              libraries: q.libraries || [],
              autoCheck: q.autoCheck || false,
              testCases: q.testCases || [],
              referenceSolution: q.referenceSolution || "",
            }),
            points: q.points || 10,
            olympiadId: olympiad.id,
          })),
        })
      }
    })
  } catch (error) {
    console.error(error)
    return { error: "Failed to create olympiad with tasks" }
  }

  revalidatePath("/admin")
  redirect("/admin")
}

export async function updateOlympiad(id: string, prevState: unknown, formData: FormData) {
  const validatedFields = OlympiadSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isActive: formData.get("isActive") === "on",
    duration: formData.get("duration"),
    preventCopyPaste: formData.get("preventCopyPaste") === "on",
    preventBlur: formData.get("preventBlur") === "on",
    shuffleTasks: formData.get("shuffleTasks") === "on",
    colorTheme: formData.get("colorTheme") || undefined,
    emoji: formData.get("emoji") || undefined,
  })

  if (!validatedFields.success) {
    console.error("ZOD ERROR (updateOlympiad):", validatedFields.error.flatten())
    return { error: "Invalid fields" }
  }

  const { title, description, startDate, endDate, isActive, colorTheme, emoji, preventCopyPaste, preventBlur, shuffleTasks } = validatedFields.data
  const questionsJson = formData.get("questions") as string | null
  const questions = questionsJson ? JSON.parse(questionsJson) : []

  try {
    await prisma.$transaction(async (tx) => {
      await tx.olympiad.update({
        where: { id },
        data: {
          title,
          description,
          startDate,
          endDate,
          isActive: isActive || false,
          colorTheme,
          emoji,
          duration: validatedFields.data.duration || null,
          preventCopyPaste: preventCopyPaste || false,
          preventBlur: preventBlur || false,
          shuffleTasks: shuffleTasks || false,
        } as any,
      })

      if (questionsJson !== null) {
        await tx.task.deleteMany({
          where: { olympiadId: id },
        })

        if (questions.length > 0) {
          await tx.task.createMany({
            data: questions.map((q: any) => ({
              title: q.title || "Untitled Task",
              description: q.content || "No description",
              content: JSON.stringify({
                type: q.type,
                options: q.options,
                correctOptions: Array.isArray(q.correctOptions) ? q.correctOptions : (q.correctOption !== undefined ? [q.correctOption] : []),
                libraries: q.libraries || [],
                autoCheck: q.autoCheck || false,
                testCases: q.testCases || [],
                referenceSolution: q.referenceSolution || "",
              }),
              points: q.points || 10,
              olympiadId: id,
            })),
          })
        }
      }
    })
  } catch (error) {
    console.error(error)
    return { error: "Failed to update olympiad" }
  }

  revalidatePath(`/admin/olympiads/${id}`)
  revalidatePath("/admin")
  redirect(`/admin/olympiads/${id}`)
}

export async function updateOlympiadSettings(id: string, prevState: unknown, formData: FormData) {
  const validatedFields = OlympiadSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isActive: formData.get("isActive") === "on",
    duration: formData.get("duration"),
    preventCopyPaste: formData.get("preventCopyPaste") === "on",
    preventBlur: formData.get("preventBlur") === "on",
    shuffleTasks: formData.get("shuffleTasks") === "on",
    colorTheme: formData.get("colorTheme") || undefined,
    emoji: formData.get("emoji") || undefined,
  })

  if (!validatedFields.success) {
    console.error("ZOD ERROR (updateOlympiadSettings):", validatedFields.error.flatten())
    return { error: "Invalid fields" }
  }

  const { title, description, startDate, endDate, isActive, colorTheme, emoji, preventCopyPaste, preventBlur, shuffleTasks } = validatedFields.data

  try {
    await prisma.olympiad.update({
      where: { id },
      data: {
        title,
        description,
        startDate,
        endDate,
        isActive: isActive || false,
        colorTheme,
        emoji,
        duration: validatedFields.data.duration || null,
        preventCopyPaste: preventCopyPaste || false,
        preventBlur: preventBlur || false,
        shuffleTasks: shuffleTasks || false,
      } as any,
    })
  } catch (error) {
    console.error(error)
    return { error: "Failed to update olympiad settings" }
  }

  revalidatePath(`/admin/olympiads/${id}`)
  revalidatePath("/admin")
  return { success: true }
}

export async function updateOlympiadTasks(id: string, questionsJson: string) {
  const questions = questionsJson ? JSON.parse(questionsJson) : []

  try {
    console.log(`[ACTION] Updating tasks for olympiad ${id}. New tasks count: ${questions.length}`)
    await prisma.$transaction(async (tx) => {
      await tx.task.deleteMany({
        where: { olympiadId: id },
      })

      if (questions.length > 0) {
        await tx.task.createMany({
          data: questions.map((q: any) => ({
            title: q.title || "Untitled Task",
            description: q.content || "No description",
            content: JSON.stringify({
              type: q.type,
              options: q.options,
              correctOptions: Array.isArray(q.correctOptions) ? q.correctOptions : (q.correctOption !== undefined ? [q.correctOption] : []),
              libraries: q.libraries || [],
              autoCheck: q.autoCheck || false,
              testCases: q.testCases || [],
              referenceSolution: q.referenceSolution || "",
            }),
            points: q.points || 10,
            olympiadId: id,
          })),
        })
      }
    })
    console.log(`[ACTION] Tasks updated successfully for ${id}`)
  } catch (error) {
    console.error(`[ACTION] Failed to update tasks for ${id}:`, error)
    return { error: "Failed to update olympiad tasks" }
  }

  revalidatePath(`/admin/olympiads/${id}`)
  revalidatePath(`/admin/olympiads/${id}/tasks`)
  revalidatePath(`/dashboard/olympiads/${id}/take`)
  return { success: true }
}

export async function getOlympiads() {
  try {
    return await prisma.olympiad.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { results: true }
        }
      }
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getActiveOlympiads() {
  try {
    const session = await auth()
    const now = new Date()
    
    const where: any = {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    }

    const include: any = {}
    if (session?.user?.email) {
      include.results = {
        where: {
          user: {
            email: session.user.email
          }
        }
      }
    }

    return await prisma.olympiad.findMany({
      where,
      include,
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getOlympiadById(id: string, userId?: string) {
  console.log(`[ACTION] getOlympiadById called with: ${id}, userId: ${userId || 'none'}`)
  try {
    const include: any = { tasks: true }
    
    if (userId) {
      include.tasks = {
        include: {
          submissions: {
            where: { userId }
          }
        }
      }
    }

    const result = await prisma.olympiad.findUnique({
      where: { id },
      include,
    })
    console.log(`[ACTION] getOlympiadById SUCCESS for ${id}: ${result ? "Found (" + result.title + ")" : "NOT FOUND"}`)
    return result
  } catch (error) {
    console.error(`[ACTION] getOlympiadById CRITICAL ERROR for ${id}:`, error)
    return null
  }
}

export async function addTask(olympiadId: string, prevState: unknown, formData: FormData) {
  const validatedFields = TaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    content: formData.get("content"),
    points: formData.get("points"),
  })

  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  const { title, description, content, points } = validatedFields.data

  try {
    await prisma.task.create({
      data: {
        title,
        description,
        content,
        points,
        olympiadId,
      },
    })
  } catch (error) {
    console.error(error)
    return { error: "Failed to create task" }
  }

  revalidatePath(`/admin/olympiads/${olympiadId}`)
  return { success: true }
}

export async function deleteOlympiad(id: string) {
  try {
    await prisma.olympiad.delete({
      where: { id },
    })
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to delete olympiad" }
  }
}

export async function toggleOlympiadStatus(id: string, currentState: boolean) {
  try {
    await prisma.olympiad.update({
      where: { id },
      data: { isActive: !currentState },
    })
    revalidatePath(`/admin/olympiads/${id}`)
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to update olympiad status" }
  }
}

export async function resetResults(id: string) {
  try {
    const tasks = await prisma.task.findMany({
      where: { olympiadId: id },
      select: { id: true },
    })
    const taskIds = tasks.map((t) => t.id)

    await prisma.$transaction([
      prisma.submission.deleteMany({
        where: { taskId: { in: taskIds } },
      }),
      prisma.result.deleteMany({
        where: { olympiadId: id },
      }),
    ])

    revalidatePath(`/admin/olympiads/${id}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to reset results" }
  }
}

export async function resetUserResult(olympiadId: string, userId: string) {
  try {
    const tasks = await prisma.task.findMany({
      where: { olympiadId },
      select: { id: true },
    })
    const taskIds = tasks.map((t) => t.id)

    await prisma.$transaction([
      prisma.submission.deleteMany({
        where: { 
          taskId: { in: taskIds },
          userId: userId
        },
      }),
      prisma.result.deleteMany({
        where: { 
          olympiadId,
          userId: userId
        },
      }),
    ])

    revalidatePath(`/admin/olympiads/${olympiadId}/results`)
    revalidatePath(`/admin/olympiads/${olympiadId}/results/${userId}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to reset user result" }
  }
}

export async function voidUserResult(olympiadId: string, userId: string) {
  try {
    const tasks = await prisma.task.findMany({
      where: { olympiadId },
      select: { id: true },
    })
    const taskIds = tasks.map((t) => t.id)

    const submissionsToUpdate = await prisma.submission.findMany({
      where: { 
        taskId: { in: taskIds },
        userId: userId
      }
    });

    const resultToUpdate = await prisma.result.findFirst({
      where: { 
        olympiadId,
        userId: userId
      }
    });

    console.log(`[ACTION] voidUserResult: Found ${submissionsToUpdate.length} submissions and result: ${!!resultToUpdate} for user ${userId}`);

    const transaction = [];
    
    for (const sub of submissionsToUpdate) {
      transaction.push(
        prisma.submission.update({
          where: { id: sub.id },
          data: {
            score: 0,
            isCorrect: false,
            violations: [...(sub.violations || []), "Результат аннулирован администратором"]
          }
        })
      );
    }

    if (resultToUpdate) {
      transaction.push(
        prisma.result.update({
          where: { id: resultToUpdate.id },
          data: {
            totalScore: 0,
            violations: [...(resultToUpdate.violations || []), "Результат аннулирован администратором"]
          }
        })
      );
    }

    await prisma.$transaction(transaction);
    console.log(`[ACTION] voidUserResult: Successfully voided result for user ${userId}`);

    revalidatePath(`/admin/olympiads/${olympiadId}/results`)
    revalidatePath(`/admin/olympiads/${olympiadId}/results/${userId}`)
    return { success: true }
  } catch (error) {
    console.error(`[ACTION] voidUserResult ERROR for user ${userId}:`, error)
    return { error: "Failed to void user result" }
  }
}
