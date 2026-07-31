"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";

export default function SearchBar() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const [query, setQuery] = useState(searchParams.get("q") ?? "");

   const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;
      router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
   };

   return (
      <form onSubmit={handleSubmit} className="relative w-full max-w-md">
         <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
         <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="pl-9"
            aria-label="Search products"
         />
      </form>
   );
}
