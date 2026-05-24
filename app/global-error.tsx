"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Home } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global App Error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8 bg-background">
          <div className="space-y-4">
            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter">Системная ошибка</h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg leading-relaxed">
              Приносим извинения, произошло критическое исключение. Мы уже работаем над поиском причины.
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              size="lg"
              variant="outline" 
              onClick={() => window.location.href = "/"}
              className="rounded-full px-10 h-14"
            >
              <Home className="mr-2 h-5 w-5" /> На главную
            </Button>
            <Button 
              size="lg"
              onClick={() => reset()}
              className="rounded-full px-10 h-14 font-bold shadow-xl shadow-primary/20"
            >
              Перезагрузить систему
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
