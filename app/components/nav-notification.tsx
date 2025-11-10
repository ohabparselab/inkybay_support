"use client"

import {
    Bell,
    Clock,
    ChevronRight,
    MessageSquare,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { charIconGen } from "~/lib/helper.sever"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { useEffect, useState } from "react"

export function NavNotification() {

    const { isMobile } = useSidebar()
    const [notifyInfo, setNotifyInfo] = useState<any>({});

    const fetchNotifications = async () => {
        const notifyData = await fetch("/api/notifications").then((res) => res.json());
        if (notifyData.success) {
            setNotifyInfo(notifyData);
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, []);

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
                            {notifyInfo?.unreadCount > 0 && (
                                <div className="relative inline-flex items-center text-sm font-medium text-center">
                                    <Bell />
                                    <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900">
                                        {notifyInfo?.unreadCount || 0}
                                    </div>
                                </div>
                            )}
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-110 rounded-xl shadow-lg border bg-white dark:bg-neutral-900 dark:border-neutral-700"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={6}
                    >
                        <div className="flex items-center justify-between px-3 py-2">
                            <h4 className="font-semibold text-sm">Notifications</h4>
                            <Button variant="link" size="sm" className="text-blue-600">
                                See all Notifications
                            </Button>
                        </div>
                        <DropdownMenuSeparator />
                        <div className="max-h-128 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                            {notifyInfo?.notifications?.length > 0 ? (
                                notifyInfo?.notifications?.map((n: any) => (
                                    <DropdownMenuItem
                                        key={n.id}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer"
                                    >
                                        <Avatar className="h-auto w-8">
                                            {n.user?.avatar ? (
                                                <AvatarImage src={n.user?.avatar} alt={n.user?.avatar || "User"} />
                                            ) : (
                                                <AvatarFallback>{charIconGen(n.user?.fullName || "SS")}</AvatarFallback>
                                            )}
                                        </Avatar>
                                        {/* <MessageSquare className="size-5 mt-0.5 text-green-600"/> */}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{n.title}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="size-3" /> {formatDistanceToNow(n.createdAt)}
                                            </p>
                                        </div>
                                        <ChevronRight className="size-4 text-muted-foreground" />
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <p className="text-center text-sm text-muted-foreground py-20">
                                    No notifications found.
                                </p>
                            )}
                        </div>
                        {/* {notifyInfo?.notifications?.length > 10 && (
                            <>
                                <DropdownMenuSeparator />
                                <div className="flex justify-center p-2">
                                    <Button variant="link" size="sm" className="text-blue-600">
                                        See all Notifications
                                    </Button>
                                </div>
                            </>
                        )
                        } */}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
