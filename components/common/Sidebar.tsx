import Link from "next/link"
import { auth } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export async function Sidebar() {
  const session = await auth()
  const isAdmin = (session?.user as any)?.role === "ADMIN"

  return (
    <nav className="w-64 border-r border-primary/5 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md flex flex-col h-full shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="flex-1 overflow-y-auto py-6 space-y-8">
        <div className="px-5">
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
            Кабинет
          </h2>
          <div className="space-y-2">
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start font-semibold hover:bg-primary/5 hover:text-primary transition-all duration-300 group")}>
              Обзор
            </Link>
            <Link href="/dashboard/results" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start font-semibold hover:bg-primary/5 hover:text-primary transition-all duration-300 group")}>
              Мои результаты
            </Link>
            <Link href="/dashboard/settings" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start font-semibold hover:bg-primary/5 hover:text-primary transition-all duration-300 group")}>
              Настройки
            </Link>
          </div>
        </div>

        {isAdmin && (
          <div className="px-5 pt-8 border-t border-primary/5">
            <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40">
              Администрирование
            </h2>
            <div className="space-y-2">
              <Link href="/admin" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start font-semibold hover:bg-primary/5 hover:text-primary transition-all duration-300 group")}>
                Список олимпиад
              </Link>
              <Link href="/admin/create" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start font-semibold hover:bg-primary/5 hover:text-primary transition-all duration-300 group")}>
                Создать олимпиаду
              </Link>
              <Link href="/admin/review" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start font-semibold hover:bg-primary/5 hover:text-primary transition-all duration-300 group")}>
                Проверка работ
              </Link>
              <Link href="/admin/results" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start font-semibold hover:bg-primary/5 hover:text-primary transition-all duration-300 group")}>
                Результаты
              </Link>
              <Link href="/admin/users" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start font-semibold hover:bg-primary/5 hover:text-primary transition-all duration-300 group")}>
                Управление пользователями
              </Link>
              <Link href="/admin/settings" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start font-semibold hover:bg-primary/5 hover:text-primary transition-all duration-300 group")}>
                Настройки системы
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
