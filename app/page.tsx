import { getGlobalSettings } from "@/app/actions/settings"
import HomeClient from "./HomeClient"

export const dynamic = 'force-dynamic'

export default async function Home() {
  console.log("[PAGE] Rendering Home Page");
  const settings = await getGlobalSettings()
  
  return <HomeClient registrationEnabled={settings?.registrationEnabled ?? true} />
}
