"use server"

import { signIn, signOut } from "@/lib/auth"
import { AuthError } from "next-auth"
import prisma from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { z } from "zod"
import { redirect } from "next/navigation"

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
})

export async function register(prevState: string | undefined, formData: FormData) {
  const validatedFields = RegisterSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  })

  if (!validatedFields.success) {
    return "Некорректные данные"
  }

  const { email, password, name } = validatedFields.data

  try {
    try {
      const settings = await (prisma as any).globalSettings.findUnique({
        where: { id: "singleton" }
      })

      if (settings && !settings.registrationEnabled) {
        return "Регистрация временно отключена"
      }
    } catch (e) {

    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return "Пользователь уже существует"
    }

    const hashedPassword = await hashPassword(password)

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })
  } catch (error) {
    console.error(error)
    return "Что-то пошло не так"
  }

  redirect("/login")
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", {
      ...Object.fromEntries(formData),
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Неверные данные для входа."
        default:
          return "Что-то пошло не так."
      }
    }
    
    
    throw error
  }
}

export async function signOutAction() {
  await signOut({ redirect: false })
  redirect("/login")
}
