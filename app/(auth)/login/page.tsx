import { getGlobalSettings } from "@/app/actions/settings"
import { LoginForm } from "./LoginForm"

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const settings = await getGlobalSettings()
  
  return <LoginForm registrationEnabled={settings?.registrationEnabled ?? true} />
}
