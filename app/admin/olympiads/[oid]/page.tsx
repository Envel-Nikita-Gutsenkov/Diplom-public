export const dynamic = 'force-dynamic';
import { getOlympiadById } from "@/app/actions/olympiad"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Edit, Users, BarChart3, ArrowLeft, Eye, Settings, ListTodo, Plus, Trophy, ChevronRight } from "lucide-react"
import { AdminManagementActions } from "@/components/admin/AdminManagementActions"
import { getOlympiadResults } from "@/app/actions/analytics"

export default async function AdminOlympiadManagementPage({ params }: { params: Promise<{ oid: string }> }) {
  const { oid: id } = await params
  const olympiad = await getOlympiadById(id) as any
  const results = await getOlympiadResults(id)

  const averageScore = results.length > 0 
    ? (results.reduce((acc, r) => acc + r.totalScore, 0) / results.length).toFixed(1) 
    : "0.0"

  if (!olympiad) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{olympiad.title}</h1>
            <p className="text-sm text-muted-foreground font-medium opacity-70">Управление олимпиадой</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <Button variant="default" className="gap-2 font-bold rounded-2xl shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] h-10 px-6" asChild>
                <Link href={`/admin/olympiads/${id}/results`}>
                    <BarChart3 className="h-4 w-4" /> Аналитика
                </Link>
            </Button>
            <Button variant="outline" className="gap-2 rounded-2xl h-10 border-primary/10 hover:border-primary/30" asChild>
                <Link href={`/admin/olympiads/${id}/preview`}>
                    <Eye className="h-4 w-4" /> Предосмотр
                </Link>
            </Button>
            <div className="h-6 w-px bg-muted mx-1 hidden md:block" />
            <AdminManagementActions id={olympiad.id} isActive={olympiad.isActive} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className={olympiad.isActive ? "bg-green-500/5 border-green-500/10" : "bg-primary/5 border-primary/10"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-70">Статус</CardTitle>
            <Badge variant={olympiad.isActive ? "default" : "secondary"}>
              {olympiad.isActive ? "Активна" : "Черновик"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{olympiad.isActive ? "Прием ответов" : "Ожидание"}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Задач</CardTitle>
            <ListTodo className="h-4 w-4 text-primary/40" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{olympiad.tasks?.length || 0}</div>
          </CardContent>
        </Card>

        <Link href={`/admin/olympiads/${id}/results`} className="block">
          <Card className="hover:bg-yellow-500/5 transition-colors cursor-pointer group h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-yellow-600">Результаты</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500/40 group-hover:text-yellow-500 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                Посмотреть <ChevronRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ср. балл</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary/40" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-1 border-2 border-transparent hover:border-primary/10 transition-colors bg-card/10 backdrop-blur-md shadow-lg shadow-black/5">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
               <Settings className="h-4 w-4 text-primary" />
               <CardTitle className="text-xl">Настройки</CardTitle>
            </div>
            <CardDescription>Изменение описания и дат</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Описание</span>
              <p className="text-sm line-clamp-3 text-muted-foreground italic">{olympiad.description}</p>
            </div>
            <Separator className="opacity-50" />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-medium underline decoration-primary/20 underline-offset-4">Начало:</span>
              <span className="font-bold text-foreground/80">{new Date(olympiad.startDate).toLocaleString("ru-RU")}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-medium underline decoration-primary/20 underline-offset-4">Конец:</span>
              <span className="font-bold text-foreground/80">{new Date(olympiad.endDate).toLocaleString("ru-RU")}</span>
            </div>
            <div className="pt-4">
              <Button className="w-full font-bold shadow-md shadow-primary/10" variant="outline" asChild>
                <Link href={`/admin/olympiads/${id}/settings`}>Изменить параметры</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 border-2 border-transparent hover:border-primary/10 transition-colors bg-card/10 backdrop-blur-md shadow-lg shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
               <div className="flex items-center gap-2 mb-2">
                  <ListTodo className="h-4 w-4 text-primary" />
                  <CardTitle className="text-xl">Список задач</CardTitle>
               </div>
              <CardDescription>Задачи этой олимпиады</CardDescription>
            </div>
            <Button size="sm" className="gap-2 font-bold" asChild>
                <Link href={`/admin/olympiads/${id}/tasks`}>
                    <Edit className="h-4 w-4" /> Редактировать задачи
                </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {olympiad.tasks?.map((task: any, idx: number) => (
                <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border-2 border-transparent hover:border-primary/20 transition-all group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary text-base font-bold border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-base group-hover:text-primary transition-colors">{task.title}</p>
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider mt-1 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        {task.points} баллов
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {(!olympiad.tasks || olympiad.tasks.length === 0) && (
                <div className="text-center py-16 border-2 border-dashed rounded-[2rem] bg-muted/5">
                  <p className="text-muted-foreground italic font-medium">Задач пока нет.</p>
                  <Button variant="link" className="mt-2 text-primary font-bold" asChild>
                      <Link href={`/admin/olympiads/${id}/tasks`}>Добавить первую задачу</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
