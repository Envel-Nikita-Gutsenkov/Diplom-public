"use client"

import { useState, useTransition } from "react"
import { updateOlympiadTasks } from "@/app/actions/olympiad"
import { Button } from "@/components/ui/button"
import { TestEditor } from "@/components/admin/TestEditor"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, CheckCircle2 } from "lucide-react"

export default function EditTasksForm({ id, initialQuestions }: { id: string; initialQuestions: any[] }) {
  const [isPending, startTransition] = useTransition()
  const [showSuccess, setShowSuccess] = useState(false)

  const onSave = async (formData: FormData) => {
    const questionsJson = formData.get("questions") as string
    
    startTransition(async () => {
      const result = await updateOlympiadTasks(id, questionsJson)
      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/olympiads/${id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Управление задачами</h1>
            <p className="text-muted-foreground italic">Добавление, удаление и редактирование вопросов</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            {showSuccess && (
                <div className="flex items-center gap-2 text-green-500 font-bold animate-in fade-in slide-in-from-right-2">
                    <CheckCircle2 className="h-5 w-5" /> Изменения сохранены
                </div>
            )}
            <Button 
                onClick={() => {
                    const form = document.getElementById('tasks-form') as HTMLFormElement
                    form?.requestSubmit()
                }} 
                className="gap-2 shadow-lg shadow-primary/20"
                disabled={isPending}
            >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Сохранить все задачи
            </Button>
        </div>
      </div>

      <form id="tasks-form" action={onSave}>
          <TestEditor initialQuestions={initialQuestions} />
      </form>

      <div className="flex justify-center pb-20">
          <Button 
            variant="outline"
            onClick={() => {
                const form = document.getElementById('tasks-form') as HTMLFormElement
                form?.requestSubmit()
            }}
            disabled={isPending}
            className="w-full max-w-md h-12"
          >
             {isPending ? "Сохранение..." : "Подтвердить изменения"}
          </Button>
      </div>
    </div>
  )
}
