"use client"

import { useState, useTransition } from "react"
import { updateUserGroup } from "@/app/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, Save, Users } from "lucide-react"

export function GroupSelectionForm({ initialGroup }: { initialGroup: string }) {
  const [group, setGroup] = useState(initialGroup)
  const [isPending, startTransition] = useTransition()

  const onSave = () => {
    if (!group.trim()) {
      toast.error("Укажите название группы")
      return
    }

    startTransition(async () => {
      const result = await updateUserGroup(group)
      if (result.success) {
        toast.success("Группа обновлена")
      } else {
        toast.error("Ошибка при обновлении")
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/70 pl-1 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          Название группы
        </label>
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-all duration-300">
            <Users className="h-5 w-5" />
          </div>
          <Input 
            value={group} 
            onChange={(e) => setGroup(e.target.value)}
            placeholder="Например: ПИ-201"
            className="pl-14 h-16 rounded-[1.25rem] bg-background/40 backdrop-blur-md border border-white/10 hover:border-primary/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-semibold text-lg shadow-inner"
          />
        </div>
      </div>

      <Button 
        onClick={onSave} 
        disabled={isPending || group === initialGroup}
        className="w-full h-14 rounded-[1.25rem] font-bold text-base gap-3 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white border border-white/10 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
      >
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        Сохранить изменения
      </Button>
      
      {initialGroup && (
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="h-px w-12 bg-primary/20" />
          <p className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.3em]">
            Текущая группа: <span className="text-primary/60">{initialGroup}</span>
          </p>
        </div>
      )}
    </div>
  )
}
