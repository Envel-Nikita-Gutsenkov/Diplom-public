"use client"

import { useActionState } from "react"
import { updateOlympiadSettings } from "@/app/actions/olympiad"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import ThemePicker from "./ThemePicker"
import EmojiPicker from "./EmojiPicker"

export default function EditSettingsForm({ olympiad }: { olympiad: any }) {
  const [state, formAction, isPending] = useActionState(updateOlympiadSettings.bind(null, olympiad.id), null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [theme, setTheme] = useState(olympiad.colorTheme || "indigo")
  const [emoji, setEmoji] = useState(olympiad.emoji || "🎓")

  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [state])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/olympiads/${olympiad.id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Настройки олимпиады</h1>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 text-green-500 font-bold animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-5 w-5" /> Сохранено
          </div>
        )}
      </div>

      <form action={formAction}>
        <Card className="border-2 border-primary/10 shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle>Основные данные</CardTitle>
            <CardDescription>Измените название, описание и сроки проведения</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Название</Label>
              <Input id="title" name="title" defaultValue={olympiad.title} required className="text-lg font-semibold" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea id="description" name="description" defaultValue={olympiad.description} required className="min-h-[150px] leading-relaxed" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Дата начала</Label>
                <Input id="startDate" name="startDate" type="datetime-local" defaultValue={olympiad.startDate} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Дата окончания</Label>
                <Input id="endDate" name="endDate" type="datetime-local" defaultValue={olympiad.endDate} required />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-4 border-y border-primary/5">
              <div className="grid gap-3">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Цветовая палитра</Label>
                <ThemePicker value={theme} onChange={setTheme} />
              </div>
              <div className="grid gap-3">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Иконка олимпиады</Label>
                <EmojiPicker value={emoji} onChange={setEmoji} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="duration" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Время (минуты)</Label>
                <Input id="duration" name="duration" type="number" defaultValue={olympiad.duration} placeholder="Нет лимита" className="h-10 border-2 border-primary/10 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y border-primary/5">
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                <Switch id="preventCopyPaste" name="preventCopyPaste" defaultChecked={olympiad.preventCopyPaste} />
                <div className="grid gap-0.5">
                  <Label htmlFor="preventCopyPaste" className="cursor-pointer font-bold text-xs uppercase">Анти-копипаст</Label>
                  <p className="text-[10px] text-muted-foreground leading-tight">Блокирует Ctrl+C/V</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <Switch id="preventBlur" name="preventBlur" defaultChecked={olympiad.preventBlur} />
                <div className="grid gap-0.5">
                  <Label htmlFor="preventBlur" className="cursor-pointer font-bold text-xs uppercase">Контроль фокуса</Label>
                  <p className="text-[10px] text-muted-foreground leading-tight">Фикс. уход с вкладки</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <Switch id="shuffleTasks" name="shuffleTasks" defaultChecked={olympiad.shuffleTasks} />
                <div className="grid gap-0.5">
                  <Label htmlFor="shuffleTasks" className="cursor-pointer font-bold text-xs uppercase">Перемешивание</Label>
                  <p className="text-[10px] text-muted-foreground leading-tight">Случайный порядок задач</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <Switch id="isActive" name="isActive" defaultChecked={olympiad.isActive} />
              <div className="grid gap-0.5">
                <Label htmlFor="isActive" className="cursor-pointer font-bold uppercase text-xs">Активна</Label>
                <p className="text-xs text-muted-foreground">Если выключено, олимпиада не будет видна участникам</p>
              </div>
            </div>
            {state?.error && (
              <p className="text-sm text-destructive font-bold">{state.error}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isPending}>
              {isPending ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
