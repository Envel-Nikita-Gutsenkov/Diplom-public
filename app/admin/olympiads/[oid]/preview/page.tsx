import { getOlympiadById } from "@/app/actions/olympiad"
import { notFound } from "next/navigation"
import PreviewOlympiad from "@/components/admin/PreviewOlympiad"

export default async function PreviewOlympiadPage({ params }: { params: Promise<{ oid: string }> }) {
  const { oid: id } = await params
  const olympiad = await getOlympiadById(id) as any

  if (!olympiad) {
    notFound()
  }

  
  const formattedQuestions = (olympiad.tasks as any[]).map((task: any) => {
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
    <div className="py-8">
      <PreviewOlympiad olympiad={olympiad} questions={formattedQuestions} />
    </div>
  )
}
