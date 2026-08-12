"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PackageIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { searchProductsAction, type SearchSuggestion } from "@/app/(store)/_components/searchActions";

interface SearchBarProps {
   autoFocus?: boolean;
   onSubmitted?: () => void;
   className?: string;
}

export default function SearchBar({ autoFocus, onSubmitted, className }: SearchBarProps) {
   const router = useRouter();
   const searchParams = useSearchParams();
   const [query, setQuery] = useState(searchParams.get("q") ?? "");
   const [results, setResults] = useState<SearchSuggestion[]>([]);
   const [loading, setLoading] = useState(false);
   const [open, setOpen] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);
   const requestIdRef = useRef(0);

   useEffect(() => {
      const trimmed = query.trim();
      if (!trimmed) return;

      const requestId = ++requestIdRef.current;
      const timeout = setTimeout(() => {
         setLoading(true);
         void searchProductsAction(trimmed).then((suggestions) => {
            if (requestIdRef.current !== requestId) return;
            setResults(suggestions);
            setLoading(false);
            setOpen(true);
         });
      }, 250);

      return () => clearTimeout(timeout);
   }, [query]);

   useEffect(() => {
      const handlePointerDown = (event: MouseEvent) => {
         if (!containerRef.current?.contains(event.target as Node)) {
            setOpen(false);
         }
      };
      document.addEventListener("mousedown", handlePointerDown);
      return () => document.removeEventListener("mousedown", handlePointerDown);
   }, []);

   const closeResults = () => {
      setOpen(false);
      onSubmitted?.();
   };

   const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;
      setOpen(false);
      router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
      onSubmitted?.();
   };

   return (
      <div ref={containerRef} className={className ?? "relative w-full max-w-md"}>
         <form onSubmit={handleSubmit} className="relative w-full">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
               type="search"
               value={query}
               onChange={(event) => {
                  const value = event.target.value;
                  setQuery(value);
                  if (!value.trim()) {
                     setResults([]);
                     setLoading(false);
                     setOpen(false);
                  }
               }}
               onFocus={() => {
                  if (query.trim() && results.length > 0) setOpen(true);
               }}
               onKeyDown={(event) => {
                  if (event.key === "Escape") setOpen(false);
               }}
               placeholder="Search products..."
               className="pl-9"
               aria-label="Search products"
               autoFocus={autoFocus}
               autoComplete="off"
            />
         </form>

         {open && query.trim() && (
            <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
               {loading ? (
                  <p className="p-4 text-sm text-muted-foreground">Searching...</p>
               ) : results.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">No products found.</p>
               ) : (
                  <ul className="flex flex-col divide-y divide-border">
                     {results.map((product) => (
                        <li key={product.id}>
                           <Link
                              href={`/products/${product.slug}`}
                              onClick={closeResults}
                              className="flex items-center gap-3 p-3 transition-colors hover:bg-accent"
                           >
                              <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                                 {product.image ? (
                                    <Image
                                       src={product.image}
                                       alt={product.name}
                                       fill
                                       sizes="48px"
                                       className="object-cover"
                                    />
                                 ) : (
                                    <div className="flex size-full items-center justify-center text-muted-foreground">
                                       <PackageIcon className="size-5" />
                                    </div>
                                 )}
                              </div>
                              <div className="flex min-w-0 flex-1 flex-col">
                                 <span className="truncate text-sm font-medium text-foreground">
                                    {product.name}
                                 </span>
                                 <span className="text-sm font-semibold text-foreground">
                                    {product.salePrice != null && product.salePrice < product.price ? (
                                       <>
                                          ৳{product.salePrice.toFixed(2)}{" "}
                                          <span className="text-xs font-normal text-muted-foreground line-through">
                                             ৳{product.price.toFixed(2)}
                                          </span>
                                       </>
                                    ) : (
                                       <>৳{product.price.toFixed(2)}</>
                                    )}
                                 </span>
                              </div>
                           </Link>
                        </li>
                     ))}
                     <li>
                        <Link
                           href={`/shop?q=${encodeURIComponent(query.trim())}`}
                           onClick={closeResults}
                           className="block p-3 text-center text-sm font-medium text-primary transition-colors hover:bg-accent"
                        >
                           See all results
                        </Link>
                     </li>
                  </ul>
               )}
            </div>
         )}
      </div>
   );
}
