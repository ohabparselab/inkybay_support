'use client'
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
import { lazy, Suspense, useEffect, useState } from "react"
import { CenterSpinner } from "./ui/center-spinner"
import { charIconGen } from "~/lib/helper.sever"
import { formatDistanceToNow } from "date-fns"
import { Button } from "./ui/button";
import { useSocket } from "~/context";

const ViewTaskDetailsModal = lazy(() =>
    import("~/components/modals/view-task-modal").then((m) => ({ default: m.ViewTaskDetailsModal }))
);

const ViewChatDetailsModal = lazy(() =>
    import("~/components/modals/view-chat-modal").then((m) => ({
        default: m.ViewChatDetailsModal,
    }))
);

const ViewCommunityModal = lazy(() =>
    import("~/components/modals/view-community-modal").then((m) => ({ default: m.ViewCommunityModal }))
);


export function NavNotification() {

    const [selectedTaskId, setSelectedTaskId] = useState<any | null>(null);
    const [selectedChatId, setSelectedChatId] = useState<any | null>(null);
    const [selectedCommunityId, setSelectedCommunityId] = useState<any | null>(null);

    const [viewTaskModalOpen, setViewTaskModalOpen] = useState(false);
    const [viewChatModalOpen, setViewChatModalOpen] = useState(false);
    const [viewCommunityModalOpen, setViewCommunityModalOpen] = useState(false);

    const { isMobile } = useSidebar()
    const [notifyInfo, setNotifyInfo] = useState<any>({});

    const fetchNotifications = async () => {
        const notifyData = await fetch("/api/notifications").then((res) => res.json());
        if (notifyData.success) {
            setNotifyInfo(notifyData);
        }
    }

    useEffect(() => {
        fetchNotifications();
    }, []);

    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on("event", (data: any) => {
            console.log(data);
        });

    }, [socket]);


    useEffect(() => {
        if (!socket) return;
        console.log("socket-effect=======>>")
        socket.emit("identify", 1); // must come before join

        const handler = (notification: any) => {
            console.log("🔔 NOTIFICATION RECEIVED", notification);

            setNotifyInfo((prev: any) => ({
                ...prev,
                notifications: [notification, ...prev.notifications],
                unreadCount: prev.unreadCount + 1,
            }));
        };

        socket.on("new_notification", handler);

        return () => {
            socket.off("new_notification", handler);
        };

    }, [socket]);

    const handleReadNotification = async (notification: any) => {
        try {
            const notificationId = notification.id;
            const res = await fetch(`/api/notifications/${notificationId}`, {
                method: "PATCH",
            })
            if (res.ok) {
                setNotifyInfo((prev: any) => {
                    const updated = { ...prev }
                    updated.notifications = updated.notifications.map((n: any) =>
                        n.id === notificationId ? { ...n, isRead: true } : n
                    )
                    updated.unreadCount = updated.notifications.filter((n: any) => !n.isRead).length
                    return updated
                });
                await handleOpenNotification(notification);

            }
        } catch (err) {
            console.error("Error marking notification read:", err)
        }
    }

    const handleOpenNotification = async (n: any) => {

        switch (n.type) {
            case "TASK":
                setSelectedTaskId(n.entityId);
                setViewTaskModalOpen(true);
                break;
            case "CHAT":
                setSelectedChatId(n.entityId);
                setViewChatModalOpen(true);
                break;
            case "COMMUNITY":
                setSelectedCommunityId(n.entityId);
                setViewCommunityModalOpen(true);
                break;
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const res = await fetch("/api/notifications/mark-all-read", {
                method: "POST",
            });
            const data = await res.json();
            if (data.success) {
                setNotifyInfo((prev: any) => ({
                    ...prev,
                    notifications: prev.notifications.map((n: any) => ({
                        ...n,
                        isRead: true,
                    })),
                    unreadCount: 0,
                }));
            }
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    return (
        <>
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
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="text-blue-600"
                                    onClick={() => {
                                        handleMarkAllRead();
                                    }}
                                >
                                    Mark all as read
                                </Button>
                            </div>
                            <DropdownMenuSeparator />
                            <div className="max-h-128 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                                {notifyInfo?.notifications?.length > 0 ? (
                                    notifyInfo?.notifications?.map((n: any) => (
                                        <DropdownMenuItem
                                            key={n.id}
                                            onClick={() => handleReadNotification(n)}
                                            className={`flex border-b items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 ${!n.isRead
                                                ? "bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60"
                                                : "bg-transparent hover:bg-muted/40"
                                                }`}
                                        >
                                            <Avatar className="h-auto w-8">
                                                {n.user?.avatar ? (
                                                    <AvatarImage src={n.user?.avatar} alt={n.user?.avatar || "User"} />
                                                ) : (
                                                    <AvatarFallback>{charIconGen(n.user?.fullName || "SS")}</AvatarFallback>
                                                )}
                                            </Avatar>

                                            <div className="flex-1">
                                                <p
                                                    className={`text-sm font-medium ${!n.isRead
                                                        ? "text-gray-900 dark:text-white"
                                                        : "text-gray-600 font-bold dark:text-gray-400"
                                                        }`}
                                                >
                                                    {n.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="size-3" /> {formatDistanceToNow(n.createdAt)} ago
                                                </p>
                                            </div>

                                            <ChevronRight
                                                className={`size-4 ${!n.isRead
                                                    ? "text-blue-500 dark:text-blue-400"
                                                    : "text-muted-foreground"
                                                    }`}
                                            />
                                        </DropdownMenuItem>

                                    ))
                                ) : (
                                    <p className="text-center text-sm text-muted-foreground py-20">
                                        No notifications found.
                                    </p>
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
                <button type="button" onClick={() => socket?.emit("event", "hello")}>
                    Send ping
                </button>
            </SidebarMenu>

            {viewTaskModalOpen && selectedTaskId && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewTaskDetailsModal
                        taskId={selectedTaskId}
                        open={viewTaskModalOpen}
                        onOpenChange={setViewTaskModalOpen}
                    />
                </Suspense>
            )}

            {viewChatModalOpen && selectedChatId && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewChatDetailsModal
                        chatId={selectedChatId}
                        open={viewChatModalOpen}
                        onOpenChange={setViewChatModalOpen}
                    />
                </Suspense>
            )}

            {viewCommunityModalOpen && selectedCommunityId && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewCommunityModal
                        open={viewCommunityModalOpen}
                        onOpenChange={setViewCommunityModalOpen}
                        communityId={selectedCommunityId}
                    />
                </Suspense>
            )}

        </>

    )
}
