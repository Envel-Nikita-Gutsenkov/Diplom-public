"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, XCircle, Save, Loader2, RefreshCcw } from "lucide-react"
import { updateSubmissionGrade, autoRegradeSubmission } from "@/app/actions/grading"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ManualGradingProps {
  submissionId: string
  initialScore: number | null
  initialIsCorrect: boolean | null
  maxPoints: number
  canRegrade?: boolean
  onSaveSuccess?: () => void
}

export function ManualGrading({ 
  submissionId, 
  initialScore, 
  initialIsCorrect,
  maxPoints,
  canRegrade,
  onSaveSuccess
}: ManualGradingProps) {
  const router = useRouter()
  const [score, setScore] = useState(initialScore?.toString() || "0")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(initialIsCorrect)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegrading, setIsRegrading] = useState(false)


  useEffect(() => {
    setScore(initialScore?.toString() || "0")
    setIsCorrect(initialIsCorrect)
  }, [initialScore, initialIsCorrect])

  const onSave = async () => {
    const scoreNum = parseInt(score)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > maxPoints) {
      return
    }

    setIsLoading(true)
    try {
      const result = await updateSubmissionGrade(submissionId, isCorrect === null ? true : isCorrect, scoreNum)
      if (result.success) {
        if (onSaveSuccess) onSaveSuccess()
        toast.success("Оценка сохранена")
        router.refresh()
      } else {
        toast.error("Ошибка при сохранении")
      }
    } catch (error) {
      console.error("Save failed:", error)
      toast.error("Произошла ошибка")
    } finally {
      setIsLoading(false)
    }
  }

  const handleShortcut = async (newCorrect: boolean, newScore: string) => {
    setIsCorrect(newCorrect)
    setScore(newScore)
    
    const scoreNum = parseInt(newScore)
    setIsLoading(true)
    try {
      const result = await updateSubmissionGrade(submissionId, newCorrect, scoreNum)
      if (result.success) {
        if (onSaveSuccess) onSaveSuccess()
        toast.success("Оценка обновлена")
        router.refresh()
      } else {
        toast.error("Ошибка при сохранении")
      }
    } catch (error) {
      console.error("Shortcut save failed:", error)
      toast.error("Произошла ошибка")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegrade = async () => {
    setIsRegrading(true)
    try {
      toast.info("Запущен автоматический пересчет...", { duration: 2000 })
      const result = await autoRegradeSubmission(submissionId)
      if (result.success) {
        toast.success(`Пересчет завершен. Выставлено: ${result.score} баллов`)
        if (onSaveSuccess) onSaveSuccess()
        router.refresh()
      } else if (result.success === false) {
         toast.error(`Ошибка при проверке: ${result.error}`)
         router.refresh() 
      } else {
        toast.error(result.error || "Неизвестная ошибка")
      }
    } catch (error) {
      console.error("Regrade failed:", error)
      toast.error("Ошибка при пересчете")
    } finally {
      setIsRegrading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-6">
         {}
         <div className="flex flex-wrap items-center gap-3">
            <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleShortcut(false, "0")}
                disabled={isLoading || isRegrading}
                className={cn(
                    "rounded-xl h-14 px-8 text-sm font-bold gap-3 transition-all",
                    isCorrect === false ? "bg-red-500 text-white border-red-600 hover:bg-red-600 shadow-lg shadow-red-500/20" : "hover:bg-accent"
                )}
            >
                {isLoading && isCorrect === false ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                Ошибка (0 б.)
            </Button>

            <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleShortcut(true, maxPoints.toString())}
                disabled={isLoading || isRegrading}
                className={cn(
                    "rounded-xl h-14 px-8 text-sm font-bold gap-3 transition-all",
                    score === maxPoints.toString() ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20" : "hover:bg-accent"
                )}
            >
                {isLoading && isCorrect === true && score === maxPoints.toString() ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                Максимум ({maxPoints} б.)
            </Button>

            {canRegrade && (
                <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleRegrade}
                    disabled={isLoading || isRegrading}
                    className="rounded-xl h-14 px-8 text-sm font-bold gap-3 transition-all bg-indigo-50/50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 hover:text-indigo-800"
                >
                    {isRegrading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCcw className="h-5 w-5" />}
                    Перепроверить
                </Button>
            )}
        </div>
        
        {/* Simple Points Section */}
        <div className="flex items-center gap-4 bg-muted/40 p-2 rounded-xl border border-border">
            <div className="flex flex-col items-center px-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Точная оценка</span>
                <div className="flex items-center gap-2">
                    <Input 
                        type="number" 
                        value={score} 
                        onChange={(e) => {
                            const val = e.target.value
                            setScore(val)
                            if (parseInt(val) > 0) setIsCorrect(true)
                            else if (parseInt(val) === 0) setIsCorrect(false)
                        }}
                        className="w-16 h-8 text-lg font-bold rounded-lg text-center bg-background border-border"
                        min={0}
                        max={maxPoints}
                        disabled={isLoading || isRegrading}
                    />
                    <span className="text-sm font-bold opacity-40">/ {maxPoints}</span>
                </div>
            </div>
            <Button 
                variant="default"
                size="icon" 
                onClick={() => onSave()} 
                disabled={isLoading || isRegrading}
                className={cn(
                    "h-12 w-12 rounded-lg bg-primary text-primary-foreground shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all",
                    isLoading && "opacity-80"
                )}
            >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            </Button>
        </div>
      </div>
    </div>
  )
}
