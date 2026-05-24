"use client"

import { useState, useEffect } from "react"
import { getAllUsers, updateUserRole, updateUserProfile, deleteUser, updateUserPassword, createUser } from "@/app/actions/users"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Users, Search, Filter, Shield, ShieldAlert, 
  Trash2, Tag, Hash, MoreHorizontal, Settings2,
  Lock, CheckCircle2, XCircle, UserPlus, Group,
  Pencil, RefreshCw, Copy, Check, User as UserIcon
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<any>(null)
  const [passwordUser, setPasswordUser] = useState<any>(null)
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) || 
                         (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleToggleRole = async (user: any) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN"
    if (!confirm(`Изменить роль пользователя ${user.email} на ${newRole}?`)) return
    await updateUserRole(user.id, newRole)
    loadUsers()
  }

  const handleDelete = async (user: any) => {
    if (!confirm(`ВНИМАНИЕ! Вы уверены, что хотите УДАЛИТЬ аккаунт ${user.email}? Это действие необратимо.`)) return
    await deleteUser(user.id)
    loadUsers()
  }

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let pass = ""
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGeneratedPassword(pass)
    setCopied(false)
  }

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const savePassword = async () => {
    if (!generatedPassword) return
    await updateUserPassword(passwordUser.id, generatedPassword)
    setPasswordUser(null)
    alert("Пароль успешно обновлен")
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get("name") as string
    const group = formData.get("group") as string
    const tags = (formData.get("tags") as string).split(",").map(t => t.trim()).filter(Boolean)
    
    await updateUserProfile(editUser.id, { 
      name,
      group, 
      tags,
    })
    setEditUser(null)
    loadUsers()
  }

  const [createRole, setCreateRole] = useState("USER")

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string
    const name = formData.get("name") as string
    const role = formData.get("role") as any
    const group = formData.get("group") as string
    const password = formData.get("password") as string

    if (!email || !password) return alert("Email и пароль обязательны")

    await createUser({ email, name, role, group, password })
    setIsCreateOpen(false)
    loadUsers()
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управление аккаунтами</h1>
          <p className="text-muted-foreground italic mt-1">Администрирование пользователей, ролей и групп</p>
        </div>
        <div className="flex items-center gap-3">
            <Button onClick={() => setIsCreateOpen(true)} className="rounded-2xl gap-2 font-bold shadow-lg shadow-primary/10">
                <UserPlus className="h-4 w-4" /> Создать пользователя
            </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Поиск по email или имени..." 
            className="pl-10 h-11 rounded-xl bg-background border-primary/10 focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 rounded-xl gap-2 border-primary/10 min-w-[140px]">
                    <Filter className="h-4 w-4" /> {roleFilter === "ALL" ? "Все роли" : roleFilter === "ADMIN" ? "Админы" : "Участники"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl p-2 w-48 shadow-2xl border-primary/10">
                <DropdownMenuItem onClick={() => setRoleFilter("ALL")} className="rounded-lg">Все пользователи</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("ADMIN")} className="rounded-lg">Только администраторы</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("USER")} className="rounded-lg">Только участники</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="border-none shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 border-b border-primary/5">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Пользователь</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Роль</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Группа</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Метки и Теги</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Регистрация</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">Загрузка списка пользователей...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">Пользователи не найдены</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{user.name || "Без имени"}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="rounded-full px-3 font-bold text-[10px] tracking-wide">
                      {user.role === "ADMIN" ? "Администратор" : "Участник"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-foreground/70">
                      <Group className="h-3.5 w-3.5 text-muted-foreground" />
                      {user.group || <span className="text-muted-foreground/40 italic">—</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {user.tags?.map((t: string) => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold border border-blue-500/10">#{t}</span>
                      ))}
                      {user.labels?.map((l: string) => (
                        <span key={l} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-500/10 text-zinc-600 font-bold border border-zinc-500/10 lowercase">{l}</span>
                      ))}
                      {!user.tags?.length && !user.labels?.length && (
                        <span className="text-muted-foreground/40 italic text-xs">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-muted-foreground">
                      {user.createdAt ? format(new Date(user.createdAt), "d MMMM yyyy", { locale: ru }) : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-primary/10">
                        <DropdownMenuLabel className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground px-2 py-2">
                          <Settings2 className="h-3 w-3" /> Действия
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-primary/5" />
                        <DropdownMenuItem onClick={() => setEditUser(user)} className="rounded-xl gap-2 focus:bg-primary/5 focus:text-primary">
                          <Pencil className="h-4 w-4" /> Редактировать профиль
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleRole(user)} className="rounded-xl gap-2 focus:bg-primary/5 focus:text-primary">
                          {user.role === "ADMIN" ? <Shield className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                          Сделать {user.role === "ADMIN" ? "Пользователем" : "Админом"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setPasswordUser(user); setGeneratedPassword(""); }} className="rounded-xl gap-2 focus:bg-primary/5 focus:text-primary">
                          <Lock className="h-4 w-4" /> Сменить пароль
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-primary/5" />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(user)} 
                          className="rounded-xl gap-2 text-destructive focus:bg-destructive/5 focus:text-destructive font-bold"
                        >
                          <Trash2 className="h-4 w-4" /> Удалить аккаунт
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-[2rem] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Новый аккаунт</DialogTitle>
            <DialogDescription>Создайте учетную запись вручную.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Email</Label>
              <Input name="email" type="email" required className="rounded-xl border-primary/10" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Имя (ФИО)</Label>
              <Input name="name" className="rounded-xl border-primary/10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Группа</Label>
                  <Input name="group" className="rounded-xl border-primary/10" placeholder="БПИ-..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Роль</Label>
                  <Select onValueChange={setCreateRole} defaultValue="USER">
                      <SelectTrigger className="rounded-xl border-primary/10">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                          <SelectItem value="USER">Пользователь</SelectItem>
                          <SelectItem value="ADMIN">Админ</SelectItem>
                      </SelectContent>
                  </Select>
                  <input type="hidden" name="role" value={createRole} />
                </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Пароль</Label>
              <div className="relative">
                <Input name="password" id="create-pass" className="rounded-xl border-primary/10 pr-10" required />
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1 h-8 w-8 text-muted-foreground"
                    onClick={() => {
                        const el = document.getElementById('create-pass') as HTMLInputElement;
                        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
                        let pass = "";
                        for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
                        el.value = pass;
                    }}
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full rounded-xl font-bold shadow-lg shadow-primary/20">Создать аккаунт</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="rounded-[2rem] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Редактирование профиля</DialogTitle>
            <DialogDescription>Измените данные пользователя. Нажмите сохранить для применения.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">ФИО / Имя</Label>
              <Input id="name" name="name" defaultValue={editUser?.name} className="rounded-xl border-primary/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Группа</Label>
              <Input id="group" name="group" defaultValue={editUser?.group} className="rounded-xl border-primary/10" placeholder="Напр. БПИ-123" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Теги (через запятую)</Label>
              <Input id="tags" name="tags" defaultValue={editUser?.tags?.join(", ")} className="rounded-xl border-primary/10" placeholder="math, top, 2024" />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full rounded-xl font-bold">Сохранить изменения</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={!!passwordUser} onOpenChange={(open) => !open && setPasswordUser(null)}>
        <DialogContent className="rounded-[2rem] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Смена пароля</DialogTitle>
            <DialogDescription>Сгенерируйте и установите новый пароль для {passwordUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Новый пароль</Label>
              <div className="relative">
                <Input 
                  value={generatedPassword} 
                  onChange={(e) => setGeneratedPassword(e.target.value)}
                  className="rounded-xl pr-24 font-mono text-center" 
                  placeholder="Нажмите 'Генерировать'"
                />
                <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopyPassword}
                    className="absolute right-1 top-1 bottom-1 rounded-lg px-2 text-[10px]"
                    disabled={!generatedPassword}
                >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={generatePassword} className="rounded-xl gap-2 font-bold group">
                    <RefreshCw className="h-4 w-4 group-active:rotate-180 transition-transform" /> Генерировать
                </Button>
                <Button onClick={savePassword} disabled={!generatedPassword} className="rounded-xl gap-2 font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20">
                    <CheckCircle2 className="h-4 w-4" /> Установить
                </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
