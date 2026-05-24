"use client"

import { useState, useEffect, useRef } from "react"
import { submitAnswer, finishOlympiad, startOlympiad } from "@/app/actions/submission"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Loader2, AlertCircle, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Editor from 'react-simple-code-editor'

import prism from 'prismjs'
import { PythonShell } from "@/components/tasks/PythonShell"
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-python'
import 'prismjs/themes/prism-tomorrow.css'
import { logViolation } from "@/app/actions/violations"
import { toast } from "sonner"

interface Task {
  id: string
  title: string
  content: string
  description: string
}

interface TaskContent {
  type: 'MULTIPLE_CHOICE' | 'CHECKBOX' | 'TEXT' | 'CODE'
  options?: string[]
  libraries?: string[]
}

interface TaskListProps {
  tasks: Task[]
  olympiadId: string
  colorTheme: string
  emoji: string
  duration: number
  olympiadEndDate: Date
  preventCopyPaste?: boolean
  preventBlur?: boolean
  shuffleTasks?: boolean
  initialAnswers?: Record<string, string>
}

export default function TaskList({ 
  tasks: initialTasks, 
  olympiadId, 
  colorTheme, 
  emoji, 
  duration, 
  olympiadEndDate, 
  preventCopyPaste = false,
  preventBlur = false,
  shuffleTasks = false,
  initialAnswers = {} 
}: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({})
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [isFinishedRef] = useState({ current: false })
  const timeLeftRef = useRef<number | null>(null)
  const isInternalAction = useRef(false)
  const [fullScreenTask, setFullScreenTask] = useState<string | null>(null)

  const themeMap: Record<string, { bg: string, text: string, border: string, accent: string, btn: string, shadow: string }> = {
    indigo: {
      bg: "bg-indigo-50/30", text: "text-indigo-600", border: "border-indigo-100", accent: "bg-indigo-100/50",
      btn: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200", shadow: "shadow-indigo-500/5"
    },
    amber: {
      bg: "bg-amber-50/30", text: "text-amber-700", border: "border-amber-100", accent: "bg-amber-100/50",
      btn: "bg-amber-600 hover:bg-amber-700 shadow-amber-200", shadow: "shadow-amber-500/5"
    },
    emerald: {
      bg: "bg-emerald-50/30", text: "text-emerald-700", border: "border-emerald-100", accent: "bg-emerald-100/50",
      btn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200", shadow: "shadow-emerald-500/5"
    },
    rose: {
      bg: "bg-rose-50/30", text: "text-rose-700", border: "border-rose-100", accent: "bg-rose-100/50",
      btn: "bg-rose-600 hover:bg-rose-700 shadow-rose-200", shadow: "shadow-rose-500/5"
    },
    violet: {
      bg: "bg-violet-50/30", text: "text-violet-700", border: "border-violet-100", accent: "bg-violet-100/50",
      btn: "bg-violet-600 hover:bg-violet-700 shadow-violet-200", shadow: "shadow-violet-500/5"
    },
    cyan: {
      bg: "bg-cyan-50/30", text: "text-cyan-700", border: "border-cyan-100", accent: "bg-cyan-100/50",
      btn: "bg-cyan-600 hover:bg-cyan-700 shadow-cyan-200", shadow: "shadow-cyan-500/5"
    },
    blue: {
      bg: "bg-blue-50/30", text: "text-blue-600", border: "border-blue-100", accent: "bg-blue-100/50",
      btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-200", shadow: "shadow-blue-500/5"
    },
    sky: {
      bg: "bg-sky-50/30", text: "text-sky-600", border: "border-sky-100", accent: "bg-sky-100/50",
      btn: "bg-sky-600 hover:bg-sky-700 shadow-sky-200", shadow: "shadow-sky-500/5"
    },
    teal: {
      bg: "bg-teal-50/30", text: "text-teal-700", border: "border-teal-100", accent: "bg-teal-100/50",
      btn: "bg-teal-600 hover:bg-teal-700 shadow-teal-200", shadow: "shadow-teal-500/5"
    },
    green: {
      bg: "bg-green-50/30", text: "text-green-700", border: "border-green-100", accent: "bg-green-100/50",
      btn: "bg-green-600 hover:bg-green-700 shadow-green-200", shadow: "shadow-green-500/5"
    },
    lime: {
      bg: "bg-lime-50/30", text: "text-lime-700", border: "border-lime-100", accent: "bg-lime-100/50",
      btn: "bg-lime-600 hover:bg-lime-700 shadow-lime-200", shadow: "shadow-lime-500/5"
    },
    orange: {
      bg: "bg-orange-50/30", text: "text-orange-700", border: "border-orange-100", accent: "bg-orange-100/50",
      btn: "bg-orange-600 hover:bg-orange-700 shadow-orange-200", shadow: "shadow-orange-500/5"
    },
    red: {
      bg: "bg-red-50/30", text: "text-red-700", border: "border-red-100", accent: "bg-red-100/50",
      btn: "bg-red-600 hover:bg-red-700 shadow-red-200", shadow: "shadow-red-500/5"
    },
    pink: {
      bg: "bg-pink-50/30", text: "text-pink-700", border: "border-pink-100", accent: "bg-pink-100/50",
      btn: "bg-pink-600 hover:bg-pink-700 shadow-pink-200", shadow: "shadow-pink-500/5"
    },
    fuchsia: {
      bg: "bg-fuchsia-50/30", text: "text-fuchsia-700", border: "border-fuchsia-100", accent: "bg-fuchsia-100/50",
      btn: "bg-fuchsia-600 hover:bg-fuchsia-700 shadow-fuchsia-200", shadow: "shadow-fuchsia-500/5"
    },
    purple: {
      bg: "bg-purple-50/30", text: "text-purple-700", border: "border-purple-100", accent: "bg-purple-100/50",
      btn: "bg-purple-600 hover:bg-purple-700 shadow-purple-200", shadow: "shadow-purple-500/5"
    },
    slate: {
      bg: "bg-slate-50/30", text: "text-slate-700", border: "border-slate-100", accent: "bg-slate-100/50",
      btn: "bg-slate-600 hover:bg-slate-700 shadow-slate-200", shadow: "shadow-slate-500/5"
    },
  }
  const theme = themeMap[colorTheme] || themeMap.indigo

  const startInitiated = useRef(false)
  useEffect(() => {
    if (startInitiated.current) return
    startInitiated.current = true

    const init = async () => {
      try {
        const result = await startOlympiad(olympiadId)
        if (result.success && result.startedAt) {
          if (result.isSubmitted) {
            router.push("/dashboard/results")
            return
          }

          const start = new Date(result.startedAt).getTime()
          const durationEnd = duration > 0 ? start + duration * 60 * 1000 : Infinity
          const globalEnd = new Date(olympiadEndDate).getTime()
          const end = Math.min(durationEnd, globalEnd)

          const updateTimer = () => {
            const now = new Date().getTime()
            const diff = Math.max(0, Math.floor((end - now) / 1000))
            
            if (timeLeftRef.current !== null && diff > timeLeftRef.current && diff - timeLeftRef.current > 10) {
              return;
            }
            
            setTimeLeft(diff)
            timeLeftRef.current = diff

            if (diff <= 0 && !isFinishedRef.current) {
              isFinishedRef.current = true
              handleAutoFinish()
            }
          }

          updateTimer()
          timerRef.current = setInterval(updateTimer, 1000)
        } else if (result.error) {
          console.error("Failed to start olympiad:", result.error)
          toast.error("Ошибка при запуске олимпиады", {
            description: result.error
          })
        }
      } catch (err) {
        console.error("Start error:", err)
      }
    }
    init()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [olympiadId, duration])

  useEffect(() => {
    if (shuffleTasks) {

      setTasks([...initialTasks].sort(() => Math.random() - 0.5))
    } else {
      setTasks(initialTasks)
    }
  }, [initialTasks, shuffleTasks])


  const [shuffledOptionsMap, setShuffledOptionsMap] = useState<Record<string, { label: string, originalIdx: number }[]>>({})

  useEffect(() => {
    if (!shuffleTasks) {
      setShuffledOptionsMap({})
      return
    }

    const newMap: Record<string, { label: string, originalIdx: number }[]> = {}
    initialTasks.forEach(task => {
      try {
        const content = JSON.parse(task.content) as TaskContent
        if (content.options && (content.type === 'MULTIPLE_CHOICE' || content.type === 'CHECKBOX')) {
          const optionsWithIdx = content.options
            .map((label, idx) => ({ label, originalIdx: idx }))
            .filter(opt => opt.label && opt.label.trim() !== "")
          
          newMap[task.id] = optionsWithIdx.sort(() => Math.random() - 0.5)
        }
      } catch (e) {}
    })
    setShuffledOptionsMap(newMap)
  }, [initialTasks, shuffleTasks])

  const lastAlertTime = useRef<Record<string, number>>({})
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!preventBlur) return

    const handleBlur = () => {
      if (isInternalAction.current) {
        console.log("[VIOLATION] Blur ignored: internal action in progress")
        return;
      }
      if (timeLeftRef.current !== null && timeLeftRef.current <= 0) return;
      
      console.log(`[VIOLATION] Focus lost event detected. Starting 1500ms grace period...`)
      
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
      
      blurTimeoutRef.current = setTimeout(async () => {
        console.log(`[VIOLATION] Grace period expired. Logging focus lost for olympiad: ${olympiadId}`)
        
        const res = await logViolation(olympiadId, "Смена вкладки / Потеря фокуса")
        
        const now = Date.now()
        const last = lastAlertTime.current['blur'] || 0
        
        if (res.success && (now - last > 15000)) {
          lastAlertTime.current['blur'] = now
          toast.warning("Внимание: Нарушение!", {
            description: "Смена вкладки зафиксирована. Информация передана организаторам.",
            duration: 5000,
            id: "blur-violation",
          })
        }
      }, 1500)
    }

    const handleFocus = () => {
      if (blurTimeoutRef.current) {
        console.log(`[VIOLATION] Focus regained within grace period. Violation cancelled.`)
        clearTimeout(blurTimeoutRef.current)
        blurTimeoutRef.current = null
      }
    }

    const handleBeforeUnload = () => {
      isInternalAction.current = true
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
    }
  }, [olympiadId, preventBlur])

  useEffect(() => {
    if (!preventCopyPaste) return

    const preventAction = async (e: Event) => {
      e.preventDefault()
      const typeStr = e.type === 'copy' ? 'копирования' : e.type === 'paste' ? 'вставки' : 'вырезания'
      
      console.log(`[VIOLATION] ${typeStr} attempt detected`)
      const res = await logViolation(olympiadId, `Попытка ${typeStr} текста`)
      
      const now = Date.now()
      const last = lastAlertTime.current['cp'] || 0
      
      if (res.success && (now - last > 10000)) {
        lastAlertTime.current['cp'] = now
        toast.error("Действие заблокировано", {
          description: `${typeStr.charAt(0).toUpperCase() + typeStr.slice(1)} текста запрещено правилами олимпиады.`,
          id: "copy-paste-violation",
        })
      }
      return false
    }

    const preventKeys = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault()
        const typeStr = e.key === 'c' ? 'копирования' : e.key === 'v' ? 'вставки' : 'вырезания'
        
        console.log(`[VIOLATION] Hotkey ${e.key} (${typeStr}) detected`)
        const res = await logViolation(olympiadId, `Использование горячих клавиш (${e.key})`)
        
        const now = Date.now()
        const last = lastAlertTime.current['keys'] || 0
        
        if (res.success && (now - last > 10000)) {
            lastAlertTime.current['keys'] = now
            toast.error("Действие заблокировано", {
              description: `Использование горячих клавиш для ${typeStr} запрещено.`,
              id: "key-violation",
            })
        }
      }
    }

    document.addEventListener('copy', preventAction)
    document.addEventListener('paste', preventAction)
    document.addEventListener('cut', preventAction)
    document.addEventListener('keydown', preventKeys)

    return () => {
      document.removeEventListener('copy', preventAction)
      document.removeEventListener('paste', preventAction)
      document.removeEventListener('cut', preventAction)
      document.removeEventListener('keydown', preventKeys)
    }
  }, [preventCopyPaste])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleAutoFinish = async () => {
    setIsSubmitting(true)
    try {
      await finishOlympiad(olympiadId)
      router.push("/dashboard/results")
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleAnswerChange = (taskId: string, value: string, immediate = false) => {
    setAnswers(prev => ({ ...prev, [taskId]: value }))

    if (immediate) {
      performSave(taskId, value)
    } else {
      if (debounceTimers.current[taskId]) {
        clearTimeout(debounceTimers.current[taskId])
      }
      setSaveStatus(prev => ({ ...prev, [taskId]: 'idle' }))
      debounceTimers.current[taskId] = setTimeout(() => {
        performSave(taskId, value)
      }, 1000)
    }
  }


  const performSave = async (taskId: string, value: string) => {
    setSaveStatus(prev => ({ ...prev, [taskId]: 'saving' }))
    try {
      await submitAnswer(taskId, value)
      setSaveStatus(prev => ({ ...prev, [taskId]: 'saved' }))
    } catch (error) {
      console.error("Save error:", error)
      setSaveStatus(prev => ({ ...prev, [taskId]: 'error' }))
    }
  }

  const [showConfirm, setShowConfirm] = useState(false)

  const handleFinish = async () => {
    console.log("[FINISH_CLICK] handleFinish triggered");
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    
    isInternalAction.current = true
    setIsSubmitting(true)
    const toastId = toast.loading("Завершение олимпиады...", {
      description: "Сохраняем последние ответы и подсчитываем результат"
    })

    try {
      
      for (const taskId of Object.keys(answers)) {
        const res = await submitAnswer(taskId, answers[taskId])
        if (res.error) {
          console.error(`Failed to submit task ${taskId}:`, res.error)
        }
      }

      
      const result = await finishOlympiad(olympiadId)
      
      if (result.error) {
        toast.error("Ошибка при завершении", {
          description: result.error,
          id: toastId
        })
        return
      }

      toast.success("Олимпиада завершена!", {
        description: "Ваши результаты сохранены",
        id: toastId
      })
      
      
      setTimeout(() => {
        window.location.href = "/dashboard/results";
      }, 500);
    } catch (error) {
      console.error(error)
      toast.error("Критическая ошибка", {
        description: "Не удалось завершить олимпиаду. Попробуйте еще раз.",
        id: toastId
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout)
    }
  }, [])

  return (
    <div className="space-y-8 pb-32 max-w-4xl mx-auto px-4">
      {tasks.map((task, index) => {
        let taskData: TaskContent = { type: 'TEXT' }
        try {
          taskData = JSON.parse(task.content)
        } catch (e) { }

        const status = saveStatus[task.id] || 'idle'

        return (
          <Card key={task.id} className={`border-2 ${theme.border}/30 ${theme.shadow} rounded-[2rem] overflow-hidden bg-white`}>
            <CardHeader className={`${theme.bg} border-b ${theme.border}/50 pb-4 px-6 pt-6`}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.accent} ${theme.text} text-base font-black border ${theme.border}/50 shadow-sm`}>
                    {index + 1}
                  </span>
                  {task.title}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 min-w-[100px] justify-end">
                    {status === 'saving' && (
                      <div className={`flex items-center gap-1 text-[10px] ${theme.text} font-medium animate-pulse opacity-70`}>
                        <Loader2 className="h-3 w-3 animate-spin" /> сохранение...
                      </div>
                    )}
                    {status === 'saved' && (
                      <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> сохранено
                      </div>
                    )}
                    {status === 'error' && (
                      <div className="flex items-center gap-1 text-[10px] text-destructive font-bold">
                        ошибка сохранения
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary" className={`rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest ${theme.bg} ${theme.text} border ${theme.border}/50`}>
                    {taskData.type === 'MULTIPLE_CHOICE' ? 'Тест' : taskData.type === 'CHECKBOX' ? 'Тест' : taskData.type === 'CODE' ? 'Код' : 'Текст'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 bg-card/50 px-6 pb-6 border-none">
              <div className={`${theme.bg} p-8 rounded-2xl border ${theme.border}/50 text-foreground text-base leading-relaxed shadow-sm`}>
                <div className={`font-bold text-xs uppercase tracking-widest ${theme.text} mb-4 flex items-center gap-2`}>
                  <AlertCircle className="h-4 w-4" /> Условие задачи
                </div>
                {task.description}
              </div>

              {(taskData.type === 'MULTIPLE_CHOICE' || taskData.type === 'CHECKBOX') ? (
                (() => {
                  const getOptionsToRender = () => {
                    if (shuffleTasks && shuffledOptionsMap[task.id]) {
                      return shuffledOptionsMap[task.id]
                    }
                    return (taskData.options || [])
                      .map((label, idx) => ({ label, originalIdx: idx }))
                      .filter(opt => opt.label && opt.label.trim() !== "")
                  }

                  const optionsToRender = getOptionsToRender()

                  return (
                    <div className="grid gap-3">
                      {optionsToRender.map((opt) => {
                        const currentAnswer = answers[task.id] || ""
                        const selectedIndices = taskData.type === 'CHECKBOX'
                          ? currentAnswer.split(',').filter(x => x !== "")
                          : [currentAnswer]

                        const isSelected = selectedIndices.includes(opt.originalIdx.toString())

                        const toggleChoice = () => {
                          if (taskData.type === 'MULTIPLE_CHOICE') {
                            handleAnswerChange(task.id, opt.originalIdx.toString(), true)
                          } else {
                            const newIndices = isSelected
                              ? selectedIndices.filter(i => i !== opt.originalIdx.toString())
                              : [...selectedIndices, opt.originalIdx.toString()]
                            handleAnswerChange(task.id, newIndices.sort((a, b) => parseInt(a) - parseInt(b)).join(','), true)
                          }
                        }

                        return (
                          <button
                            key={`${task.id}-${opt.originalIdx}`}
                            type="button"
                            onClick={toggleChoice}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group",
                              isSelected
                                ? `border-primary ${theme.bg} shadow-md ${theme.shadow}`
                                : `border-transparent bg-muted/30 hover:${theme.bg} hover:${theme.border}/50`
                            )}
                          >
                            <div className={cn(
                              "h-6 w-6 shrink-0 transition-all border-2 flex items-center justify-center shadow-sm",
                              taskData.type === 'CHECKBOX' ? "rounded-md" : "rounded-full",
                              isSelected
                                ? `border-transparent bg-white ${theme.text}`
                                : `border-primary/20 bg-background group-hover:border-primary/40`
                            )}>
                              {isSelected && (
                                taskData.type === 'CHECKBOX'
                                  ? <CheckCircle2 className="h-4 w-4" />
                                  : <div className={cn("h-3 w-3 rounded-full", theme.btn.split(' ')[0])} />
                              )}
                            </div>
                            <span className={cn(
                              "font-medium transition-colors",
                              isSelected ? `${theme.text} font-bold` : "text-foreground/70 text-sm"
                            )}>
                              {opt.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )
                })()
              ) : (
                <div className="space-y-4">
                  <div className={`${theme.bg} p-3 rounded-xl border ${theme.border}/30 italic ${theme.text} text-[10px] font-medium text-center opacity-70`}>
                    {taskData.type === 'CODE' ? 'Введите решение в виде программного кода:' : 'Введите развернутый текстовый ответ:'}
                  </div>
                  {taskData.type === 'CODE' ? (
                    <div className="space-y-6">
                      <div className={cn(
                        "flex flex-col border-2 rounded-2xl overflow-hidden transition-all duration-300 bg-[#1e1e1e] shadow-2xl",
                        fullScreenTask === task.id ? "fixed inset-0 z-[100] rounded-none h-screen w-screen" : "min-h-[400px]"
                      )}>
                        {/* Editor Header */}
                        <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/5">
                          <div className="flex items-center gap-3">
                            <div className={cn("flex h-1.5 w-1.5 rounded-full animate-pulse", theme.btn.split(' ')[0])} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Редактор Python</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFullScreenTask(fullScreenTask === task.id ? null : task.id)}
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-white/5"
                          >
                            {fullScreenTask === task.id ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                          </Button>
                        </div>

                        <div className="flex flex-1 overflow-hidden relative">
                          {/* Gutter / Line Numbers */}
                          <div className="bg-zinc-900/50 border-r border-white/5 py-4 px-2 text-right select-none min-w-[50px] font-mono text-xs">
                            {(answers[task.id] || "").split("\n").map((_, i) => (
                              <div key={i} className="text-zinc-500 font-bold leading-[1.5rem] h-[1.5rem]">
                                {i + 1}
                              </div>
                            ))}
                            {!(answers[task.id]) && (
                              <div className="text-zinc-500 font-bold leading-[1.5rem] h-[1.5rem]">1</div>
                            )}
                          </div>

                          {/* Editor Surface */}
                          <div className="flex-1 overflow-auto custom-scrollbar">
                            <Editor
                              value={answers[task.id] || ""}
                              onValueChange={(code) => handleAnswerChange(task.id, code)}
                              highlight={(code) => prism.highlight(code, prism.languages.python, "python")}
                              padding={16}
                              className="font-mono text-sm leading-[1.5rem] text-zinc-100 focus:outline-none"
                              style={{
                                fontFamily: '"Fira Code", "Fira Mono", monospace',
                                minHeight: "100%",
                                backgroundColor: "transparent",
                              }}
                              placeholder="Введите ваш код здесь..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Python Execution Shell */}
                      <div className="mt-4">
                        <PythonShell
                          code={answers[task.id] || ""}
                          libraries={taskData.libraries || []}
                          theme={theme}
                        />
                      </div>
                    </div>
                  ) : (
                    <Textarea
                      placeholder="Введите ваш ответ..."
                      value={answers[task.id] || ""}
                      onChange={(e) => handleAnswerChange(task.id, e.target.value)}
                      className={`min-h-[250px] rounded-2xl border-2 ${theme.border}/10 focus:${theme.border}/30 transition-all font-sans text-base leading-relaxed p-6 resize-none shadow-inner bg-muted/5 mb-4`}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      {tasks.length === 0 ? (
        <div className={`text-center py-20 bg-muted/5 border-4 border-dashed ${theme.border}/50 rounded-[3rem]`}>
          <p className="text-muted-foreground italic font-medium">В этой олимпиаде пока нет задач.</p>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-xl border-t border-primary/10 flex justify-end z-50 shadow-[0_-8px_40px_rgba(0,0,0,0.08)]">
          <div className="container max-w-4xl mx-auto flex justify-between items-center px-4">
            <div className="flex flex-col">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Ваш прогресс</p>
              <p className={`text-lg font-bold ${theme.text}`}>
                {Object.keys(answers).length} / {tasks.length}
              </p>
            </div>
            <div className="flex items-center gap-8">
              {timeLeft !== null && (
                <div className="flex flex-col items-center px-6 border-x border-primary/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Осталось времени</p>
                  <p className={cn(
                    "text-2xl font-black tabular-nums transition-colors",
                    timeLeft < 300 ? "text-rose-500 animate-pulse" : theme.text
                  )}>
                    {formatTime(timeLeft)}
                  </p>
                </div>
              )}
              <div className="hidden md:flex flex-col items-end">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Статус</p>
                <p className="text-xs font-medium text-green-500 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> все автосохранено
                </p>
              </div>
              <div className="flex items-center gap-3">
                {showConfirm && (
                  <Button
                    variant="ghost"
                    onClick={() => setShowConfirm(false)}
                    disabled={isSubmitting}
                    className="rounded-2xl font-bold"
                  >
                    Отмена
                  </Button>
                )}
                <Button 
                  size="lg" 
                  id="finish-olympiad-btn"
                  onClick={handleFinish} 
                  disabled={isSubmitting} 
                  className={cn(
                    "relative z-[100] pointer-events-auto rounded-2xl font-bold px-10 text-white transition-all hover:scale-[1.05] active:scale-[0.98] cursor-pointer",
                    showConfirm ? "bg-rose-500 hover:bg-rose-600" : theme.btn
                  )}
                >
                  {isSubmitting ? "Отправка..." : showConfirm ? "Точно завершить?" : "Завершить олимпиаду"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
