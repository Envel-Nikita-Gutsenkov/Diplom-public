"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ManualGrading } from "@/components/admin/ManualGrading"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, LayoutGrid, Info, Play, Eye, Terminal } from "lucide-react"
import { useRouter } from "next/navigation"
import { PythonShell } from "@/components/tasks/PythonShell"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { updateSubmissionGrade } from "@/app/actions/grading"

export function QuickReviewClient({ initialSubmissions }: { initialSubmissions: any[] }) {
  const [index, setIndex] = useState(0)
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [showRunner, setShowRunner] = useState(false)
  const router = useRouter()

  const current = submissions[index]
  if (!current) return null

  let taskData: any = {}
  try {
    taskData = JSON.parse(current.taskContent || "{}")
  } catch (e) {}

  const isCode = taskData.type === 'CODE'

  const onGradeSuccess = () => {
    const newSubmissions = [...submissions]
    newSubmissions.splice(index, 1)
    setSubmissions(newSubmissions)
    setShowRunner(false)
    
    if (index >= newSubmissions.length && newSubmissions.length > 0) {
      setIndex(newSubmissions.length - 1)
    }
  }

  const handleNext = () => {
    setIndex(Math.min(submissions.length - 1, index + 1))
    setShowRunner(false)
  }

  const handlePrev = () => {
    setIndex(Math.max(0, index - 1))
    setShowRunner(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-4 text-foreground">
           <div className="h-12 w-12 rounded-xl bg-primary border-2 border-primary flex items-center justify-center font-bold text-xl text-primary-foreground shadow-lg">
              {index + 1}
           </div>
           <div>
              <h1 className="text-2xl font-bold tracking-tight">{current.taskTitle}</h1>
              <p className="text-sm font-medium text-muted-foreground">{current.olympiadTitle}</p>
           </div>
        </div>
        
        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-xl border border-border shadow-sm">
           <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrev}
            disabled={index === 0}
            className="rounded-lg hover:bg-background transition-all"
           >
             <ChevronLeft className="h-5 w-5" />
           </Button>
           <div className="px-5 py-1.5 bg-background rounded-lg border border-border shadow-sm">
             <span className="text-sm font-bold">
                {index + 1} <span className="opacity-30 mx-1">/</span> {submissions.length}
             </span>
           </div>
           <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNext}
            disabled={index === submissions.length - 1}
            className="rounded-lg hover:bg-background transition-all"
           >
             <ChevronRight className="h-5 w-5" />
           </Button>
        </div>
      </div>

      <Card className="border border-border shadow-sm bg-card rounded-[1.5rem] overflow-hidden">
        <CardContent className="p-8 sm:p-12 space-y-12">
          {/* Task Description */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-muted-foreground">
                <Info className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Условие задания</span>
             </div>
             <div className="text-lg leading-relaxed text-foreground/90 font-medium">
                {current.taskDescription}
             </div>
          </div>

          {/* Simple border instead of Separator */}
          <div className="h-[2px] w-full bg-border/50" />

          {/* Participant Answer */}
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <LayoutGrid className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Ответ участника</span>
                </div>
                
                {isCode && (
                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border">
                        <Button 
                            variant={!showRunner ? "default" : "ghost"} 
                            size="sm" 
                            onClick={() => setShowRunner(false)}
                            className="h-8 px-4 rounded-lg font-bold text-[10px] uppercase gap-2"
                        >
                            <Eye className="h-3.5 w-3.5" /> Текст
                        </Button>
                        <Button 
                            variant={showRunner ? "default" : "ghost"} 
                            size="sm" 
                            onClick={() => setShowRunner(true)}
                            className="h-8 px-4 rounded-lg font-bold text-[10px] uppercase gap-2"
                        >
                            <Terminal className="h-3.5 w-3.5" /> Запустить
                        </Button>
                        
                        {taskData.autoCheck && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={async () => {
                                    const tests = taskData.testCases || [];
                                    if (tests.length === 0) {
                                        toast.error("Нет настроенных автотестов");
                                        return;
                                    }

                                    toast.info(`Запуск ${tests.length} автотестов...`);
                                    let passedCount = 0;
                                    const testResults: { name: string; success: boolean; error?: string }[] = [];
                                    const results: string[] = [];

                                    for (const test of tests) {
                                        const fullCode = `${current.answer}\n\n# --- TEST: ${test.name} ---\n${test.script}`;
                                        
                                        try {
                                            const result = await new Promise((resolve) => {
                                                const worker = new Worker("/workers/python-worker.js");
                                                worker.postMessage({ type: "INIT" });
                                                
                                                worker.onmessage = (e) => {
                                                    const { type, error } = e.data;
                                                    if (type === "READY") {
                                                        worker.postMessage({ 
                                                            type: "RUN", 
                                                            code: fullCode, 
                                                            libraries: taskData.libraries || [] 
                                                        });
                                                    } else if (type === "SUCCESS") {
                                                        worker.terminate();
                                                        resolve({ success: true });
                                                    } else if (type === "ERROR") {
                                                        worker.terminate();
                                                        resolve({ success: false, error });
                                                    }
                                                };

                                                setTimeout(() => {
                                                    worker.terminate();
                                                    resolve({ success: false, error: "Timeout" });
                                                }, 10000);
                                            }) as any;

                                            if (result.success) {
                                                passedCount++;
                                                testResults.push({ name: test.name, success: true });
                                                results.push(`✅ ${test.name || 'Без названия'}: Успех`);
                                            } else {
                                                testResults.push({ name: test.name, success: false, error: result.error });
                                                results.push(`❌ ${test.name || 'Без названия'}: ${result.error}`);
                                            }
                                        } catch (e) {
                                            testResults.push({ name: test.name, success: false, error: "Системная ошибка" });
                                            results.push(`❌ ${test.name || 'Без названия'}: Системная ошибка`);
                                        }
                                    }

                                    if (passedCount === tests.length) {
                                        toast.success(`Все тесты пройдены! (${passedCount}/${tests.length})`);
                                        
                                        if (confirm(`Все тесты (${tests.length}) пройдены успешно. Выставить максимальный балл (${current.maxPoints}) автоматически?`)) {
                                            const violations = [`Автопроверка: ${passedCount}/${tests.length} пройдены`, ...results];
                                            const res = await updateSubmissionGrade(current.id, true, current.maxPoints, violations);
                                            if (res.success) {
                                                toast.success("Баллы выставлены успешно");
                                                onGradeSuccess();
                                            }
                                        }
                                    } else {
                                        toast.error(`Тесты не пройдены: ${passedCount}/${tests.length}`);
                                        if (confirm(`Пройдено только ${passedCount} из ${tests.length} тестов. Сохранить этот результат как черновик (0 баллов)?`)) {
                                             const violations = [`Автопроверка: ${passedCount}/${tests.length} пройдены`, ...results];
                                             const res = await updateSubmissionGrade(current.id, false, 0, violations);
                                             if (res.success) {
                                                 toast.info("Результат сохранен");
                                                 onGradeSuccess();
                                             }
                                        }
                                    }
                                    
                                    console.log("AUTO-TEST RESULTS:", results.join("\n"));
                                }}
                                className="h-8 px-4 rounded-lg font-bold text-[10px] uppercase gap-2 border-primary/20 hover:bg-primary/5 text-primary transition-all"
                            >
                                <Play className="h-3.5 w-3.5" /> Автотесты
                            </Button>
                        )}
                    </div>
                )}
             </div>

             {isCode && showRunner ? (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    <PythonShell 
                        code={current.answer} 
                        libraries={taskData.libraries || []} 
                        theme={{ text: "text-primary", btn: "bg-primary" }}
                    />
                </div>
             ) : (
                <div className="p-8 rounded-2xl bg-muted/30 border border-border text-lg leading-relaxed min-h-[250px] max-h-[600px] overflow-y-auto whitespace-pre-wrap font-medium text-foreground custom-scrollbar">
                    {current.answer}
                </div>
             )}
          </div>

          <div className="h-[2px] w-full bg-border/50" />

          {/* Grading Buttons */}
          <div className="py-2">
             <ManualGrading 
               key={current.id}
               submissionId={current.id}
               initialScore={0}
               initialIsCorrect={null}
               maxPoints={current.maxPoints}
               onSaveSuccess={onGradeSuccess}
             />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center pt-2">
        <Button 
          variant="ghost" 
          className="text-xs font-bold text-muted-foreground hover:text-primary transition-all gap-2" 
          onClick={() => router.push('/admin/review')}
        >
          <LayoutGrid className="h-4 w-4" />
          Вернуться к списку работ
        </Button>
      </div>
    </div>
  )
}

