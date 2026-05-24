"use client"

import { useActionState } from "react"
import { createOlympiad } from "@/app/actions/olympiad"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import ThemePicker from "@/components/admin/ThemePicker"
import EmojiPicker from "@/components/admin/EmojiPicker"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function CreateOlympiadPage() {
  const [state, formAction, isPending] = useActionState(createOlympiad, null)
  const [theme, setTheme] = useState("indigo")
  const [emoji, setEmoji] = useState("🎓")

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Создание Олимпиады</CardTitle>
          <CardDescription>
            Заполните основные данные. Задачи можно будет добавить после создания.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Название</Label>
              <Input id="title" name="title" placeholder="Математическая олимпиада 2024" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea id="description" name="description" placeholder="Краткое описание правил и тем..." required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Дата начала</Label>
                <Input id="startDate" name="startDate" type="datetime-local" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Дата окончания</Label>
                <Input id="endDate" name="endDate" type="datetime-local" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
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
                <Input id="duration" name="duration" type="number" placeholder="Оставьте пустым, если нет лимита" className="h-10 border-2 border-primary/10 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-y border-primary/5">
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                <Switch id="preventCopyPaste" name="preventCopyPaste" />
                <div className="grid gap-0.5">
                  <Label htmlFor="preventCopyPaste" className="cursor-pointer font-bold text-xs uppercase tracking-wide">Запретить копирование/вставку</Label>
                  <p className="text-[10px] text-muted-foreground leading-tight">Блокирует Ctrl+C/V и контекстное меню</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <Switch id="preventBlur" name="preventBlur" />
                <div className="grid gap-0.5">
                  <Label htmlFor="preventBlur" className="cursor-pointer font-bold text-xs uppercase tracking-wide">Детекция смены вкладок</Label>
                  <p className="text-[10px] text-muted-foreground leading-tight">Регистрирует уход с вкладки как нарушение</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <Switch id="shuffleTasks" name="shuffleTasks" />
                <div className="grid gap-0.5">
                  <Label htmlFor="shuffleTasks" className="cursor-pointer font-bold text-xs uppercase tracking-wide">Перемешивать задачи</Label>
                  <p className="text-[10px] text-muted-foreground leading-tight">Случайный порядок заданий для участников</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <Switch id="isActive" name="isActive" />
                <div className="grid gap-0.5">
                  <Label htmlFor="isActive" className="cursor-pointer font-bold text-xs uppercase tracking-wide text-primary">Сделать активной сразу</Label>
                  <p className="text-[10px] text-muted-foreground leading-tight">Олимпиада будет доступна сразу после создания</p>
                </div>
              </div>
            </div>
            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
          </CardContent>
          <CardFooter className="pt-4">
            <Button type="submit" className="w-full h-12 text-lg shadow-lg shadow-primary/10" disabled={isPending}>
              {isPending ? "Создание..." : "Создать Олимпиаду"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
