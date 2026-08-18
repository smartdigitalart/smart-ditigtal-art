import { Hero } from "@/app/(store)/_components/Hero";
import { CategorySplitBanner } from "@/app/(store)/_components/CategorySplitBanner";
import { ProductCollectionSection } from "@/app/(store)/_components/ProductCollectionSection";
import { CategoryProductsRow } from "@/app/(store)/_components/CategoryProductsRow";
import { getSiteSettings } from "@/lib/site-settings";

export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-1 flex-col">
      <Hero banners={settings.heroBanners} />
      <CategorySplitBanner cards={settings.categoryPromoCards} />
      <ProductCollectionSection collection="flash-deal" />
      <ProductCollectionSection collection="new-arrival" />
      <CategoryProductsRow />
    </div>
  );
}
