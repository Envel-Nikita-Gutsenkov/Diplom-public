import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { QuickReviewClient } from "./QuickReviewClient"

export default async function QuickReviewPage() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
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
      task: {
        include: {
          olympiad: true
        }
      },
      user: true
    },
    orderBy: {
      updatedAt: 'asc'
    }
  })


  const formattedSubmissions = pendingSubmissions.map(sub => ({
    id: sub.id,
    answer: sub.answer,
    score: sub.score,
    isCorrect: sub.isCorrect,
    taskTitle: sub.task.title,
    taskDescription: sub.task.description,
    maxPoints: sub.task.points,
    olympiadTitle: sub.task.olympiad.title,
    taskContent: sub.task.content
  }))

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Быстрая проверка</h1>
          <p className="text-muted-foreground italic">Проверка всех ожидающих работ в одно касание</p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
          Осталось: {formattedSubmissions.length}
        </div>
      </div>

      {formattedSubmissions.length > 0 ? (
        <QuickReviewClient initialSubmissions={formattedSubmissions} />
      ) : (
        <Card className="border-none shadow-xl shadow-primary/5 rounded-[2.5rem] bg-card/50 backdrop-blur-md p-12 text-center">
          <CardTitle className="text-2xl mb-2">Все работы проверены! 🎉</CardTitle>
          <CardDescription>Ожидающих работ не найдено.</CardDescription>
        </Card>
      )}
    </div>
  )
}
