import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/common/Sidebar"
import { checkAutoBackup } from "@/app/actions/settings"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  





  
  checkAutoBackup().catch(console.error)

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
        {children}
      </main>
    </div>
  )
}
