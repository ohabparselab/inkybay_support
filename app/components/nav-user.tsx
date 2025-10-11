"use client"

import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    Key,
    LogOut,
    Sparkles,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Link, useFetcher } from "react-router";

export function NavUser({
    user,
}: {
    user: {
        name: string
        email: string
        avatar: string
    }
}) {
    const { isMobile } = useSidebar()
    const fetcher = useFetcher();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="cursor-pointer">
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                {/* <AvatarFallback className="rounded-lg">CN</AvatarFallback> */}
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user.name}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <Link to="users/profile">
                            <DropdownMenuLabel className="p-0 font-normal cursor-pointer">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        {/* <AvatarFallback className="rounded-lg">CN</AvatarFallback> */}
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{user.name}</span>
                                        <span className="truncate text-xs">{user.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <Link to="users/profile">
                                <DropdownMenuItem className="cursor-pointer">
                                    <BadgeCheck />
                                    Profile
                                </DropdownMenuItem>
                            </Link>
                            <Link to="users/change-password">
                                <DropdownMenuItem className="cursor-pointer">
                                    <Key />
                                    Change Password
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem>
                                <Bell />
                                Notifications
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <fetcher.Form method="post" action="/logout">
                            <DropdownMenuItem
                                asChild
                                className="cursor-pointer text-red-600 focus:text-red-700"
                            >
                                <button
                                    type="submit"
                                    disabled={fetcher.state !== "idle"}
                                    className="flex w-full items-center"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    {fetcher.state !== "idle" ? "Logging out..." : "Log out"}
                                </button>
                            </DropdownMenuItem>
                        </fetcher.Form>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
