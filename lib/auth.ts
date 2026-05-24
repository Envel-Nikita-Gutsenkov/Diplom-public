import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { comparePassword } from "./password"
import { authConfig } from "./auth.config"

import type { Adapter } from "next-auth/adapters"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    trustHost: true,
    
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(1) })
                    .safeParse(credentials)

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data
                    const user = await prisma.user.findUnique({
                        where: { email },
                    })

                    if (!user || !user.password) return null

                    const passwordsMatch = await comparePassword(password, user.password)

                    if (passwordsMatch) {
                        console.log(`[AUTH_AUTHORIZE] Success for ${email}`);
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                        } as any
                    }
                }

                console.log(`[AUTH_AUTHORIZE] Failed for ${credentials?.email}`);
                return null
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
    },
})
