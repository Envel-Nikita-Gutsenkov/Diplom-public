"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function ExportCsvButton({ results, olympiadTitle }: { results: any[], olympiadTitle: string }) {
  const downloadCsv = () => {
    const headers = ["Место", "Имя", "Email", "Баллы"]
    const rows = results.map((r, idx) => [
      idx + 1,
      r.user.name || "Без имени",
      r.user.email,
      r.totalScore
    ])

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + 
      headers.join(";") + "\n" + 
      rows.map(e => e.join(";")).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `results-${olympiadTitle}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button 
      variant="outline" 
      onClick={downloadCsv}
      className="gap-2 rounded-xl border-primary/10 hover:border-primary/20 h-10 px-6 font-bold text-sm shadow-sm"
    >
        <Download className="h-4 w-4" /> Экспорт CSV
    </Button>
  )
}
