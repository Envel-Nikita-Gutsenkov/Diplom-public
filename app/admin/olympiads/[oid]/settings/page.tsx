import { getOlympiadById } from "@/app/actions/olympiad"
import { notFound } from "next/navigation"
import EditSettingsForm from "@/components/admin/EditSettingsForm"

export default async function EditSettingsPage({ params }: { params: Promise<{ oid: string }> }) {
  const { oid: id } = await params
  const olympiad = await getOlympiadById(id)

  if (!olympiad) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <EditSettingsForm 
        olympiad={{
          ...olympiad,
          startDate: new Date(olympiad.startDate).toISOString().slice(0, 16),
          endDate: new Date(olympiad.endDate).toISOString().slice(0, 16),
        }} 
      />
    </div>
  )
}
