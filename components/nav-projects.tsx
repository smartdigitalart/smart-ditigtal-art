"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavProjects({
  projects,
  label = "Projects",
}: {
  projects: {
    name: string
    url: string
    icon: React.ReactNode
  }[]
  label?: string
}) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const isProjectActive = (url: string) =>
    url !== "#" && (pathname === url || pathname.startsWith(`${url}/`))
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              isActive={isProjectActive(item.url)}
              render={<Link href={item.url} onClick={closeOnMobile} />}
            >
              {item.icon}
              <span>{item.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
