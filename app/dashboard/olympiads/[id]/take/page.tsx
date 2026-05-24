export const dynamic = 'force-dynamic';
import { getOlympiadById } from "@/app/actions/olympiad"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import TaskList from "./TaskList"

export default async function TakeOlympiadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log(`[TAKE_PAGE] Request for ID: ${id}`)
  
  const session = await auth()
  if (!session?.user) {
    console.error("[TAKE_PAGE] No session found")
    notFound()
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! }
  })

  if (!user) {
    console.error(`[TAKE_PAGE] User not found for email: ${session.user.email}`)
    notFound()
  }

  const existingResult = await prisma.result.findFirst({
    where: { userId: user.id, olympiadId: id }
  })

  if (existingResult?.isSubmitted) {
    redirect(`/dashboard/results/${existingResult.id}`)
  }

  const olympiad = await getOlympiadById(id, user.id)

  if (!olympiad) {
    console.error(`[TAKE_PAGE] Olympiad not found or access denied for ID: ${id}. User ID: ${user.id}`)
    notFound()
  }

  const initialAnswers: Record<string, string> = {}
  olympiad.tasks.forEach((task: any) => {
    if (task.submissions && task.submissions[0]) {
      initialAnswers[task.id] = task.submissions[0].answer
    }
  })

  console.log(`[TAKE_PAGE] Rendering TaskList with: blur=${(olympiad as any).preventBlur}, cp=${(olympiad as any).preventCopyPaste}`)

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
         <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 drop-shadow-sm">{olympiad.title}</h1>
         <p className="text-slate-500 font-medium text-sm">Прохождение олимпиады • Удачи!</p>
      </div>
      <TaskList 
        tasks={olympiad.tasks as any} 
        olympiadId={olympiad.id} 
        colorTheme={(olympiad as any).colorTheme} 
        emoji={(olympiad as any).emoji}
        duration={(olympiad as any).duration}
        olympiadEndDate={olympiad.endDate}
        preventCopyPaste={(olympiad as any).preventCopyPaste}
        preventBlur={(olympiad as any).preventBlur}
        shuffleTasks={(olympiad as any).shuffleTasks}
        initialAnswers={initialAnswers}
      />
    </div>
  )
}
