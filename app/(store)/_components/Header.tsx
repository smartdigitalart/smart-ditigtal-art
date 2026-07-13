"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";


export default function Header() {
   const { user, isAuthenticated, isLoading, logout } = useAuth();

   return (
      <header className="w-full border-b border-border">
         <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link href="/" className="shrink-0">
               <Image
                  src="/SMART_DIGITAL_ART_PAD_LOGO.jpg.jpeg"
                  alt="Smart Digital Art"
                  width={200}
                  height={200}
                  className="h-12 w-auto"
                  priority
               />
            </Link>

            {isLoading ? (
               <Skeleton className="h-9 w-24" />
            ) : isAuthenticated ? (
               <div className="flex items-center gap-3">
                  <span className="hidden text-sm text-muted-foreground sm:inline">
                     {user?.email}
                  </span>
                  <button
                     type="button"
                     onClick={() => void logout()}
                     className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:text-foreground"
                  >
                     <LogOut size={18} />
                     <span>Sign out</span>
                  </button>
               </div>
            ) : (
               <Link
                  href="/signin"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:text-foreground"
               >
                  <User size={18} />
                  <span>Sign in</span>
               </Link>
            )}
         </div>
      </header>
   );
}
