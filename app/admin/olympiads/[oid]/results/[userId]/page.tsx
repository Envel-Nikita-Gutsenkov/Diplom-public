export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { getOlympiadById } from "@/app/actions/olympiad"
import { getUserOlympiadStats } from "@/app/actions/analytics"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, AlertCircle, Timer, User as UserIcon, ShieldAlert, Fingerprint } from "lucide-react"
import { format, formatDistance } from "date-fns"
import { ru } from "date-fns/locale"
import { UserResultResetButton } from "@/components/admin/UserResultResetButton"
import { UserResultVoidButton } from "@/components/admin/UserResultVoidButton"
import { ManualGrading } from "@/components/admin/ManualGrading"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StudentCodeRunner } from "@/components/admin/StudentCodeRunner"

export default async function ParticipantStatsPage({ 
  params 
}: { 
  params: Promise<{ oid: string; userId: string }> 
}) {
  const { oid: id, userId } = await params
  console.log(`[STATS_PAGE] HANDLER START: oid=${id}, userId=${userId}`)

  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    console.warn(`[STATS_PAGE] Unauthorized access attempt by ${session?.user?.email || 'unauthenticated user'}`)
    redirect("/login")
  }
  
  let olympiad, stats;

  try {
    console.log(`[STATS_PAGE] STEP 1: Fetching Olympiad...`)
    olympiad = await getOlympiadById(id)
    if (!olympiad) {
      console.error(`[STATS_PAGE] STEP 1 FAIL: Olympiad not found: ${id}`)
      return notFound()
    }
    console.log(`[STATS_PAGE] STEP 1 OK: Title=${olympiad.title}`)

    console.log(`[STATS_PAGE] STEP 2: Fetching Stats...`)
    stats = await getUserOlympiadStats(userId, id)
    if (!stats) {
      console.error(`[STATS_PAGE] STEP 2 FAIL: Stats not found for ${userId}`)
      return notFound()
    }
    console.log(`[STATS_PAGE] STEP 2 OK: Tasks count=${stats.tasks?.length}`)

    const result = stats.result as any
    const user = result?.user
    
    let durationText = "—"
    if (result?.startedAt && result?.updatedAt) {
      try {
        durationText = formatDistance(new Date(result.startedAt), new Date(result.updatedAt), { locale: ru })
      } catch (e) {
        console.warn("[STATS_PAGE] Date formatting failed", e)
      }
    }

    console.log(`[STATS_PAGE] STEP 3: Rendering Main UI...`)

    return (
      <div className="space-y-6 max-w-5xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href={`/admin/olympiads/${id}/results`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-black tracking-tight truncate">Статистика участника</h1>
            <p className="text-muted-foreground italic truncate">{olympiad.title}</p>
          </div>
            <UserResultResetButton 
              olympiadId={id} 
              userId={userId} 
              variant="outline"
              className="rounded-xl shadow-lg"
            />
            <UserResultVoidButton 
              olympiadId={id} 
              userId={userId} 
              variant="destructive"
              className="rounded-xl shadow-lg shadow-destructive/10"
            />
          </div>

        <Card className="border-none shadow-xl shadow-primary/5 rounded-[2.5rem] bg-card/50 backdrop-blur-md overflow-hidden">
            <CardContent className="p-6 sm:p-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[1.5rem] sm:rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 shadow-inner">
                            <UserIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-2xl sm:text-3xl font-black tracking-tight truncate">{user?.name || "Без имени"}</h2>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-muted-foreground">
                              <span className="text-sm font-medium truncate max-w-[200px]">{user?.email || userId}</span>
                              <Separator orientation="vertical" className="h-4 bg-primary/10 hidden sm:block" />
                              <span className="text-sm font-bold text-primary/70 whitespace-nowrap">Итого: {result?.totalScore || 0} баллов</span>
                          </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4 w-full lg:w-auto">
                          <div className="p-3 sm:p-4 rounded-[1.25rem] sm:rounded-[1.5rem] bg-muted/30 border border-primary/5 text-center flex flex-col items-center justify-center shadow-sm">
                              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Место</p>
                              <p className="text-lg sm:text-xl font-black">#{result?.rank || "-"}</p>
                          </div>
                          <div className="p-3 sm:p-4 rounded-[1.25rem] sm:rounded-[1.5rem] bg-muted/30 border border-primary/5 text-center flex flex-col items-center justify-center shadow-sm">
                              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Время</p>
                              <div className="text-lg sm:text-xl font-black flex items-center justify-center gap-2">
                                  <Timer className="h-4 w-4 text-primary shrink-0" />
                                  <span className="truncate">{durationText}</span>
                              </div>
                          </div>
                          <div className="p-3 sm:p-4 rounded-[1.25rem] sm:rounded-[1.5rem] bg-muted/30 border border-primary/5 text-center flex flex-col items-center justify-center shadow-sm">
                              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Верно</p>
                              <p className="text-lg sm:text-xl font-black text-green-600">
                                  {stats.tasks?.filter((t: any) => t.submissions[0]?.isCorrect).length || 0} / {stats.tasks?.length || 0}
                              </p>
                          </div>
                          <div className="p-3 sm:p-4 rounded-[1.25rem] sm:rounded-[1.5rem] bg-muted/30 border border-primary/5 text-center flex flex-col items-center justify-center shadow-sm">
                              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Баллы</p>
                              <p className="text-lg sm:text-xl font-black">
                                  {result?.totalScore || 0}
                              </p>
                          </div>
                     </div>
                </div>
            </CardContent>
        </Card>
        
        {result?.violations?.includes("Результат аннулирован администратором") && (
            <div className="bg-destructive text-destructive-foreground p-6 rounded-[2.5rem] shadow-2xl shadow-destructive/20 mb-6 flex items-center justify-between border-4 border-destructive-foreground/20 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                        <ShieldAlert className="h-10 w-10 text-white" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter">РЕЗУЛЬТАТ АННУЛИРОВАН</h3>
                        <p className="font-bold opacity-80">Данный участник был дисквалифицирован администратором. Все баллы обнулены.</p>
                    </div>
                </div>
            </div>
        )}
        
        {result?.violations && result.violations.length > 0 && (
            <Alert variant="destructive" className="rounded-[2.5rem] border-none bg-rose-500/10 p-8 shadow-2xl shadow-rose-500/10 mb-6 flex flex-col sm:flex-row items-start gap-6 border-l-8 border-rose-500">
                <div className="h-14 w-14 rounded-2xl bg-rose-500 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/40">
                    <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-3 flex-1 min-w-0">
                    <AlertTitle className="font-black text-2xl sm:text-3xl text-rose-700 leading-tight col-start-auto">
                        Зафиксированы нарушения! ({result.violations.length})
                    </AlertTitle>
                    <AlertDescription className="space-y-4 col-start-auto text-rose-600/90">
                        <p className="text-sm font-bold uppercase tracking-widest leading-relaxed">
                            Система безопасности обнаружила подозрительную активность:
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {result.violations.map((v: string, i: number) => (
                                <Badge key={i} variant="outline" className="bg-white/80 border-rose-200 text-rose-700 font-mono text-[10px] px-3 py-1 rounded-lg shadow-sm">
                                    {v}
                                </Badge>
                            ))}
                        </div>
                    </AlertDescription>
                </div>
            </Alert>
        )}

        <div className="space-y-10 mt-12">
            {stats.tasks?.map((task: any, idx: number) => {
                const submission = task.submissions[0]
                const taskViolations = submission?.violations || []
                
                let isAutoChecked = false;
                try {
                    const taskData = JSON.parse(task.content);
                    if (taskData.type === 'CODE' && taskData.autoCheck && taskData.testCases?.length > 0) {
                        isAutoChecked = true;
                    }
                } catch (e) {}
                
                return (
                    <Card key={task.id} className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden group bg-white/70 backdrop-blur-sm border border-white/50">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/5 bg-slate-50/50 px-8 py-8 sm:px-12">
                            <div className="flex items-center gap-6 min-w-0">
                                <div className="h-14 w-14 rounded-[1.5rem] bg-slate-900 flex items-center justify-center font-black text-xl text-white shadow-xl">
                                    {idx + 1}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-xl font-black text-slate-800 truncate">{task.title}</CardTitle>
                                        {isAutoChecked && (
                                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 gap-1.5 px-3 py-1 text-[10px] uppercase tracking-widest font-black shrink-0">
                                                <Fingerprint className="w-3 h-3" />
                                                Автопроверка
                                            </Badge>
                                        )}
                                        {taskViolations.length > 0 && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex items-center justify-center h-8 w-8 rounded-2xl bg-rose-500 text-white animate-pulse cursor-help">
                                                            <AlertCircle className="h-5 w-5" />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="bg-slate-900 text-white p-5 rounded-[2rem] shadow-2xl z-[100] max-w-xs">
                                                        <div className="space-y-3">
                                                            <p className="font-black text-[10px] uppercase tracking-[0.2em] text-rose-400 border-b border-white/10 pb-2">Нарушения</p>
                                                            <div className="space-y-1.5">
                                                                {taskViolations.map((v: string, i: number) => (
                                                                    <p key={i} className="text-[10px] font-mono leading-tight bg-white/5 p-2 rounded-xl">
                                                                        {v}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                    <CardDescription className="font-black text-[10px] tracking-[0.2em] uppercase text-primary/60 mt-2">Ценность: {task.points} баллов</CardDescription>
                                </div>
                            </div>
                             <Badge 
                                 variant={submission?.isCorrect ? "default" : (submission?.isCorrect === false ? "destructive" : "secondary")} 
                                 className={cn(
                                     "rounded-2xl px-6 py-2.5 font-black text-[10px] tracking-[0.2em] uppercase transition-all shadow-lg border-none w-fit",
                                     submission?.isCorrect === null && submission && "bg-amber-400 text-amber-900",
                                     submission?.isCorrect && "bg-emerald-500 text-white",
                                     submission?.isCorrect === false && "bg-rose-500 text-white",
                                     !submission && "bg-slate-200 text-slate-500"
                                 )}
                             >
                                 {submission?.isCorrect ? "Принято" : (submission?.isCorrect === false ? "Ошибка" : (submission ? "На проверке" : "Пропущено"))}
                             </Badge>
                        </CardHeader>
                        <CardContent className="p-8 sm:p-12 space-y-10">
                            <div className="grid lg:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-1 pl-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Условие</p>
                                    </div>
                                     <div className="p-8 sm:p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100/50 text-base leading-relaxed text-slate-700 font-medium shadow-inner min-h-[160px]">
                                         {task.description}
                                     </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-1 pl-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ответ</p>
                                    </div>
                                     <div className={cn(
                                        "p-8 sm:p-10 rounded-[2.5rem] border-2 font-mono text-sm leading-relaxed min-h-[160px] whitespace-pre-wrap transition-all shadow-xl",
                                        submission?.isCorrect ? "border-emerald-500/10 bg-emerald-50/20 text-emerald-800" :
                                          submission ? "border-rose-500/10 bg-rose-50/20 text-rose-800" :
                                            "border-slate-100 bg-slate-50/50 text-slate-400 italic text-center flex items-center justify-center font-sans"
                                     )}>
                                         {(() => {
                                             if (!submission) return "Ответ не предоставлен";
                                             try {
                                                 const taskData = JSON.parse(task.content);
                                                 if (taskData.type === 'MULTIPLE_CHOICE' && taskData.options) {
                                                     const optIdx = parseInt(submission.answer);
                                                     const optionText = taskData.options[optIdx] || submission.answer;
                                                     return `✓ Выбран вариант: ${optionText}`;
                                                 }
                                                 if (taskData.type === 'CHECKBOX' && taskData.options) {
                                                   const selectedIndices = submission.answer.split(',').map((s: string) => parseInt(s.trim()));
                                                   const selectedTexts = selectedIndices.map((idx: number) => taskData.options[idx] || idx.toString());
                                                   return `✓ Выбрано несколько вариантов:\n- ${selectedTexts.join('\n- ')}`;
                                                 }
                                                 if (taskData.type === 'CODE') {
                                                   return (
                                                     <StudentCodeRunner 
                                                       initialCode={submission.answer} 
                                                       testCases={taskData.testCases}
                                                       libraries={taskData.libraries}
                                                     />
                                                   );
                                                 }
                                             } catch (e) {}
                                             return submission.answer;
                                         })()}
                                     </div>
                                     
                                     {submission && (() => {
                                         try {
                                             const taskData = JSON.parse(task.content);
                                             if (taskData.type === 'TEXT' || taskData.type === 'CODE') {
                                                 return (
                                                     <div className="mt-8">
                                                         <ManualGrading 
                                                              submissionId={submission.id}
                                                              initialScore={submission.score}
                                                              initialIsCorrect={submission.isCorrect}
                                                              maxPoints={task.points}
                                                              canRegrade={taskData.type === 'CODE' && taskData.autoCheck === true}
                                                         />
                                                     </div>
                                                 )
                                             }
                                         } catch (e) {}
                                         return null;
                                     })()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
      </div>
    )
  } catch (err: any) {
    console.error(`[STATS_PAGE] STEP CRITICAL FAIL:`, err)
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <Card className="max-w-xl w-full border-none shadow-2xl rounded-[4rem] bg-white p-12 text-center space-y-10">
           <AlertCircle className="h-20 w-20 text-rose-600 mx-auto" />
           <h2 className="text-4xl font-black">Ошибка данных</h2>
           <p className="text-slate-500 font-bold">{err.message}</p>
           <Button asChild size="lg" className="h-16 px-10 rounded-3xl bg-slate-900">
             <Link href={`/admin/olympiads/${id}/results`}>Вернуться назад</Link>
           </Button>
        </Card>
      </div>
    )
  }
}
