"use client"
import { Link } from "react-router";
import * as React from "react"
import {
    AudioWaveform,
    BookOpen,
    Bot,
    Command,
    Frame,
    GalleryVerticalEnd,
    Map,
    PieChart,
    Settings2,
    SquareTerminal,
    House,
    Users,
    Contact,
    Video,
    MessageCircle,
    Megaphone,
    List,
    LockKeyholeOpen,
    Component
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
            {
                title: "Clients",
                url: "/clients",
                icon: Contact,
            },
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
            ...(isSuperAdmin ? [
                {
                    title: "Users", url: "/users", icon: Users
                },
                {
                    title: "Settings",
                    url: "/settings",
                    icon: Settings2,
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
                        className="h-20 w-auto"
                    />
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain as any} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
