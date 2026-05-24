import { getUserResultDetail } from "@/app/actions/result"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, AlertCircle, Timer, Award } from "lucide-react"
import { format, formatDistance } from "date-fns"
import { ru } from "date-fns/locale"
import { cn } from "@/lib/utils"

export const dynamic = 'force-dynamic'

export default async function StudentResultDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const result = await getUserResultDetail(id) as any

  if (!result) notFound()

  const olympiad = result.olympiad
  const tasks = olympiad.tasks


  let durationText = "—"
  if (result.startedAt && result.finishedAt) {
    const diffMs = new Date(result.finishedAt).getTime() - new Date(result.startedAt).getTime()
    const mins = Math.floor(diffMs / 60000)
    const secs = Math.floor((diffMs % 60000) / 1000)
    durationText = mins > 0 ? `${mins} мин ${secs} сек` : `${secs} сек`
  }

  const themeMap: Record<string, { bg: string, text: string, border: string, accent: string, btn: string, shadow: string, glow: string, gradient: string }> = {
    indigo: {
      bg: "bg-indigo-50/30", text: "text-indigo-600", border: "border-indigo-100", accent: "bg-indigo-100/50",
      btn: "bg-indigo-600 hover:bg-indigo-700", shadow: "shadow-indigo-200", glow: "group-hover:bg-indigo-500/10",
      gradient: "from-indigo-50/50 via-blue-50/30 to-white"
    },
    amber: {
      bg: "bg-amber-50/30", text: "text-amber-700", border: "border-amber-100", accent: "bg-amber-100/50",
      btn: "bg-amber-600 hover:bg-amber-700", shadow: "shadow-amber-200", glow: "group-hover:bg-amber-500/10",
      gradient: "from-amber-50/50 via-orange-50/30 to-white"
    },
    emerald: {
      bg: "bg-emerald-50/30", text: "text-emerald-700", border: "border-emerald-100", accent: "bg-emerald-100/50",
      btn: "bg-emerald-600 hover:bg-emerald-700", shadow: "shadow-emerald-200", glow: "group-hover:bg-emerald-500/10",
      gradient: "from-emerald-50/50 via-teal-50/30 to-white"
    },
    rose: {
      bg: "bg-rose-50/30", text: "text-rose-700", border: "border-rose-100", accent: "bg-rose-100/50",
      btn: "bg-rose-600 hover:bg-rose-700", shadow: "shadow-rose-200", glow: "group-hover:bg-rose-500/10",
      gradient: "from-rose-50/50 via-pink-50/30 to-white"
    },
    violet: {
      bg: "bg-violet-50/30", text: "text-violet-700", border: "border-violet-100", accent: "bg-violet-100/50",
      btn: "bg-violet-600 hover:bg-violet-700", shadow: "shadow-violet-200", glow: "group-hover:bg-violet-500/10",
      gradient: "from-violet-50/50 via-purple-50/30 to-white"
    },
    cyan: {
      bg: "bg-cyan-50/30", text: "text-cyan-700", border: "border-cyan-100", accent: "bg-cyan-100/50",
      btn: "bg-cyan-600 hover:bg-cyan-700", shadow: "shadow-cyan-200", glow: "group-hover:bg-cyan-500/10",
      gradient: "from-cyan-50/50 via-sky-50/30 to-white"
    },
  }
  const theme = themeMap[olympiad.colorTheme || "amber"] || themeMap.amber
  const emoji = olympiad.emoji || "🏆"

  const isOlympiadEnded = new Date(olympiad.endDate) < new Date()
  const canShowDetails = isOlympiadEnded || !olympiad.isActive
  const leaderboard = result.leaderboard || []

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground group rounded-xl transition-all">
          <Link href={`/dashboard/results`}>
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            Назад к результатам
          </Link>
        </Button>
      </div>

      <Card className={`border-none shadow-sm rounded-[2.5rem] bg-gradient-to-br ${theme.gradient} overflow-hidden relative border ${theme.border}/50 transition-all duration-500 hover:shadow-md group`}>
        <div className={`absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] ${theme.text}/10 via-transparent to-transparent opacity-70`}></div>

        <CardContent className="p-10 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className={`h-24 w-24 rounded-[2.5rem] bg-gradient-to-br ${theme.text}/20 to-${theme.text}/10 p-0.5 shadow-sm shrink-0 transition-transform duration-500 group-hover:scale-110`}>
                <div className="w-full h-full rounded-[2.4rem] bg-white flex items-center justify-center backdrop-blur-md border border-white/50 text-4xl">
                  {emoji}
                </div>
              </div>
              <div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${theme.bg} backdrop-blur-md border ${theme.border}/50 text-[10px] font-bold uppercase tracking-widest ${theme.text} mb-2 shadow-sm`}>
                  <Award className="w-3.5 h-3.5" />
                  Результат получен
                </div>
                <h2 className="text-4xl font-black tracking-tight leading-tight text-slate-800 drop-shadow-sm">
                  {olympiad.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-slate-500 font-medium font-sans">
                  <span className={`${theme.bg} px-3 py-1 rounded-lg border ${theme.border}/50 text-xs`}>Дата завершения: {result.updatedAt ? format(new Date(result.updatedAt), "d MMMM yyyy, HH:mm", { locale: ru }) : "—"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <div className="flex-1 min-w-[150px] p-6 rounded-[2rem] bg-white/60 backdrop-blur-md border border-white/50 text-center flex flex-col items-center justify-center shadow-sm hover:scale-105 transition-all hover:bg-white">
                <p className={`text-[10px] font-black uppercase tracking-widest ${theme.text} opacity-70 mb-2`}>Баллы</p>
                <p className="text-4xl font-black text-slate-900 drop-shadow-sm">{result.totalScore}</p>
              </div>
              <div className="flex-1 min-w-[150px] p-6 rounded-[2rem] bg-white/60 backdrop-blur-md border border-white/50 text-center flex flex-col items-center justify-center shadow-sm hover:scale-105 transition-all hover:bg-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Время</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-black text-slate-900 drop-shadow-sm">{durationText}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className={`w-1.5 h-6 rounded-full ${theme.text} opacity-50`}></div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-800">Детали решения</h3>
          </div>

          {!canShowDetails ? (
            <div className="p-12 rounded-[2.5rem] bg-amber-500/5 border-2 border-dashed border-amber-500/20 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto opacity-50" />
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-amber-700">Вопросы и ответы скрыты</h4>
                <p className="text-amber-600/70 max-w-md mx-auto text-sm font-medium">
                  Подробные результаты станут доступны только после окончательного завершения олимпиады для всех участников (<b>{format(new Date(olympiad.endDate), "d MMMM, HH:mm", { locale: ru })}</b>).
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {tasks.map((task: any, idx: number) => {
                const submission = task.submissions ? task.submissions[0] : null
                return (
                  <Card key={task.id} className={`border border-slate-100 shadow-sm rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-xl hover:${theme.shadow}/10 bg-white`}>
                    <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-slate-50 bg-slate-50/30 px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl bg-white border ${theme.border} flex items-center justify-center font-bold text-xl ${theme.text} shadow-sm`}>
                          {idx + 1}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-slate-800">{task.title}</CardTitle>
                          <CardDescription className="font-bold text-[10px] tracking-widest uppercase text-slate-400">{task.points} баллов</CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={submission?.isCorrect ? "default" : (submission?.isCorrect === false ? "destructive" : "secondary")}
                        className={cn(
                          "rounded-full px-4 py-1.5 font-bold text-[10px] tracking-widest uppercase shadow-sm border-none",
                          submission?.isCorrect && "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
                          submission?.isCorrect === false && "bg-rose-100 text-rose-700 hover:bg-rose-200",
                          submission?.isCorrect === null && submission && "bg-amber-100 text-amber-700 hover:bg-amber-200",
                          !submission && "bg-slate-100 text-slate-400"
                        )}
                      >
                        {submission?.isCorrect ? "Верно" : (submission?.isCorrect === false ? "Ошибка" : (submission ? "Проверка" : "Пропущено"))}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-8 md:p-10">
                      <div className="grid lg:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-1 pl-1">
                            <AlertCircle className={`h-4 w-4 ${theme.text} opacity-40`} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Условие</p>
                          </div>
                          <div className={`p-6 rounded-[2rem] ${theme.bg} border ${theme.border}/50 text-sm leading-relaxed text-slate-600 font-medium`}>
                            {task.description}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-1 pl-1">
                            <CheckCircle2 className={cn("h-4 w-4", submission?.isCorrect ? "text-emerald-500" : "text-slate-400")} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ваш ответ</p>
                          </div>
                          <div className={cn(
                            "p-6 rounded-[2rem] border font-mono text-sm leading-relaxed min-h-[120px] whitespace-pre-wrap flex items-center justify-center md:justify-start transition-colors",
                            submission?.isCorrect ? "border-emerald-100 bg-emerald-50/30 text-emerald-800" :
                              submission?.isCorrect === false ? "border-rose-100 bg-rose-50/30 text-rose-800" :
                                submission ? "border-amber-100 bg-amber-50/30 text-amber-800" :
                                  "border-slate-100 bg-slate-50/50 text-slate-400 italic text-center font-sans"
                          )}>
                            {(() => {
                              if (!submission) return "Ответ не был отправлен";
                              try {
                                const taskData = JSON.parse(task.content);
                                if (taskData.type === 'MULTIPLE_CHOICE' && taskData.options) {
                                  const optIdx = parseInt(submission.answer);
                                  const optionText = taskData.options[optIdx] || submission.answer;
                                  return `Выбран ответ: ${optionText}`;
                                }
                                if (taskData.type === 'CHECKBOX' && taskData.options) {
                                  const selectedIndices = submission.answer.split(',').map((s: string) => parseInt(s.trim()));
                                  const selectedTexts = selectedIndices.map((idx: number) => taskData.options[idx] || idx.toString());
                                  return `Выбраны ответы:\n- ${selectedTexts.join('\n- ')}`;
                                }
                                if (taskData.type === 'TEXT') {
                                  return submission.answer;
                                }
                              } catch (e) { }
                              return submission.answer;
                            })()}
                          </div>
                          {submission && submission.score !== null && (
                            <div className="flex justify-end pt-2">
                              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm text-xs font-bold text-slate-500">
                                Балл: <span className={cn("text-base", (submission.score || 0) > 0 ? "text-emerald-600" : "text-slate-400")}>{submission.score}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            < Award className="h-5 w-5 text-yellow-500" />
            <h3 className="text-xl font-bold tracking-tight text-slate-800">Таблица лидеров</h3>
          </div>

          <Card className="rounded-[2rem] border border-slate-100 shadow-lg overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {leaderboard.map((leader: any, lidx: number) => (
                  <div key={leader.id} className={cn(
                    "flex items-center justify-between p-4 px-6 transition-all hover:bg-slate-50/50",
                    leader.userId === result.userId && `${theme.bg} font-bold`
                  )}>
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black shadow-sm",
                        lidx === 0 ? "bg-yellow-100 text-yellow-700" :
                          lidx === 1 ? "bg-slate-100 text-slate-700" :
                            lidx === 2 ? "bg-orange-100 text-orange-700" :
                              "bg-white border text-slate-400"
                      )}>
                        {lidx + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-700 truncate max-w-[120px]">
                          {leader.user?.name || "Аноним"}
                        </span>
                      </div>
                    </div>
                    <span className={`text-sm font-black ${theme.text}`}>
                      {leader.totalScore}
                    </span>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <div className="p-10 text-center text-slate-400 italic text-xs">
                    Таблица пуста
                  </div>
                )}
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  )
}
