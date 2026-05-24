"use client"

import { useState, useEffect } from "react"
import { getGlobalSettings, updateGlobalSettings } from "@/app/actions/settings"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { 
  Settings, Globe, UserPlus, ShieldCheck, 
  Save, Loader2, AlertCircle, Info, Database,
  ArrowRight, Shield, History
} from "lucide-react"
import { BackupManager } from "./BackupManager"

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const data = await getGlobalSettings()
      setSettings(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(registrationEnabled: boolean) {
    setSaving(true)
    try {
      const updated = { registrationEnabled }
      await updateGlobalSettings(updated)
      setSettings((prev: any) => ({ ...prev, ...updated }))
    } catch (e) {
      alert("Ошибка при сохранении настроек")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground italic">Загрузка системных настроек...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Настройки платформы</h1>
        <p className="text-muted-foreground italic mt-1">Глобальная конфигурация и системные параметры</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-xl shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-md">
          <CardHeader className="bg-muted/30 border-b border-primary/5 p-8">
            <div className="flex items-center gap-4">
               <div className="h-14 w-14 bg-primary/10 rounded-[1.5rem] flex items-center justify-center border border-primary/10">
                  <Globe className="h-7 w-7 text-primary" />
               </div>
               <div>
                 <CardTitle className="text-2xl font-bold">Общие параметры</CardTitle>
                 <CardDescription>Управление доступом и регистрацией</CardDescription>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center justify-between p-6 rounded-[2rem] bg-background border border-primary/5 hover:border-primary/20 transition-all duration-300">
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                    <Label className="text-lg font-bold">Открытая регистрация</Label>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Если выключено, новые пользователи не смогут создавать аккаунты самостоятельно. Только администраторы смогут добавлять участников.
                </p>
              </div>
              <div className="flex items-center gap-4">
                  {saving && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  <Switch 
                    checked={settings?.registrationEnabled} 
                    onCheckedChange={handleUpdate}
                    className="data-[state=checked]:bg-primary"
                  />
              </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex gap-4">
               <div className="shrink-0 h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Info className="h-5 w-5 text-primary" />
               </div>
               <div className="space-y-1">
                  <h4 className="font-bold text-sm">Безопасность прежде всего</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Все изменения настроек логируются и применяются мгновенно. Будьте осторожны при закрытии регистрации во время проведения массовых отборочных этапов.
                  </p>
               </div>
            </div>
          </CardContent>
        </Card>

        <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
           <div className="flex items-center gap-3 mb-6 px-4">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                 <Database className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Резервное копирование</h2>
           </div>
           
           <BackupManager initialSettings={settings} />
        </section>

        <div className="pt-10 border-t border-primary/5 flex flex-col items-center justify-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <Shield className="h-3 w-3" />
              <span>Система управления олимпиадами</span>
           </div>
           <p className="text-[10px] font-medium flex items-center gap-2">
              Версия: <span className="p-1 px-2 bg-muted rounded-md font-mono text-primary">{process.env.NEXT_PUBLIC_BUILD_HASH || "dev-local"}</span>
           </p>
        </div>
      </div>
    </div>
  )
}
