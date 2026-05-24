"use client"

import { cn } from "@/lib/utils"
import { useState, useMemo, memo } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

const EMOJI_LIST = [
  "🎓", "🏆", "🚀", "💡", "🧠", "📚", "🎨", "🎭", "🎮", "🎹", 
  "🔬", "🔭", "🌍", "🌈", "🔥", "✨", "💎", "🎯", "⚡", "🌟",
  "💻", "🛠️", "🧪", "🧬", "📊", "📁", "📍", "⏰", "🛡️", "🔑",
  "📝", "✏️", "📋", "📡", "🔋", "⚙️", "🔧", "🔨", "⚒️", "🧲", 
  "⚗️", "🛰️", "🛸", "👾", "🤖", "🦾", "🖱️", "⌨️", "🍎", "🏅", 
  "🥇", "🥈", "🥉", "🎖️", "🎗️", "🎫", "🎟️", "🐘", "🦄", "🦁", 
  "🦊", "🦅", "🦉", "🐧", "🐲", "🌵", "🍀", "🌓"
]

function EmojiPicker({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)


  const emojiGrid = useMemo(() => (
    <div className="grid grid-cols-10 gap-1">
      {EMOJI_LIST.map((e) => {
        const isSelected = value === e
        return (
          <button
            key={e}
            type="button"
            onClick={() => {
              onChange(e)
              setIsOpen(false)
            }}
            className={cn(
              "h-8 w-8 text-xl flex items-center justify-center rounded-lg hover:bg-muted transition-colors",
              isSelected && "bg-primary/10"
            )}
          >
            {e}
          </button>
        )
      })}
    </div>
  ), [value, onChange])

  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name="emoji" value={value} />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="h-12 w-12 text-2xl p-0 hover:bg-muted/50 rounded-xl border-dashed border-2 shrink-0"
          >
            {value || "🎓"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-3 rounded-2xl" align="start">
          {emojiGrid}
        </PopoverContent>
      </Popover>
      <span className="text-sm text-muted-foreground font-medium">Кликните, чтобы выбрать иконку</span>
    </div>
  )
}

export default memo(EmojiPicker)
