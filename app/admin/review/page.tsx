import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ClipboardCheck, User as UserIcon, ArrowRight, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"

export default async function AdminReviewPage() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard")
  }


  const pendingSubmissions = await prisma.submission.findMany({
    where: {
      isCorrect: null,
      task: {
        OR: [
          { content: { contains: '"type":"CODE"' } },
          { content: { contains: '"type":"TEXT"' } }
        ]
      }
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          group: true
        }
      },
      task: {
        include: {
          olympiad: {
            select: {
              title: true
            }
          }
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  }) as any[]


  const groups: Record<string, any> = {}
  pendingSubmissions.forEach((sub: any) => {
    const key = `${sub.userId}-${sub.task.olympiadId}`
    if (!groups[key]) {
      groups[key] = {
        userId: sub.userId,
        olympiadId: sub.task.olympiadId,
        user: sub.user,
        olympiadTitle: sub.task.olympiad.title,
        count: 0,
        latestDate: sub.updatedAt
      }
    }
    groups[key].count++
  })

  const reviewGroups = Object.values(groups)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Проверка работ</h1>
          <p className="text-muted-foreground italic">Список участников, чьи работы ожидают ручной проверки</p>
        </div>
        {reviewGroups.length > 0 && (
          <Button asChild className="rounded-2xl gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
            <Link href="/admin/review/quick">
              <ClipboardCheck className="h-4 w-4" />
              Быстрая проверка
            </Link>
          </Button>
        )}
      </div>

      {reviewGroups.length === 0 ? (
        <Card className="border-none shadow-xl shadow-primary/5 rounded-[2.5rem] bg-card/50 backdrop-blur-md">
          <CardContent className="p-20 text-center">
            <div className="h-20 w-20 rounded-[2rem] bg-green-500/10 flex items-center justify-center border border-green-500/20 mx-auto mb-6">
              <ClipboardCheck className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Все работы проверены!</h3>
            <p className="text-muted-foreground">Новых работ для проверки пока нет.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviewGroups.map((group: any) => (
            <Card key={`${group.userId}-${group.olympiadId}`} className="border-none shadow-lg shadow-primary/5 rounded-[2rem] overflow-hidden hover:shadow-xl transition-all group">
              <CardHeader className="bg-muted/30 border-b border-primary/5 px-6 py-4 flex flex-row items-center justify-between">
                <Badge variant="outline" className="rounded-full bg-primary/5 border-primary/10 text-primary font-bold">
                  {group.count} {group.count === 1 ? 'задача' : 'задачи'}
                </Badge>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(group.latestDate), { addSuffix: true, locale: ru })}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <UserIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{group.user.name || "Без имени"}</h3>
                    <p className="text-xs text-muted-foreground">{group.user.group || group.user.email}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Олимпиада</p>
                    <p className="text-sm font-semibold truncate text-primary/80">{group.olympiadTitle}</p>
                </div>

                <Button className="w-full rounded-2xl font-bold gap-2 shadow-lg shadow-primary/10 group-hover:bg-primary transition-all" asChild>
                  <Link href={`/admin/olympiads/${group.olympiadId}/results/${group.userId}`}>
                    Проверить <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
