import { Suspense } from "react";

import Footer from "@/app/(store)/_components/Footer";
import Header from "@/app/(store)/_components/Header";
import { StoreCategoryNav } from "@/app/(store)/_components/StoreCategoryNav";
import WhatsAppFloatingButton from "@/app/(store)/_components/WhatsAppFloatingButton";
import { DEFAULT_SOCIAL_LINKS, getSiteSettings } from "@/lib/site-settings";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <StoreCategoryNav />
      <main className="flex-1">{children}</main>
      <Suspense fallback={<Footer socialLinks={DEFAULT_SOCIAL_LINKS} />}>
        <StoreFooter />
      </Suspense>
    </div>
  );
}

async function StoreFooter() {
  const settings = await getSiteSettings();

  return (
    <>
      <Footer socialLinks={settings.socialLinks} />
      <WhatsAppFloatingButton socialLinks={settings.socialLinks} />
    </>
  );
}
