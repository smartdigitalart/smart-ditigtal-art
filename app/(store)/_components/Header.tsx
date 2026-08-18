"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import {
   ArrowLeftIcon,
   LayoutDashboardIcon,
   LogOutIcon,
   PackageIcon,
   SearchIcon,
   ShoppingCartIcon,
   User,
   UserIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import SearchBar from "@/app/(store)/_components/SearchBar";
import { CartSheet } from "@/app/(store)/_components/CartSheet";
import { useCartStore, cartItemCount } from "@/lib/store/cart-store";

export default function Header() {
   const { user, profile, isAdmin, isAuthenticated, isLoading, logout } = useAuth();
   const router = useRouter();
   const cartItems = useCartStore((state) => state.items);
   const setCartOpen = useCartStore((state) => state.setOpen);
   const cartCount = cartItemCount(cartItems);
   const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

   const displayName = profile?.name || user?.email || "Account";
   const initials = displayName.slice(0, 2).toUpperCase();
   const avatarUrl =
      (user?.user_metadata?.avatar_url as string | undefined) ??
      (user?.user_metadata?.picture as string | undefined);

   const handleLogout = async () => {
      await logout();
      router.push("/");
   };

   return (
      <>
      <header className="w-full">
         <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            {mobileSearchOpen ? (
               <div className="flex w-full items-center gap-2 sm:hidden">
                  <button
                     type="button"
                     onClick={() => setMobileSearchOpen(false)}
                     aria-label="Close search"
                     className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/80 outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                     <ArrowLeftIcon className="size-5" />
                  </button>
                  <Suspense fallback={<div className="h-9 w-full" />}>
                     <SearchBar
                        autoFocus
                        onSubmitted={() => setMobileSearchOpen(false)}
                        className="relative w-full"
                     />
                  </Suspense>
               </div>
            ) : (
               <>
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

                  <div className="hidden flex-1 justify-center sm:flex">
                     <Suspense fallback={<div className="h-9 w-full max-w-md" />}>
                        <SearchBar />
                     </Suspense>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-4">
                     <button
                        type="button"
                        onClick={() => setMobileSearchOpen(true)}
                        aria-label="Open search"
                        className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/80 outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 sm:hidden"
                     >
                        <SearchIcon className="size-5" />
                     </button>

                     <button
                        type="button"
                        onClick={() => setCartOpen(true)}
                        aria-label="Open cart"
                        className="relative flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/80 outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                     >
                        <ShoppingCartIcon className="size-5" />
                        {cartCount > 0 && (
                           <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                              {cartCount > 9 ? "9+" : cartCount}
                           </span>
                        )}
                     </button>

                     {isLoading ? (
                        <Skeleton className="size-8 rounded-full" />
                     ) : isAuthenticated ? (
                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                              <button type="button" className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                                 <Avatar>
                                    {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                                    <AvatarFallback>{initials}</AvatarFallback>
                                 </Avatar>
                              </button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel className="font-normal">
                                 <div className="flex flex-col">
                                    <span className="truncate text-sm font-medium">{displayName}</span>
                                    <span className="truncate text-xs text-muted-foreground">
                                       {user?.email}
                                    </span>
                                 </div>
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                 <DropdownMenuItem asChild>
                                    <Link href="/profile">
                                       <UserIcon />
                                       Profile
                                    </Link>
                                 </DropdownMenuItem>
                                 <DropdownMenuItem asChild>
                                    <Link href="/profile/orders">
                                       <PackageIcon />
                                       My Orders
                                    </Link>
                                 </DropdownMenuItem>
                                 {isAdmin && (
                                    <DropdownMenuItem asChild>
                                       <Link href="/admin/dashboard">
                                          <LayoutDashboardIcon />
                                          Admin Dashboard
                                       </Link>
                                    </DropdownMenuItem>
                                 )}
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive" onClick={() => void handleLogout()}>
                                 <LogOutIcon />
                                 Logout
                              </DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
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
               </>
            )}
         </div>
      </header>
      <CartSheet />
      </>
   );
}
