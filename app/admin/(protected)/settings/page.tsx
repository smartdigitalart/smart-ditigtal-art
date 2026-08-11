import { SiteSettingsForm } from "@/components/settings/site-settings-form"
import { getAdminSiteSettingsAction } from "@/app/admin/(protected)/settings/actions"

export default async function AdminSettingsPage() {
  const settings = await getAdminSiteSettingsAction()

  return <SiteSettingsForm settings={settings} />
}
