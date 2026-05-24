import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GroupSelectionForm } from "./GroupSelectionForm"
import { PasswordChangeForm } from "./PasswordChangeForm"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await (prisma.user.findUnique as any)({
    where: { email: session.user.email },
    select: { name: true, email: true, group: true }
  })

  if (!user) redirect("/login")

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Настройки профиля</h1>
        <p className="text-muted-foreground italic">Управление вашими данными</p>
      </div>

      <div className="grid gap-8">
        {/* Your Group Card */}
        <Card className="border-none shadow-xl shadow-primary/5 rounded-[2.5rem] bg-card/50 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="bg-muted/30 border-b border-primary/5 px-8 py-6">
            <CardTitle className="text-xl font-bold">Ваша группа</CardTitle>
            <CardDescription>Укажите вашу учебную группу для участия в олимпиадах</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <GroupSelectionForm initialGroup={user.group || ""} />
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="border-none shadow-xl shadow-primary/5 rounded-[2.5rem] bg-card/50 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 delay-75 duration-500">
          <CardHeader className="bg-muted/30 border-b border-primary/5 px-8 py-6">
            <CardTitle className="text-xl font-bold">Смена пароля</CardTitle>
            <CardDescription>Обновите пароль для защиты вашего аккаунта</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <PasswordChangeForm />
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5 rounded-[2.5rem] bg-card/50 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 delay-150 duration-500">
          <CardHeader className="bg-muted/30 border-b border-primary/5 px-8 py-6">
            <CardTitle className="text-xl font-bold">Личные данные</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-4">
              <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest pt-2">Имя</span>
              <div className="col-span-2 p-3 rounded-2xl bg-muted/30 border border-primary/5 font-semibold">{user.name || "Не указано"}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest pt-2">Email</span>
              <div className="col-span-2 p-3 rounded-2xl bg-muted/30 border border-primary/5 font-semibold opacity-60 italic">{user.email}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
