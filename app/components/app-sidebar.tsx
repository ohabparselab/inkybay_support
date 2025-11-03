"use client"
import { Link } from "react-router";
import * as React from "react"
import pkg from "../../package.json";
import {
    House,
    Users,
    Video,
    MessageCircle,
    Megaphone,
    List,
    LockKeyholeOpen,
    Component,
    Columns3Cog,
    FileStack,
    Settings,
    Star,
    Handbag,
    CircleQuestionMark,
    Handshake
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { useOutletContext } from "react-router";

type RootContext = { currentUser: Awaited<ReturnType<typeof import("~/lib/user.server").getUser>> | null };

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const { currentUser } = useOutletContext<RootContext>();
    if (!currentUser) return null;
    const isSuperAdmin = currentUser.role.slug === "super-admin";

    const data = {
        user: {
            name: currentUser.fullName,
            email: currentUser.email,
            avatar: currentUser.avatar || "/avatar-default.svg",
        },
        navMain: [
            {
                title: "Dashboard",
                url: "/dashboard",
                icon: House,
            },
            // {
            //     title: "Clients",
            //     url: "/clients",
            //     icon: Contact,
            // },
            {
                title: "Chats",
                url: "/chats",
                icon: MessageCircle,
            },
            {
                title: "Tasks",
                url: "/tasks",
                icon: List,
            },
            {
                title: "Meetings",
                url: "/meetings",
                icon: Video,
            },
            {
                title: "Marketing Funnels",
                url: "/marketing-funnels",
                icon: Megaphone,
            },
            {
                title: "Reviews",
                url: "/reviews",
                icon: Star,
            },
            {
                title: "Feature Requests",
                url: "/feature-requests",
                icon: CircleQuestionMark,
            },
            {
                title: "Collaborations",
                url: "/collaborations",
                icon: Handshake,
            },
            {
                title: "Shopify Communities",
                url: "/shopify-communities",
                icon: Handbag,
            },
            ...(isSuperAdmin ? [
                {
                    title: "Users", url: "/users", icon: Users
                },
                {
                    title: "Settings",
                    url: "/settings",
                    icon: Settings,
                    items: [
                        {
                            title: "Permissions",
                            url: "/settings/permissions",
                            icon: LockKeyholeOpen
                        },
                        {
                            title: "Modules",
                            url: "/settings/modules",
                            icon: Component
                        },
                        {
                            title: "Projects",
                            url: "/settings/projects",
                            icon: Columns3Cog
                        },
                        {
                            title: "Platforms",
                            url: "/settings/platforms",
                            icon: FileStack
                        }
                    ],
                },
            ] : []),
        ]
    }
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <Link to="/dashboard">
                    <img
                        src="/inkybay-logo.svg"
                        alt="InkyBay Support"
                        className="h-20 w-auto cursor-pointer"
                    />
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain as any} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
                <span className="text-[10px]">Version: {pkg.version}</span>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
