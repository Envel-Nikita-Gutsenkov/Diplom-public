"use client"

import { useState, useTransition } from "react"
import { updateUserPassword } from "@/app/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, KeyRound, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react"

export function PasswordChangeForm() {
  const [current, setCurrent] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const onSave = () => {
    if (!current || !newPassword || !confirm) {
      toast.error("Заполните все поля")
      return
    }

    if (newPassword !== confirm) {
      toast.error("Пароли не совпадают")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Новый пароль должен быть не менее 6 символов")
      return
    }

    startTransition(async () => {
      const result = await updateUserPassword({ current, new: newPassword })
      if (result.success) {
        toast.success("Пароль успешно изменен")
        setCurrent("")
        setNewPassword("")
        setConfirm("")
      } else {
        toast.error(result.error || "Ошибка при смене пароля")
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {}
        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/70 pl-1 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            Текущий пароль
          </label>
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-all duration-300">
              <KeyRound className="h-5 w-5" />
            </div>
            <Input 
              type={showCurrent ? "text" : "password"}
              value={current} 
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="••••••••"
              className="pl-14 pr-12 h-16 rounded-[1.25rem] bg-background/40 backdrop-blur-md border border-white/10 hover:border-primary/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-semibold text-lg"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors"
            >
              {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/70 pl-1 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Новый пароль
          </label>
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-all duration-300">
              <Lock className="h-5 w-5" />
            </div>
            <Input 
              type={showNew ? "text" : "password"}
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              className="pl-14 pr-12 h-16 rounded-[1.25rem] bg-background/40 backdrop-blur-md border border-white/10 hover:border-primary/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-semibold text-lg"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors"
            >
              {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/70 pl-1 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Подтверждение
          </label>
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-all duration-300">
              <Lock className="h-5 w-5" />
            </div>
            <Input 
              type={showConfirm ? "text" : "password"}
              value={confirm} 
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Повторите новый пароль"
              className="pl-14 pr-12 h-16 rounded-[1.25rem] bg-background/40 backdrop-blur-md border border-white/10 hover:border-primary/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-semibold text-lg"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors"
            >
              {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <Button 
        onClick={onSave} 
        disabled={isPending || !current || !newPassword || !confirm}
        className="w-full h-14 rounded-[1.25rem] font-bold text-base gap-3 bg-gradient-to-r from-emerald-900 to-emerald-800 hover:from-emerald-800 hover:to-emerald-700 text-white border border-emerald-900/50 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
      >
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
        Обновить пароль
      </Button>
    </div>
  )
}
