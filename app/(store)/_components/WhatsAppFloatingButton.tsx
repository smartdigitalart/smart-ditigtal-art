import type { SiteSocialLinks } from "@/lib/types/site-settings"

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
    <path
      fill="currentColor"
      d="M16.01 3.2C9.02 3.2 3.33 8.87 3.33 15.85c0 2.23.58 4.4 1.69 6.31L3.2 28.8l6.8-1.78a12.7 12.7 0 0 0 6.01 1.53c6.99 0 12.68-5.67 12.68-12.65S23 3.2 16.01 3.2Zm0 23.21c-1.92 0-3.8-.52-5.44-1.51l-.39-.23-4.03 1.06 1.08-3.93-.25-.4a10.48 10.48 0 0 1-1.61-5.56c0-5.8 4.78-10.51 10.65-10.51 2.84 0 5.51 1.1 7.52 3.08a10.43 10.43 0 0 1 3.11 7.43c-.01 5.8-4.79 10.57-10.64 10.57Zm5.84-7.89c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.58-.95-.85-1.59-1.89-1.78-2.21-.19-.32-.02-.49.14-.65.15-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.07 1.3 3.28c.16.21 2.25 3.43 5.45 4.81.76.33 1.36.53 1.82.67.76.24 1.46.21 2.01.13.61-.09 1.89-.77 2.15-1.52.27-.74.27-1.38.19-1.52-.08-.13-.29-.21-.61-.37Z"
    />
  </svg>
)

function toWhatsAppDigits(number: string) {
  const digits = number.replace(/\D/g, "")

  if (digits.startsWith("880")) return digits
  if (digits.startsWith("0")) return `880${digits.slice(1)}`
  if (digits.length === 10 && digits.startsWith("1")) return `880${digits}`

  return digits
}

export default function WhatsAppFloatingButton({
  socialLinks,
}: {
  socialLinks: SiteSocialLinks
}) {
  const number = socialLinks.whatsapp.trim()
  const digits = toWhatsAppDigits(number)

  if (!number || !digits) return null

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`Chat on WhatsApp at ${number}`}
      className="fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon className="size-8" />
    </a>
  )
}
