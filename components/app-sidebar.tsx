"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  LayoutDashboardIcon,
  PackageIcon,
  TagsIcon,
  AwardIcon,
  UsersIcon,
  ShoppingCartIcon,
  FileTextIcon,
  Settings2Icon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navMain = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: <PackageIcon />,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: <TagsIcon />,
  },
  {
    title: "Brands",
    url: "/admin/brands",
    icon: <AwardIcon />,
  },
  {
    title: "Customers",
    url: "/admin/customers",
    icon: <UsersIcon />,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: <ShoppingCartIcon />,
  },
  {
    title: "Blogs",
    url: "/admin/blogs",
    icon: <FileTextIcon />,
  },
  {
    title: "Settings",
    url: "#",
    icon: <Settings2Icon />,
  },
]

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string }
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md">
                  <Image
                    src="/logo.jpg"
                    alt="Smart Digital Art"
                    width={32}
                    height={32}
                    className="size-full object-cover"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Smart Digital Art</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Admin Panel
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
