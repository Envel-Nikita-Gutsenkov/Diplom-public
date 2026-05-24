import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/common/Sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  console.log("[DASHBOARD_LAYOUT] Session:", session ? `User: ${session.user?.email}` : "NULL");
  
  






  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
        {children}
      </main>
    </div>
  )
}
