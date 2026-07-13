import type { Metadata } from "next";

import AppProviders from "@/providers/AppProviders";
import { cn } from "@/lib/utils";

import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Digital Art",
  description:
    "Smart Digital Art — a marketplace for digital art, handmade physical art, and perfume.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full ">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
