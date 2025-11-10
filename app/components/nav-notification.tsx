"use client"

import {
    Bell,
    CheckCircle,
    MessageSquare,
    AlertCircle,
    Clock,
    ChevronRight,
    BellDot,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useFetcher } from "react-router"

export function NavNotification() {
    
    const { isMobile } = useSidebar()
    const fetcher = useFetcher()

    // Example notification data
    const notifications = [
        {
            id: 1,
            type: "message",
            title: "New message from John Doe",
            time: "2 min ago",
            icon: MessageSquare,
            color: "text-blue-500",
        },
        {
            id: 2,
            type: "alert",
            title: "Server maintenance scheduled",
            time: "1 hr ago",
            icon: AlertCircle,
            color: "text-red-500",
        },
        {
            id: 3,
            type: "success",
            title: "Payment received successfully",
            time: "3 hrs ago",
            icon: CheckCircle,
            color: "text-green-500",
        },
    ]

    const unreadCount = notifications.length

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground justify-between cursor-pointer"
                        >
                            <div className="flex gap-2">
                                <Bell size={20} /> Notifications
                            </div>
                            <div className="relative inline-flex items-center text-sm font-medium text-center">
                                <Bell />
                                {unreadCount > 0 && (
                                    <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900">
                                        {unreadCount}
                                    </div>
                                )}
                            </div>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-80 rounded-xl shadow-lg border bg-white dark:bg-neutral-900 dark:border-neutral-700"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={6}
                    >
                        <div className="flex items-center justify-between px-3 py-2">
                            <h4 className="font-semibold text-sm">Notifications</h4>
                            <Button variant="link" size="sm" className="text-blue-600 p-0 h-auto">
                                Mark all read
                            </Button>
                        </div>

                        <DropdownMenuSeparator />

                        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <DropdownMenuItem
                                        key={n.id}
                                        className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer"
                                    >
                                        <n.icon className={cn("size-5 mt-0.5", n.color)} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{n.title}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="size-3" /> {n.time}
                                            </p>
                                        </div>
                                        <ChevronRight className="size-4 text-muted-foreground" />
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <p className="text-center text-sm text-muted-foreground py-4">
                                    No new notifications
                                </p>
                            )}
                        </div>

                        <DropdownMenuSeparator />
                        <div className="flex justify-center p-2">
                            <Button variant="link" size="sm" className="text-blue-600">
                                View All Notifications
                            </Button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
