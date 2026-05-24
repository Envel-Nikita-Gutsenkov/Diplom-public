"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { deleteOlympiad, toggleOlympiadStatus, resetResults } from "@/app/actions/olympiad"
import { Trash2, Power, PowerOff, Loader2, RotateCcw } from "lucide-react"
import { useTransition } from "react"
import { cn } from "@/lib/utils"

export function AdminManagementActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition()

  const onDelete = async () => {
    if (confirm("Вы уверены, что хотите удалить эту олимпиаду? Это действие необратимо.")) {
      startTransition(async () => {
        await deleteOlympiad(id)
      })
    }
  }

  const onToggle = async () => {
    startTransition(async () => {
      await toggleOlympiadStatus(id, isActive)
    })
  }

  const onReset = async () => {
    if (confirm("Внимание! Это удалит ВСЕ результаты и попытки участников для этой олимпиады. Продолжить?")) {
      startTransition(async () => {
        await resetResults(id)
      })
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onReset}
        disabled={isPending}
        className="gap-2 rounded-xl border-dashed border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all hover:scale-[1.03] active:scale-[0.98] text-xs font-bold"
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
        Сбросить
      </Button>
      <Button 
        variant={isActive ? "secondary" : "default"} 
        size="sm"
        onClick={onToggle}
        disabled={isPending}
        className={cn(
            "gap-2 rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.03] active:scale-[0.98]",
            isActive ? "hover:bg-secondary/80" : "hover:shadow-primary/20"
        )}
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : (isActive ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />)}
        {isActive ? "Остановить" : "Запустить"}
      </Button>
      <Button 
        variant="destructive" 
        size="sm"
        onClick={onDelete}
        disabled={isPending}
        className="gap-2 rounded-xl text-xs font-bold shadow-sm h-9 transition-all hover:scale-[1.03] active:scale-[0.98] hover:shadow-destructive/20"
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        Удалить
      </Button>
    </div>
  )
}
