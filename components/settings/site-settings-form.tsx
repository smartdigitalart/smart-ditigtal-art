"use client"

import { useState } from "react"
import { PlusIcon, SaveIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import {
  deleteCategoryPromoCardUploadAction,
  deleteHeroBannerUploadAction,
  updateSiteSettingsAction,
  uploadCategoryPromoCardAction,
  uploadHeroBannerAction,
} from "@/app/admin/(protected)/settings/actions"
import { SingleImageUpload } from "@/components/shared/single-image-upload"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type {
  CategoryPromoCard,
  HeroBanner,
  SiteSettings,
  SiteSocialLinks,
} from "@/lib/types/site-settings"

const MAX_BANNERS = 4
const HERO_RECOMMENDED_SIZE = "Recommended size: 1376 x 768 px. PNG or JPG, up to 10MB."
const PROMO_CARD_RECOMMENDED_SIZE = "Recommended size: 608 x 320 px or larger. PNG or JPG, up to 10MB."

function newBanner(): HeroBanner {
  return {
    id: crypto.randomUUID(),
    imageUrl: "",
    alt: "Smart Digital Art banner",
  }
}

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [originalImages, setOriginalImages] = useState(
    () =>
      new Set([
        ...settings.heroBanners.map((banner) => banner.imageUrl),
        ...settings.categoryPromoCards.map((card) => card.imageUrl),
      ])
  )
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>(
    settings.heroBanners.length ? settings.heroBanners : [newBanner()]
  )
  const [categoryPromoCards, setCategoryPromoCards] = useState<CategoryPromoCard[]>(
    settings.categoryPromoCards
  )
  const [socialLinks, setSocialLinks] = useState<SiteSocialLinks>(
    settings.socialLinks
  )
  const [saving, setSaving] = useState(false)

  const updateBanner = (id: string, patch: Partial<HeroBanner>) => {
    setHeroBanners((current) =>
      current.map((banner) =>
        banner.id === id ? { ...banner, ...patch } : banner
      )
    )
  }

  const updatePromoCard = (
    id: CategoryPromoCard["id"],
    patch: Partial<CategoryPromoCard>
  ) => {
    setCategoryPromoCards((current) =>
      current.map((card) => (card.id === id ? { ...card, ...patch } : card))
    )
  }

  const removeBanner = (banner: HeroBanner) => {
    if (heroBanners.length === 1) {
      toast.error("Keep at least one banner.")
      return
    }

    if (banner.imageUrl && !originalImages.has(banner.imageUrl)) {
      void deleteHeroBannerUploadAction(banner.id, banner.imageUrl)
    }

    setHeroBanners((current) => current.filter((item) => item.id !== banner.id))
  }

  const uploadBanner = (bannerId: string, formData: FormData) => {
    const file = formData.get("file")
    const payload = new FormData()
    payload.append("bannerId", bannerId)
    if (file) payload.append("file", file)
    return uploadHeroBannerAction(payload)
  }

  const uploadPromoCard = (promoCardId: string, formData: FormData) => {
    const file = formData.get("file")
    const payload = new FormData()
    payload.append("promoCardId", promoCardId)
    if (file) payload.append("file", file)
    return uploadCategoryPromoCardAction(payload)
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const saved = await updateSiteSettingsAction({
        heroBanners,
        categoryPromoCards,
        socialLinks,
      })
      setHeroBanners(saved.heroBanners)
      setCategoryPromoCards(saved.categoryPromoCards)
      setSocialLinks(saved.socialLinks)
      setOriginalImages(
        new Set([
          ...saved.heroBanners.map((banner) => banner.imageUrl),
          ...saved.categoryPromoCards.map((card) => card.imageUrl),
        ])
      )
      toast.success("Site settings updated")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update settings"
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Storefront Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage homepage banners, promo cards, and footer social links.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Hero banners</CardTitle>
            <CardDescription>
              Images shown in the homepage carousel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {heroBanners.map((banner, index) => (
                <Field key={banner.id}>
                  <div className="flex items-center justify-between gap-3">
                    <FieldLabel>Banner {index + 1}</FieldLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove banner"
                      disabled={heroBanners.length === 1}
                      onClick={() => removeBanner(banner)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                  <SingleImageUpload
                    value={banner.imageUrl}
                    onChange={(imageUrl) =>
                      updateBanner(banner.id, { imageUrl: imageUrl ?? "" })
                    }
                    size="h-28 w-52"
                    label="Upload banner"
                    uploadAction={(formData) => uploadBanner(banner.id, formData)}
                    deleteAction={deleteHeroBannerUploadAction}
                    uploadId={banner.id}
                    uploadIdField="bannerId"
                    originalValue={
                      originalImages.has(banner.imageUrl) ? banner.imageUrl : null
                    }
                    helperText={HERO_RECOMMENDED_SIZE}
                  />
                  <Input
                    value={banner.alt}
                    placeholder="Banner alt text"
                    onChange={(event) =>
                      updateBanner(banner.id, { alt: event.target.value })
                    }
                  />
                </Field>
              ))}
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-between gap-3">
            <FieldDescription>
              Use wide artwork for best results in the carousel.
            </FieldDescription>
            <Button
              type="button"
              variant="outline"
              disabled={heroBanners.length >= MAX_BANNERS}
              onClick={() => setHeroBanners((current) => [...current, newBanner()])}
            >
              <PlusIcon data-icon="inline-start" />
              Add banner
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Art and perfume cards</CardTitle>
            <CardDescription>
              Images and text shown below the homepage hero.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {categoryPromoCards.map((card) => (
                <Field key={card.id}>
                  <FieldLabel>{card.title} card</FieldLabel>
                  <SingleImageUpload
                    value={card.imageUrl}
                    onChange={(imageUrl) =>
                      updatePromoCard(card.id, { imageUrl: imageUrl ?? "" })
                    }
                    size="h-28 w-52"
                    label="Upload card image"
                    uploadAction={(formData) => uploadPromoCard(card.id, formData)}
                    deleteAction={deleteCategoryPromoCardUploadAction}
                    uploadId={card.id}
                    uploadIdField="promoCardId"
                    originalValue={
                      originalImages.has(card.imageUrl) ? card.imageUrl : null
                    }
                    helperText={PROMO_CARD_RECOMMENDED_SIZE}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      value={card.eyebrow}
                      placeholder="Small label"
                      onChange={(event) =>
                        updatePromoCard(card.id, { eyebrow: event.target.value })
                      }
                    />
                    <Input
                      value={card.title}
                      placeholder="Title"
                      onChange={(event) =>
                        updatePromoCard(card.id, { title: event.target.value })
                      }
                    />
                    <Input
                      value={card.cta}
                      placeholder="CTA text"
                      onChange={(event) =>
                        updatePromoCard(card.id, { cta: event.target.value })
                      }
                    />
                    <Input
                      value={card.alt}
                      placeholder="Image alt text"
                      onChange={(event) =>
                        updatePromoCard(card.id, { alt: event.target.value })
                      }
                    />
                  </div>
                  <Input
                    value={card.href}
                    placeholder="/shop?category=painting"
                    onChange={(event) =>
                      updatePromoCard(card.id, { href: event.target.value })
                    }
                  />
                </Field>
              ))}
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social links</CardTitle>
            <CardDescription>
              Links shown in the storefront footer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="facebook">Facebook</FieldLabel>
                <Input
                  id="facebook"
                  value={socialLinks.facebook}
                  placeholder="https://facebook.com/your-page"
                  onChange={(event) =>
                    setSocialLinks((current) => ({
                      ...current,
                      facebook: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="instagram">Instagram</FieldLabel>
                <Input
                  id="instagram"
                  value={socialLinks.instagram}
                  placeholder="https://instagram.com/your-page"
                  onChange={(event) =>
                    setSocialLinks((current) => ({
                      ...current,
                      instagram: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="messenger">Messenger</FieldLabel>
                <Input
                  id="messenger"
                  value={socialLinks.messenger}
                  placeholder="https://m.me/your-page"
                  onChange={(event) =>
                    setSocialLinks((current) => ({
                      ...current,
                      messenger: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="whatsapp">WhatsApp</FieldLabel>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={socialLinks.whatsapp}
                  placeholder="+8801XXXXXXXXX"
                  onChange={(event) =>
                    setSocialLinks((current) => ({
                      ...current,
                      whatsapp: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  value={socialLinks.email}
                  placeholder="info@example.com"
                  onChange={(event) =>
                    setSocialLinks((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button type="button" disabled={saving} onClick={saveSettings}>
              <SaveIcon data-icon="inline-start" />
              {saving ? "Saving..." : "Save settings"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
