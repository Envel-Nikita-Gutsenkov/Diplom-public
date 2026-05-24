"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { voidUserResult } from "@/app/actions/olympiad"
import { ShieldAlert, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function UserResultVoidButton({ 
  olympiadId, 
  userId, 
  variant = "destructive",
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

  const handleVoid = async () => {
    if (!confirm("Вы уверены, что хотите аннулировать результат этого участника? Он получит 0 баллов за все задания и метку о нарушении. Студент НЕ СМОЖЕТ перепройти олимпиаду.")) {
      return
    }

    startTransition(async () => {
      const result = await voidUserResult(olympiadId, userId)
      if (result.success) {
        router.refresh()
      } else {
        alert("Ошибка при аннулировании результата: " + result.error)
      }
    })
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleVoid} 
      disabled={isPending}
      className={className}
      title="Аннулировать результат (0 баллов, без права пересдачи)"
    >
      {isPending ? (
        <Loader2 className={cn("h-4 w-4 animate-spin", size !== "icon" && "mr-2")} />
      ) : (
        <ShieldAlert className={cn("h-4 w-4", size !== "icon" && "mr-2")} />
      )}
      {size !== "icon" && "Аннулировать"}
    </Button>
  )
}
