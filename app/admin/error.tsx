"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCcw } from "lucide-react"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Admin Section Error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-6 bg-destructive/5 rounded-[2rem] border-2 border-dashed border-destructive/20 m-6">
      <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Что-то пошло не так в консоли управления</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Произошла ошибка при загрузке этого раздела. Остальные части приложения продолжают работать.
        </p>
      </div>
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => window.location.href = "/admin"}
          className="rounded-2xl px-8"
        >
          Вернуться к списку
        </Button>
        <Button 
          onClick={() => reset()}
          className="rounded-2xl px-8 gap-2 bg-destructive hover:bg-destructive/90 text-white"
        >
          <RefreshCcw className="h-4 w-4" /> Попробовать снова
        </Button>
      </div>
    </div>
  )
}
