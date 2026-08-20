import { SiteSettingsForm } from "@/components/settings/site-settings-form"
import {
  getAdminSiteSettingsAction,
  getHeaderNavCategoriesAction,
} from "@/app/admin/(protected)/settings/actions"

export default async function AdminSettingsPage() {
  const [settings, categories] = await Promise.all([
    getAdminSiteSettingsAction(),
    getHeaderNavCategoriesAction(),
  ])

  return <SiteSettingsForm settings={settings} categories={categories} />
}
