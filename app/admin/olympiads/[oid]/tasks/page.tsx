export const dynamic = 'force-dynamic';
import { getOlympiadById } from "@/app/actions/olympiad"
import { notFound } from "next/navigation"
import EditTasksForm from "@/components/admin/EditTasksForm"

export default async function EditTasksPage({ params }: { params: Promise<{ oid: string }> }) {
  const { oid: id } = await params
  console.log(`[TASKS_PAGE] Request for ID: ${id}`)
  const olympiad = await getOlympiadById(id)

  if (!olympiad) {
    console.error(`[TASKS_PAGE] Olympiad not found: ${id}`)
    notFound()
  }

  const formattedQuestions = (olympiad as any).tasks.map((task: any) => {
    try {
      const content = JSON.parse(task.content)
      return {
        id: task.id,
        title: task.title,
        content: task.description,
        type: content.type || "MULTIPLE_CHOICE",
        points: task.points,
        options: content.options,
        correctOptions: Array.isArray(content.correctOptions) ? content.correctOptions : (content.correctOption !== undefined ? [content.correctOption] : []),
        libraries: content.libraries || [],
        autoCheck: content.autoCheck || false,
        testCases: content.testCases || [],
        referenceSolution: content.referenceSolution || ""
      }
    } catch (e) {
      return {
        id: task.id,
        title: task.title,
        content: task.description,
        type: "MULTIPLE_CHOICE" as const,
        points: task.points,
        options: ["", "", "", ""],
        correctOption: 0,
        libraries: [],
        autoCheck: false,
        testCases: [],
        referenceSolution: ""
      }
    }
  })

  return (
    <div className="max-w-5xl mx-auto py-8">
      <EditTasksForm id={id} initialQuestions={formattedQuestions} />
    </div>
  )
}
