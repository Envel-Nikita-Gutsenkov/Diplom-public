"use client"

import { useActionState } from "react"
import { updateOlympiad } from "@/app/actions/olympiad"
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
import { ArrowLeft } from "lucide-react"

export default function EditOlympiadForm({ olympiad, initialQuestions }: { olympiad: any; initialQuestions: any[] }) {
  const [state, formAction, isPending] = useActionState(updateOlympiad.bind(null, olympiad.id), null)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/olympiads/${olympiad.id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Редактирование олимпиады</h1>
      </div>

      <form action={formAction}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Основные данные</CardTitle>
              <CardDescription>Измените название, описание и сроки проведения</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Название</Label>
                <Input id="title" name="title" defaultValue={olympiad.title} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea id="description" name="description" defaultValue={olympiad.description} required className="min-h-[100px]" />
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
              <div className="flex items-center space-x-2">
                <Switch id="isActive" name="isActive" defaultChecked={olympiad.isActive} />
                <Label htmlFor="isActive" className="cursor-pointer">Активна</Label>
              </div>
            </CardContent>
          </Card>

          <CardFooter className="px-0 pt-4">
            <Button type="submit" className="w-full h-12 text-lg" disabled={isPending}>
              {isPending ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </CardFooter>
        </div>
      </form>
    </div>
  )
}
