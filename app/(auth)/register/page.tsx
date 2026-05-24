import { getGlobalSettings } from "@/app/actions/settings"
import { RegisterForm } from "./RegisterForm"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  const settings = await getGlobalSettings()
  
  if (settings && !settings.registrationEnabled) {
    redirect("/login")
  }
  
  return <RegisterForm />
}
