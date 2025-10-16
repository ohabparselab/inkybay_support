"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { useLocation } from "react-router-dom"
import { Link } from "react-router"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
    items,
}: {
    items: {
        title: string
        url: string
        icon?: LucideIcon
        isActive?: boolean
        items?: {
            title: string
            url: string
            icon: string
        }[]
    }[]
}) {
    const location = useLocation()

    // Helper: check if URL is active (supports nested routes)
    const isActive = (url: string) =>
        location.pathname === url || location.pathname.startsWith(url + "/")

    return (
        <SidebarGroup>
            <SidebarMenu>
                {items.map((item) => {
                    const parentActive =
                        isActive(item.url) ||
                        item.items?.some((sub) => isActive(sub.url))

                    if (item.items && item.items.length > 0) {
                        return (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={parentActive}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            className={`${parentActive
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "hover:bg-muted/50"
                                                }`}
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight className={`ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90`} />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items.map((subItem) => {
                                                const active = isActive(subItem.url)
                                                return (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            className={`${active
                                                                ? "text-primary font-medium bg-primary/10"
                                                                : "hover:bg-muted/40"
                                                                }`}
                                                        >
                                                            <Link to={subItem.url}>
                                                                {subItem.icon && <subItem.icon />}
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                )
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        )
                    }

                    const active = isActive(item.url)

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                className={`${active
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "hover:bg-muted/50"
                                    }`}
                            >
                                <Link to={item.url}>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}
