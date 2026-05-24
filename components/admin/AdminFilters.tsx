"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

export function AdminFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFilter = searchParams.get("status") || "all"

  const setFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === "all") {
      params.delete("status")
    } else {
      params.set("status", status)
    }
    router.push(`/admin?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 mb-6">
      <Button 
        variant={currentFilter === "all" ? "default" : "outline"} 
        size="sm"
        onClick={() => setFilter("all")}
        className="rounded-full px-6 font-bold"
      >
        Все
      </Button>
      <Button 
        variant={currentFilter === "active" ? "default" : "outline"} 
        size="sm"
        onClick={() => setFilter("active")}
        className="rounded-full px-6 font-bold"
      >
        Активные
      </Button>
      <Button 
        variant={currentFilter === "draft" ? "default" : "outline"} 
        size="sm"
        onClick={() => setFilter("draft")}
        className="rounded-full px-6 font-bold"
      >
        Черновики
      </Button>
      <Button 
        variant={currentFilter === "completed" ? "default" : "outline"} 
        size="sm"
        onClick={() => setFilter("completed")}
        className="rounded-full px-6 font-bold"
      >
        Завершенные
      </Button>
    </div>
  )
}
