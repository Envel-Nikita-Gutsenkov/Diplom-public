"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Role, User } from "@prisma/client"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

async function ensureAdmin() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
}

export async function getAllUsers() {
  await ensureAdmin()
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      group: true,
      labels: true,
      tags: true,
      createdAt: true,
    }
  })
}

export async function updateUserRole(userId: string, role: Role) {
  await ensureAdmin()
  await prisma.user.update({
    where: { id: userId },
    data: { role }
  })
  revalidatePath("/admin/users")
}

export async function updateUserProfile(userId: string, data: { name?: string, group?: string, tags?: string[], labels?: string[] }) {
  await ensureAdmin()
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      group: data.group,
      tags: data.tags,
      labels: data.labels,
    }
  })
  revalidatePath("/admin/users")
}

export async function updateUserPassword(userId: string, newPassword: string) {
  await ensureAdmin()
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  })
}

export async function deleteUser(userId: string) {
  await ensureAdmin()
  const session = await auth()
  const currentUser = await prisma.user.findUnique({ where: { email: session?.user?.email! } })
  if (currentUser?.id === userId) {
    throw new Error("Cannot delete your own account")
  }

  await prisma.user.delete({
    where: { id: userId }
  })
  revalidatePath("/admin/users")
}

export async function createUser(data: { name: string, email: string, role: Role, group?: string, password?: string }) {
  await ensureAdmin()
  const hashedPassword = await bcrypt.hash(data.password || "password123", 10)
  
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      group: data.group,
      password: hashedPassword,
    }
  })
  
  revalidatePath("/admin/users")
  return user
}
