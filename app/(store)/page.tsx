import { Hero } from "@/app/(store)/_components/Hero";
import { CategorySplitBanner } from "@/app/(store)/_components/CategorySplitBanner";
import { CategoryProductsRow } from "@/app/(store)/_components/CategoryProductsRow";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Hero />
      <CategorySplitBanner />
      <CategoryProductsRow />
    </div>
  );
}
