"use client"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useState, useMemo, memo } from "react"
import { Check } from "lucide-react"

export const THEMES = [
  { id: "indigo", name: "Индиго", color: "bg-indigo-500" },
  { id: "blue", name: "Синий", color: "bg-blue-500" },
  { id: "sky", name: "Небесный", color: "bg-sky-500" },
  { id: "cyan", name: "Циановый", color: "bg-cyan-500" },
  { id: "teal", name: "Бирюзовый", color: "bg-teal-500" },
  { id: "emerald", name: "Изумрудный", color: "bg-emerald-500" },
  { id: "green", name: "Зеленый", color: "bg-green-500" },
  { id: "lime", name: "Лаймовый", color: "bg-lime-500" },
  { id: "amber", name: "Янтарный", color: "bg-amber-500" },
  { id: "orange", name: "Оранжевый", color: "bg-orange-500" },
  { id: "red", name: "Красный", color: "bg-red-500" },
  { id: "rose", name: "Розовый", color: "bg-rose-500" },
  { id: "pink", name: "Розовый яркий", color: "bg-pink-500" },
  { id: "fuchsia", name: "Фуксия", color: "bg-fuchsia-500" },
  { id: "purple", name: "Пурпурный", color: "bg-purple-500" },
  { id: "violet", name: "Фиолетовый", color: "bg-violet-500" },
  { id: "slate", name: "Сланцевый", color: "bg-slate-500" },
]

function ThemePicker({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const currentTheme = THEMES.find(t => t.id === value) || THEMES[0]

  const themesGrid = useMemo(() => (
    <div className="grid grid-cols-5 gap-3">
      {THEMES.map((theme) => {
        const isSelected = value === theme.id
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => {
              onChange(theme.id)
              setIsOpen(false)
            }}
            className={cn(
              "group relative h-9 w-9 rounded-full transition-all hover:scale-110 active:scale-95 shadow-sm overflow-hidden",
              theme.color,
              isSelected ? "ring-2 ring-offset-2 ring-primary" : "opacity-80 hover:opacity-100"
            )}
            title={theme.name}
          >
            {isSelected && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center shadow-md border-2 border-white">
                    <Check className="h-4 w-4 text-black font-black" />
                </div>
              </div>
            )}
          </button>
        )
      })}
    </div>
  ), [value, onChange])

  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name="colorTheme" value={value} />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="h-12 w-12 p-0 hover:opacity-90 rounded-xl border-2 shadow-sm relative overflow-hidden group shrink-0"
          >
            <div className={cn("absolute inset-0 transition-transform group-hover:scale-110", currentTheme.color)}></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white/30 backdrop-blur-sm border border-white/20"></div>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4 rounded-2xl" align="start">
          {themesGrid}
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4 text-center opacity-50">Выберите цветовую тему</p>
        </PopoverContent>
      </Popover>
      <span className="text-sm text-muted-foreground font-medium">Кликните, чтобы изменить цвет</span>
    </div>
  )
}

export default memo(ThemePicker)
