"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { 
  Database, Download, RotateCcw, Trash2, 
  Upload, Loader2, FileArchive, Clock, 
  HardDrive, Plus, Save, AlertTriangle
} from "lucide-react"
import { toast } from "sonner"
import { updateBackupSettings } from "@/app/actions/settings"

interface Backup {
  name: string
  size: number
  createdAt: string
}

export function BackupManager({ initialSettings }: { initialSettings: any }) {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [autoBackup, setAutoBackup] = useState(initialSettings?.autoBackupEnabled || false)
  const [retention, setRetention] = useState(initialSettings?.backupCount || 3)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchBackups()
  }, [])

  async function fetchBackups() {
    try {
      const res = await fetch("/api/admin/backups")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setBackups(data)
    } catch (e) {
      toast.error("Не удалось загрузить список бэкапов")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    setCreating(true)
    const toastId = toast.loading("Создание бэкапа...")
    try {
      const res = await fetch("/api/admin/backups", { method: "POST" })
      if (!res.ok) throw new Error("Ошибка сервера")
      toast.success("Резервная копия создана", { id: toastId })
      fetchBackups()
    } catch (e) {
      toast.error("Сбой при создании", { id: toastId })
    } finally {
      setCreating(false)
    }
  }

  async function handleRestore(filename: string) {
    if (!confirm(`Восстановить из ${filename}? Текущие данные будут заменены.`)) return
    
    setRestoring(filename)
    const toastId = toast.loading("Восстановление...")
    try {
      const res = await fetch("/api/admin/backups/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename })
      })
      if (!res.ok) throw new Error("Ошибка при восстановлении")
      toast.success("Готово. Перезагрузка...", { id: toastId })
      setTimeout(() => window.location.reload(), 2000)
    } catch (e) {
      toast.error("Ошибка восстановления", { id: toastId })
    } finally {
      setRestoring(null)
    }
  }

  async function handleDelete(filename: string) {
    if (!confirm(`Удалить ${filename}?`)) return
    try {
      const res = await fetch(`/api/admin/backups/${filename}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Ошибка при удалении")
      setBackups(prev => prev.filter(b => b.name !== filename))
      toast.success("Удалено")
    } catch (e) {
      toast.error("Не удалось удалить")
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const toastId = toast.loading("Загрузка...")
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/admin/backups/restore", {
        method: "POST",
        body: formData
      })
      if (!res.ok) throw new Error("Ошибка при загрузке")
      toast.success("Архив развернут", { id: toastId })
      setTimeout(() => window.location.reload(), 2000)
    } catch (e) {
      toast.error("Ошибка загрузки", { id: toastId })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function saveSettings() {
    try {
      await updateBackupSettings({ autoBackupEnabled: autoBackup, backupCount: Number(retention) })
      toast.success("Настройки сохранены")
    } catch (e) {
      toast.error("Ошибка сохранения")
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return "??.??"
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      
      {}
      <Card className="border-none shadow-xl shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-md">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-bold">Настройки автоматизации</CardTitle>
          <CardDescription>Управление автоматическим созданием копий</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-8 py-4 px-6 rounded-[2rem] bg-muted/30 border border-primary/5">
            <div className="flex-1 space-y-1">
              <Label className="text-base font-bold">Автоматический бэкап</Label>
              <p className="text-xs text-muted-foreground italic">
                Система будет создавать копию каждые 24 часа
              </p>
            </div>
            <Switch 
              checked={autoBackup} 
              onCheckedChange={setAutoBackup}
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-8 py-4 px-6 rounded-[2rem] bg-muted/30 border border-primary/5">
            <div className="flex-1 space-y-1">
              <Label className="text-base font-bold">Глубина хранения</Label>
              <p className="text-xs text-muted-foreground italic">
                Количество сохраняемых снимков перед перезаписью (1-10)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Input 
                type="number" 
                value={retention} 
                onChange={(e) => setRetention(parseInt(e.target.value))}
                min={1} 
                max={10}
                className="w-20 text-center font-bold"
              />
              <Button onClick={saveSettings} size="sm" className="rounded-xl">
                <Save className="h-4 w-4 mr-2" />
                Применить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Backups List Card */}
      <Card className="border-none shadow-xl shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-md">
        <CardHeader className="p-8 flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Доступные копии
            </CardTitle>
            <CardDescription>{backups.length} снимков в системе</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleCreate} 
              disabled={creating}
              className="rounded-xl"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Создать
            </Button>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-xl"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Загрузить
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleUpload} accept=".zip" className="hidden" />
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {loading ? (
                 Array.from({ length: 3 }).map((_, i) => (
                   <div key={i} className="h-20 rounded-2xl bg-muted/50 animate-pulse" />
                 ))
              ) : backups.length === 0 ? (
                 <div className="text-center py-12 border border-dashed border-primary/10 rounded-[2rem] bg-muted/20">
                    <p className="text-muted-foreground italic">Список бэкапов пуст</p>
                 </div>
              ) : (
                 backups.map((backup) => (
                   <motion.div 
                     key={backup.name}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 10 }}
                     className="flex items-center justify-between p-4 rounded-2xl border border-primary/5 bg-background/50 hover:border-primary/20 transition-all group"
                   >
                     <div className="flex items-center gap-4 flex-1 min-w-0">
                       <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                         <FileArchive className="h-5 w-5 text-primary" />
                       </div>
                       <div className="min-w-0">
                         <p className="text-sm font-bold truncate" title={backup.name}>{backup.name}</p>
                         <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-medium mt-0.5">
                           <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {formatDate(backup.createdAt)}</span>
                           <span className="flex items-center gap-1.5"><HardDrive className="h-3 w-3" /> {formatSize(backup.size)}</span>
                         </div>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary">
                           <a href={`/api/admin/backups/${backup.name}`} download><Download className="h-4 w-4" /></a>
                        </Button>
                        <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={() => handleRestore(backup.name)}
                           disabled={!!restoring}
                           className="h-9 w-9 rounded-xl hover:bg-amber-500/10 hover:text-amber-600"
                        >
                           {restoring === backup.name ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                        </Button>
                        <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={() => handleDelete(backup.name)}
                           className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                        >
                           <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                   </motion.div>
                 ))
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-destructive/5 border border-destructive/10 flex gap-4">
             <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
             <div className="space-y-1">
                <p className="text-xs font-bold text-destructive uppercase tracking-wider">Внимание</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                  Восстановление данных полностью заменит текущее состояние базы данных. Используйте эту функцию осторожно.
                </p>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
