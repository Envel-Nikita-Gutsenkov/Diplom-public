"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { comparePassword, hashPassword } from "@/lib/password"
import { createBackup } from "@/lib/backup-utils"

async function ensureAdmin() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
}

export async function getGlobalSettings() {
  try {
    
    let settings = await (prisma as any).globalSettings.findUnique({
      where: { id: "singleton" }
    })

    if (!settings) {
      try {
        settings = await (prisma as any).globalSettings.create({
          data: { id: "singleton", registrationEnabled: true }
        })
      } catch (createError) {
        
        settings = await (prisma as any).globalSettings.findUnique({
          where: { id: "singleton" }
        })
      }
    }
    return settings
  } catch (error) {
    console.warn("[getGlobalSettings] Failed to fetch settings, returning defaults:", error)
    return {
      registrationEnabled: true,
      autoBackupEnabled: false,
      backupCount: 3,
      lastBackupAt: null
    }
  }
}

export async function checkAutoBackup() {
  try {
    const settings = await (prisma as any).globalSettings.findUnique({
      where: { id: "singleton" }
    })

    if (settings?.autoBackupEnabled) {
      const lastBackup = settings.lastBackupAt ? new Date(settings.lastBackupAt).getTime() : 0
      const now = new Date().getTime()
      const interval24h = 24 * 60 * 60 * 1000
      
      if (now - lastBackup > interval24h) {
        await createBackup().catch(console.error)
      }
    }
  } catch (error) {
    console.warn("[checkAutoBackup] Failed to check status, skipping:", error)
  }
}

export async function updateGlobalSettings(data: { registrationEnabled: boolean }) {
  await ensureAdmin()
  await (prisma as any).globalSettings.upsert({
    where: { id: "singleton" },
    update: { registrationEnabled: data.registrationEnabled },
    create: { id: "singleton", registrationEnabled: data.registrationEnabled }
  })
  revalidatePath("/admin/settings")
}

export async function updateBackupSettings(data: { autoBackupEnabled?: boolean, backupCount?: number }) {
  await ensureAdmin()
  
  const updateData = { ...data }
  if (updateData.backupCount !== undefined) {
    updateData.backupCount = Math.min(Math.max(1, updateData.backupCount), 10)
  }

  await (prisma as any).globalSettings.upsert({
    where: { id: "singleton" },
    update: updateData,
    create: { id: "singleton", ...updateData }
  })
  revalidatePath("/admin/settings")
}

export async function updateUserGroup(group: string) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error("Unauthorized")
  }

  await (prisma.user.update as any)({
    where: { email: session.user.email },
    data: { group }
  })

  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateUserPassword(data: { current: string, new: string }) {
  const session = await auth()
  if (!session?.user?.email) {
    return { error: "Не авторизован" }
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { password: true }
  })

  if (!user) return { error: "Пользователь не найден" }
  if (!user.password) return { error: "Этот аккаунт использует вход через соцсети" }

  const isCorrect = await comparePassword(data.current, user.password)
  if (!isCorrect) {
    return { error: "Текущий пароль указан неверно" }
  }

  const hashedPassword = await hashPassword(data.new)

  await prisma.user.update({
    where: { email: session.user.email },
    data: { password: hashedPassword }
  })

  return { success: true }
}
