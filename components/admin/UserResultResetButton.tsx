"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { resetUserResult } from "@/app/actions/olympiad"
import { RotateCcw, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"

export function UserResultResetButton({ 
  olympiadId, 
  userId, 
  variant = "outline",
  size = "sm",
  className = ""
}: { 
  olympiadId: string, 
  userId: string,
  variant?: "outline" | "destructive" | "ghost" | "default",
  size?: "sm" | "lg" | "icon" | "default",
  className?: string
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleReset = async () => {
    if (!confirm("Вы уверены, что хотите сбросить результат этого участника? Все его ответы и итоговый балл для этой олимпиады будут удалены.")) {
      return
    }

    startTransition(async () => {
      const result = await resetUserResult(olympiadId, userId)
      if (result.success) {
        router.refresh()
      } else {
        alert("Ошибка при сбросе результата")
      }
    })
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleReset} 
      disabled={isPending}
      className={className}
      title="Сбросить результат (удалить все ответы)"
    >
      {isPending ? (
        <Loader2 className={cn("h-4 w-4 animate-spin", size !== "icon" && "mr-2")} />
      ) : (
        <RotateCcw className={cn("h-4 w-4", size !== "icon" && "mr-2")} />
      )}
      {size !== "icon" && "Сбросить результат"}
    </Button>
  )
}
