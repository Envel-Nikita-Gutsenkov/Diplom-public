import type { NextAuthConfig } from "next-auth"
import { NextResponse } from "next/server"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      const isOnAdmin = nextUrl.pathname.startsWith("/admin")
      
      console.log(`[AUTH_CONFIG] Authorized check: path=${nextUrl.pathname}, isLoggedIn=${isLoggedIn}, role=${(auth?.user as any)?.role}`);

      if (isOnAdmin) {
        if (isLoggedIn && (auth?.user as any)?.role === "ADMIN") return true
        return false
      } else if (isOnDashboard) {
        if (isLoggedIn) return true
        return false
      }
      return true
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        console.log(`[AUTH_JWT] User logged in: ${user.email}`);
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.role) (session.user as any).role = token.role as "USER" | "ADMIN"

        const userId = token.id || token.sub
        if (userId) (session.user as any).id = userId as string
        
        console.log(`[AUTH_SESSION] Session created for: ${session.user.email}, role: ${(session.user as any).role}`);
      }
      return session
    },
  },
} satisfies NextAuthConfig
