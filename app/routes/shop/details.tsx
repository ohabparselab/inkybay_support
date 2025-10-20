import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Ellipsis, ExternalLink, Eye, PenBox, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CenterSpinner } from "~/components/ui/center-spinner";
import { ChatsTable } from "~/components/tables/chats-table";
import { lazy, Suspense, useEffect, useState } from "react";
import { ShopDetails } from "~/components/shop-details";
import { ShopHistory } from "~/components/shop-history";
import { useFetcher, useLocation } from "react-router";
import { Separator } from "~/components/ui/separator";
import { Spinner } from "~/components/ui/spinner";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";

const ViewChatDetailsModal = lazy(() => import("~/components/modals/view-chat-modal").then((m) => ({ default: m.ViewChatDetailsModal })));
const DeleteConfirmDialog = lazy(() => import("~/components/ui/confirm-dialog").then((m) => ({ default: m.DeleteConfirmDialog })));
const EditChatModal = lazy(() => import("~/components/modals/edit-chat-modal").then((m) => ({ default: m.EditChatModal })));
const AddChatModal = lazy(() => import("~/components/modals/add-chat-modal").then((m) => ({ default: m.AddChatModal })));

const ViewTaskDetailsModal = lazy(() => import("~/components/modals/view-task-modal").then((m) => ({ default: m.ViewTaskDetailsModal })));
const EditTaskModal = lazy(() => import("~/components/modals/edit-task-modal").then((m) => ({ default: m.EditTaskModal })));
const AddTaskModal = lazy(() => import("~/components/modals/add-task-modal").then((m) => ({ default: m.AddTaskModal })));

const ViewMarketingFunnelDetailsModal = lazy(() => import("~/components/modals/view-marketing-funnel-modal").then((m) => ({ default: m.ViewMarketingFunnelDetailsModal })));
const EditMarketingFunnelModal = lazy(() => import("~/components/modals/edit-marketing-funnel-modal").then((m) => ({ default: m.EditMarketingFunnelModal })));
const AddMarketingFunnelModal = lazy(() => import("~/components/modals/add-marketing-funnel-modal").then((m) => ({ default: m.AddMarketingFunnelModal })));

const ViewMeetingDetailsModal = lazy(() => import("~/components/modals/view-meeting-modal").then((m) => ({ default: m.ViewMeetingDetailsModal })));
const EditMeetingModal = lazy(() => import("~/components/modals/edit-meeting-modal").then((m) => ({ default: m.EditMeetingModal })));
const AddMeetingModal = lazy(() => import("~/components/modals/add-meeting-modal").then((m) => ({ default: m.AddMeetingModal })));

export const meta = () => [{ title: "Shop Details | InkyBay" }];

export default function ShopDetailsPage() {

    const location = useLocation();
    const shopUrl = new URLSearchParams(location.search).get("shopUrl") || "";
    const [clientId, setClientId] = useState<number>(0);

    const infoFetcher = useFetcher<{ status: number; data: any }>();
    const historyFetcher = useFetcher<{ status: number; data: any }>();
    const clientFetcher = useFetcher<{ status: number; data: any }>();
    const chatsFetcher = useFetcher<{ status: number; data: any }>();
    const tasksFetcher = useFetcher<{ status: number; data: any }>();
    const marketingFunnelsFetcher = useFetcher<{ status: number; data: any }>();
    const meetingsFetcher = useFetcher<{ status: number; data: any }>();

    const [chatModalOpen, setChatModalOpen] = useState(false);
    const [viewChatModal, setViewChatModal] = useState(false)
    const [editChatModal, setEditChatModal] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedChat, setSelectedChat] = useState<any>(null)

    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [viewTaskModalOpen, setViewTaskModalOpen] = useState(false);
    const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
    const [taskDeleteDialogOpen, setTaskDeleteDialogOpen] = useState(false);

    const [addMarketingModalOpen, setAddMarketingModalOpen] = useState(false);
    const [selectedMarketingFunnel, setSelectedMarketingFunnel] = useState<any | null>(null);
    const [viewMarketingFunnelModalOpen, setViewMarketingFunnelModalOpen] = useState(false);
    const [editMarketingFunnelModalOpen, setEditMarketingFunnelModalOpen] = useState(false);
    const [mFunnelDeleteDialogOpen, setMFunnelDeleteDialogOpen] = useState(false);

    const [meetingModalOpen, setMeetingModalOpen] = useState(false);
    const [viewMeetingModalOpen, setViewMeetingModalOpen] = useState(false);
    const [editMeetingModalOpen, setEditMeetingModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
    const [meetingDeleteDialogOpen, setMeetingDeleteDialogOpen] = useState(false);

    useEffect(() => {
        if (!shopUrl) return;

        const formData = new FormData();
        formData.set("shop", shopUrl);

        infoFetcher.submit(formData, { method: "post", action: "/api/inkybay/info" });
        historyFetcher.submit(formData, { method: "post", action: "/api/inkybay/history" });
        meetingsFetcher.submit(formData, { method: "post", action: "/api/meetings/get-meetings-by-shop" });
    }, [shopUrl]);


    useEffect(() => {
        // Only run when infoFetcher finishes
        if (infoFetcher.state === "idle" && infoFetcher.data?.data) {
            const shop = infoFetcher.data.data;
            const shopInfoForm = new FormData();

            shopInfoForm.set("shopName", shop.shopify?.shop_name);
            shopInfoForm.set("shopEmail", shop.shopify?.client_email);
            shopInfoForm.set("shopUrl", shop.url);

            clientFetcher.submit(shopInfoForm, { method: "post", action: "/api/clients" });
        }
    }, [infoFetcher.state, infoFetcher.data]);

    useEffect(() => {
        // Only run when
        if (clientFetcher.state === "idle" && clientFetcher.data?.data) {
            const client = clientFetcher.data.data;
            setClientId(client.id);
            const cf = new FormData();
            cf.set("clientId", client.id);
            chatsFetcher.submit(cf, { method: "post", action: "/api/chats/get-chats-by-client-id" });
            tasksFetcher.submit(cf, { method: "post", action: "/api/tasks/get-tasks-by-client-id" });
            marketingFunnelsFetcher.submit(cf, { method: "post", action: "/api/marketing-funnels/get-marketing-funnels-by-client-id" });
        }
    }, [clientFetcher.state, clientFetcher.data]);

    const loadingInfo = infoFetcher.state !== "idle";
    const loadingHistory = historyFetcher.state !== "idle";
    const shop = infoFetcher.data?.data || {};
    const historyData = historyFetcher.data?.data || {};
    const inkybay = shop.inkybay || {};
    const shopify = shop.shopify || {};
    const history = historyData.history || [];
    const totalHistory = history.length;

    const loadingChats = chatsFetcher.state !== "idle";
    const chats = chatsFetcher.data?.data || [];

    const loadingTasks = tasksFetcher.state !== "idle";
    const tasks = tasksFetcher.data?.data || [];

    const loadingMarketingFunnels = marketingFunnelsFetcher.state !== "idle";
    const marketingFunnels = marketingFunnelsFetcher.data?.data || [];

    const loadingMeetings = meetingsFetcher.state !== "idle";
    const meetings = meetingsFetcher.data?.data || [];

    const refreshPage = () => {
        if (!shopUrl || !clientId) return;

        // Re-run chats and tasks fetchers using existing clientId
        const formData = new FormData();
        formData.set("clientId", clientId.toString());
        chatsFetcher.submit(formData, { method: "post", action: "/api/chats/get-chats-by-client-id" });
        tasksFetcher.submit(formData, { method: "post", action: "/api/tasks/get-tasks-by-client-id" });
        marketingFunnelsFetcher.submit(formData, { method: "post", action: "/api/marketing-funnels/get-marketing-funnels-by-client-id" });

        const shopFormData = new FormData();
        shopFormData.set("shop", shopUrl);
        meetingsFetcher.submit(shopFormData, { method: "post", action: "/api/meetings/get-meetings-by-shop" });
    };

    const handleChatDelete = async () => {

        if (!selectedChat) return;

        try {
            const res = await fetch(`/api/chats/${selectedChat.id}`, {
                method: "DELETE",
            });
            if (!res.ok) toast.error("Failed to delete chat");
            toast.success("Chat deleted successfully.");
            refreshPage();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete chat.");
        }
    }

    const handleTaskDelete = async () => {
        if (!selectedTask) return;

        try {
            const res = await fetch(`/api/tasks/${selectedTask.id}`, {
                method: "DELETE",
            });
            if (!res.ok) toast.error("Failed to delete task");
            toast.success("Task deleted successfully.");
            refreshPage();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete task.");
        }
    }

    const handleMFunnelDelete = async () => {
        if (!selectedMarketingFunnel) return;

        try {
            const res = await fetch(`/api/marketing-funnels/${selectedMarketingFunnel.id}`, {
                method: "DELETE",
            });
            if (!res.ok) toast.error("Failed to delete marketing funnel.");
            toast.success("Marketing funnel deleted successfully.");
            refreshPage();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete marketing funnel.");
        }
    }

    const handleMeetingDelete = async () => {
        if (!selectedMeeting) return;

        try {
            const res = await fetch(`/api/meetings/${selectedMeeting.id}`, {
                method: "DELETE",
            });
            if (!res.ok) toast.error("Failed to delete meeting");
            toast.success("Meeting deleted successfully.");
            refreshPage();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete meeting.");
        }
    }

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-2">Shop Details</h1>
            <Card className="shadow-md rounded-xl">
                {loadingInfo ? (
                    <div className="flex justify-center py-3">
                        <Spinner />
                    </div>
                ) : (
                    <CardHeader>
                        <div className="flex flex-row w-full">
                            <div className="w-1/2">
                                <CardTitle className="text-xl">{shopify['shop_name']}</CardTitle>
                                <a
                                    href={`https://${shop.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex text-blue-600 items-center gap-1 hover:underline"
                                >
                                    {shop.url}
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                            <div className="w-1/2 flex flex-row justify-center items-center gap-3">
                                <Button onClick={() => { setClientId(clientId); setChatModalOpen(true); }}>
                                    <Plus /> Add Chat
                                </Button>
                                <Button onClick={() => { setClientId(clientId); setTaskModalOpen(true); }}>
                                    <Plus /> Add Task
                                </Button>
                                <Button onClick={() => { setClientId(clientId); setAddMarketingModalOpen(true); }}>
                                    <Plus /> Add Marketing Funnel
                                </Button>
                                <Button onClick={() => { setClientId(clientId); setMeetingModalOpen(true); }}>
                                    <Plus /> Add Meeting
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                )}
                <Separator />
                <CardContent className="space-y-5">
                    {/* InkyBay Details */}
                    <section>
                        <h2 className="text-lg font-semibold mb-3">Inkybay Details</h2>
                        {loadingInfo ? (
                            <div className="flex justify-center py-10">
                                <Spinner />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-y-1 text-sm text-gray-700">
                                <p>
                                    <span className="font-bold">Version:</span> {inkybay.version ? inkybay.version : "N/A"}
                                </p>
                                <p>
                                    <span className="font-bold">Plan:</span> {inkybay.plan}
                                </p>
                                <p>
                                    <span className="font-bold">Active:</span>{" "}
                                    {inkybay.active ? "Yes" : "No"}
                                </p>
                                <p>
                                    <span className="font-bold">Trial Days:</span>{" "}
                                    {inkybay.trial_days}
                                </p>
                                <p>
                                    <span className="font-bold">Charge Status:</span>{" "}
                                    {inkybay.charge_status ? "Charged" : "Not Charged"}
                                </p>
                                <p>
                                    <span className="font-bold">Started At:</span>{" "}
                                    {new Date(inkybay.start_at * 1000).toLocaleString()}
                                </p>
                                <p>
                                    <span className="font-bold">Promo ID:</span>{" "}
                                    {inkybay.promo_id}
                                </p>
                            </div>
                        )}
                    </section>
                    <Separator />

                    {/* Shopify Details */}
                    <ShopDetails shopUrl={shopUrl} />
                    <Separator />

                    {/* Tabs Section */}
                    <section className="border p-3 rounded">
                        <Tabs defaultValue="history" className="w-full">
                            <TabsList className="w-full flex border-b">
                                <TabsTrigger
                                    value="history"
                                    className="flex-1 text-center px-6 py-4 text-lg font-medium"
                                >
                                    History {loadingHistory ? (
                                        <Spinner />
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className="bg-blue-500 text-white dark:bg-blue-600"
                                        >{totalHistory}</Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="chats"
                                    className="flex-1 text-center px-6 py-4 text-lg font-medium"
                                >
                                    Chats {loadingChats ? (
                                        <Spinner />
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className="bg-blue-500 text-white dark:bg-blue-600"
                                        >{chats.length}</Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="tasks"
                                    className="flex-1 text-center px-6 py-4 text-lg font-medium"
                                >
                                    Tasks
                                    {loadingTasks ? (
                                        <Spinner />
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className="bg-blue-500 text-white dark:bg-blue-600"
                                        >{tasks.length}</Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="marketingFunnels"
                                    className="flex-1 text-center px-6 py-4 text-lg font-medium"
                                >
                                    Marketing Funnels
                                    {loadingMarketingFunnels ? (
                                        <Spinner />
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className="bg-blue-500 text-white dark:bg-blue-600"
                                        >{marketingFunnels.length}</Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="meetings"
                                    className="flex-1 text-center px-6 py-4 text-lg font-medium"
                                >
                                    Meetings
                                    {loadingMeetings ? (
                                        <Spinner />
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className="bg-blue-500 text-white dark:bg-blue-600"
                                        >{meetings.length}</Badge>
                                    )}
                                </TabsTrigger>

                            </TabsList>

                            {/* History Tab */}
                            <TabsContent value="history" className="mt-3">
                                <ShopHistory shopUrl={shopUrl} />
                            </TabsContent>

                            {/* chats Tabs */}
                            <TabsContent value="chats" className="mt-4 text-gray-500 text-sm">
                                {loadingChats ? (
                                    <div className="flex justify-center py-5">
                                        <Spinner />
                                    </div>
                                ) : chats.length > 0 ? (
                                    <div className="w-full space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="relative w-full sm:w-64">
                                                <Button
                                                    onClick={() => {
                                                        setClientId(clientId);
                                                        setChatModalOpen(true);
                                                    }}
                                                >
                                                    <Plus /> Add Chat
                                                </Button>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Total: {chats.length}
                                            </div>
                                        </div>
                                        <ChatsTable
                                            chats={chats}
                                            onView={(chat) => {
                                                setSelectedChat(chat);
                                                setViewChatModal(true);
                                            }}
                                            onAdd={(chat) => {
                                                setClientId(chat.clientId);
                                                setChatModalOpen(true);
                                            }}
                                            onEdit={(chat) => {
                                                setSelectedChat(chat);
                                                setEditChatModal(true);
                                            }}
                                            onDelete={(chat) => {
                                                setSelectedChat(chat);
                                                setDeleteDialogOpen(true);
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-center py-15">
                                        <span>
                                            No chats available
                                        </span>
                                        <Button
                                            className="ml-5"
                                            onClick={() => {
                                                setChatModalOpen(true);
                                            }}
                                        >
                                            <Plus /> Add Chat
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                            {/* task Tabs */}
                            <TabsContent value="tasks" className="mt-4 text-gray-500 text-sm">
                                {loadingTasks ? (
                                    <div className="flex justify-center py-5">
                                        <Spinner />
                                    </div>
                                ) : tasks.length > 0 ? (
                                    <div className="w-full space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="relative w-full sm:w-64">
                                                <Button
                                                    onClick={() => {
                                                        setClientId(clientId);
                                                        setTaskModalOpen(true);
                                                    }}
                                                >
                                                    <Plus /> Add Task
                                                </Button>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Total: {tasks.length}
                                            </div>
                                        </div>
                                        <div className="rounded-md border bg-card shadow-sm">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>ID</TableHead>
                                                        <TableHead>Shop Name</TableHead>
                                                        <TableHead>Task Details</TableHead>
                                                        <TableHead>Client</TableHead>
                                                        <TableHead>Provided By</TableHead>
                                                        <TableHead>Solved By</TableHead>
                                                        <TableHead>Store Access</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Task Added</TableHead>
                                                        <TableHead>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {tasks.length > 0 ? (
                                                        tasks.map((task: any, idx: number) => (
                                                            <TableRow key={task.id}>
                                                                <TableCell>{idx + 1}</TableCell>
                                                                <TableCell>{task.client.shopName}</TableCell>
                                                                <TableCell className="max-w-[20px] truncate">{task.taskDetails}</TableCell>
                                                                <TableCell>{task.client?.shopName ?? "—"}</TableCell>
                                                                <TableCell>{task.providedByUser?.fullName ?? "—"}</TableCell>
                                                                <TableCell>{task.solvedByUser?.fullName ?? "—"}</TableCell>
                                                                <TableCell>{task.storeAccess == 'given' ? "Given" : ' Not Necessary'}</TableCell>
                                                                <TableCell>{task.status?.name ?? "—"}</TableCell>
                                                                <TableCell>
                                                                    {task.taskAddedDate
                                                                        ? new Date(task.taskAddedDate).toLocaleDateString()
                                                                        : "—"}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon">
                                                                                <Ellipsis />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem onClick={() => {
                                                                                setSelectedTask(task);
                                                                                setViewTaskModalOpen(true);
                                                                            }}>
                                                                                <Eye /> View Details
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() => {
                                                                                    setClientId(task.clientId);
                                                                                    setTaskModalOpen(true);
                                                                                }}
                                                                            >
                                                                                <Plus /> Add Task
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() => {
                                                                                    setSelectedTask(task);
                                                                                    setEditTaskModalOpen(true);
                                                                                }}
                                                                            >
                                                                                <PenBox /> Edit Task
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem
                                                                                variant="destructive"
                                                                                onClick={() => {
                                                                                    setSelectedTask(task);
                                                                                    setTaskDeleteDialogOpen(true);
                                                                                }}
                                                                            >
                                                                                <Trash2 /> Delete
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                                                                No tasks available
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-center py-15">
                                        <span>
                                            No tasks available
                                        </span>
                                        <Button
                                            className="ml-5"
                                            onClick={() => {
                                                setClientId(clientId);
                                                setTaskModalOpen(true);
                                            }}
                                        >
                                            <Plus /> Add Task
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="marketingFunnels" className="mt-4 text-gray-500 text-sm">
                                {loadingMarketingFunnels ? (
                                    <div className="flex justify-center py-5">
                                        <Spinner />
                                    </div>
                                ) : marketingFunnels.length > 0 ? (
                                    <div className="w-full space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="relative w-full sm:w-64">
                                                <Button
                                                    onClick={() => {
                                                        setClientId(clientId);
                                                        setAddMarketingModalOpen(true);
                                                    }}
                                                >
                                                    <Plus /> Add Marketing Funnel
                                                </Button>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Total: {tasks.length}
                                            </div>
                                        </div>
                                        {/* Table */}
                                        <div className="rounded-md border bg-card shadow-sm">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>ID</TableHead>
                                                        <TableHead>Shop Name</TableHead>
                                                        <TableHead>Install Phase</TableHead>
                                                        <TableHead>Type of Products</TableHead>
                                                        <TableHead>Client Success</TableHead>
                                                        <TableHead>Customization Type</TableHead>
                                                        <TableHead>Initial Feedback</TableHead>
                                                        <TableHead>Created At</TableHead>
                                                        <TableHead>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {marketingFunnels.length > 0 ? (
                                                        marketingFunnels?.map((funnel: any, idx: number) => (
                                                            <TableRow key={funnel.id}>
                                                                <TableCell>{idx + 1}</TableCell>
                                                                <TableCell>{funnel.client.shopName}</TableCell>
                                                                <TableCell>{funnel.installPhase}</TableCell>
                                                                <TableCell>{funnel.typeOfProducts ?? 'N/A'}</TableCell>
                                                                <TableCell>{funnel.clientSuccessStatus == 'yes' ? "Yes" : 'No'}</TableCell>
                                                                <TableCell>{funnel.customizationType == '' ? 'N/A' : funnel.customizationType}</TableCell>
                                                                <TableCell>{funnel.initialFeedback == '' ? 'N/A' : funnel.initialFeedback}</TableCell>
                                                                <TableCell>{new Date(funnel.createdAt).toLocaleDateString()}</TableCell>
                                                                <TableCell>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon">
                                                                                <Ellipsis />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem onClick={() => {
                                                                                setSelectedMarketingFunnel(funnel);
                                                                                setViewMarketingFunnelModalOpen(true);
                                                                            }}>
                                                                                <Eye /> View Details
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() => {
                                                                                    setClientId(funnel.clientId);
                                                                                    setAddMarketingModalOpen(true);
                                                                                }}
                                                                            >
                                                                                <Plus /> Add Marketing Funnel
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() => {
                                                                                    setSelectedMarketingFunnel(funnel);
                                                                                    setEditMarketingFunnelModalOpen(true);
                                                                                }}
                                                                            >
                                                                                <PenBox /> Edit Marketing Funnel
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem
                                                                                variant="destructive"
                                                                                onClick={() => {
                                                                                    setSelectedMarketingFunnel(funnel);
                                                                                    setMFunnelDeleteDialogOpen(true);
                                                                                }}
                                                                            >
                                                                                <Trash2 /> Delete
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                                                                No marketing funnels found.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-center py-15">
                                        <span>
                                            No marketing funnels available
                                        </span>
                                        <Button
                                            className="ml-5"
                                            onClick={() => {
                                                setClientId(clientId);
                                                setAddMarketingModalOpen(true);
                                            }}
                                        >
                                            <Plus /> Add Marketing Funnel
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="meetings" className="mt-4 text-gray-500 text-sm">
                                {loadingMeetings ? (
                                    <div className="flex justify-center py-5">
                                        <Spinner />
                                    </div>
                                ) : meetings.length > 0 ? (
                                    <div className="w-full space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="relative w-full sm:w-64">
                                                <Button
                                                    onClick={() => {
                                                        setClientId(clientId);
                                                        setMeetingModalOpen(true);
                                                    }}
                                                >
                                                    <Plus /> Add Meeting
                                                </Button>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Total: {meetings.length}
                                            </div>
                                        </div>
                                        <div className="rounded-md border bg-card shadow-sm">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>ID</TableHead>
                                                        <TableHead>Store URL</TableHead>
                                                        <TableHead>Agent</TableHead>
                                                        <TableHead>Joining Status</TableHead>
                                                        <TableHead>Meeting Date</TableHead>
                                                        <TableHead>External?</TableHead>
                                                        <TableHead>Review Asked?</TableHead>
                                                        <TableHead>Review Given?</TableHead>
                                                        <TableHead>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {meetings.length > 0 ? (
                                                        meetings.map((meeting: any, idx: number) => (
                                                            <TableRow key={meeting.id}>
                                                                <TableCell>{idx + 1}</TableCell>
                                                                <TableCell className="max-w-xs truncate">{meeting.storeUrl}</TableCell>
                                                                <TableCell>{meeting.user?.fullName ?? "—"}</TableCell>
                                                                <TableCell className="flex flex-wrap gap-1">
                                                                    {meeting.joiningStatus ? 'Yes' : 'No'}
                                                                </TableCell>
                                                                <TableCell>{new Date(meeting.meetingDateTime).toLocaleString()}</TableCell>
                                                                <TableCell>{meeting.isExternalMeeting ? "Yes" : "No"}</TableCell>
                                                                <TableCell>{meeting.reviewAsked ? "Yes" : "No"}</TableCell>
                                                                <TableCell>{meeting.reviewGiven ? "Yes" : "No"}</TableCell>
                                                                <TableCell>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon">
                                                                                <Ellipsis />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem onClick={() => {
                                                                                setSelectedMeeting(meeting);
                                                                                setViewMeetingModalOpen(true);
                                                                            }}>
                                                                                <Eye /> View Details
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() => {
                                                                                    setSelectedMeeting(meeting);
                                                                                    setEditMeetingModalOpen(true);
                                                                                }}
                                                                            >
                                                                                <PenBox /> Edit Task
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem
                                                                                variant="destructive"
                                                                                onClick={() => {
                                                                                    setSelectedMeeting(meeting);
                                                                                    setMeetingDeleteDialogOpen(true);
                                                                                }}
                                                                            >
                                                                                <Trash2 /> Delete
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                                                                No meetings found.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-center py-15">
                                        <span>
                                            No meetings available
                                        </span>
                                        <Button
                                            className="ml-5"
                                            onClick={() => {
                                                setMeetingModalOpen(true);
                                            }}
                                        >
                                            <Plus /> Add Meeting
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </section>
                </CardContent>
            </Card>

            {/* =========chats modals============= */}
            {/* Modals */}
            {chatModalOpen && clientId && (
                <Suspense fallback={<CenterSpinner />}>
                    <AddChatModal
                        clientId={clientId}
                        open={chatModalOpen}
                        onOpenChange={setChatModalOpen}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}
            {viewChatModal && selectedChat && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewChatDetailsModal chat={selectedChat} open={viewChatModal} onOpenChange={setViewChatModal} />
                </Suspense>
            )}
            {editChatModal && selectedChat && (
                <Suspense fallback={<CenterSpinner />}>
                    <EditChatModal
                        chat={selectedChat}
                        open={editChatModal}
                        onOpenChange={setEditChatModal}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}

            {deleteDialogOpen && selectedChat && (
                <Suspense fallback={<CenterSpinner />}>
                    <DeleteConfirmDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        title="Delete Chat?"
                        description="Are you sure you want to permanently delete this chat? This action cannot be undone."
                        onConfirm={async () => handleChatDelete()}
                    />
                </Suspense>
            )}

            {/* =========tasks modals============= */}
            {/* Add Task Modal */}
            {taskModalOpen && clientId && (
                <Suspense fallback={<CenterSpinner />}>
                    <AddTaskModal clientId={clientId} open={taskModalOpen} onOpenChange={setTaskModalOpen} />
                </Suspense>
            )}

            {/* View Task Modal */}
            {viewTaskModalOpen && selectedTask && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewTaskDetailsModal
                        task={selectedTask}
                        open={viewTaskModalOpen}
                        onOpenChange={setViewTaskModalOpen}
                    />
                </Suspense>
            )}
            {/* Edit Task Modal */}
            {editTaskModalOpen && selectedTask && (
                <Suspense fallback={<CenterSpinner />}>
                    <EditTaskModal
                        task={selectedTask}
                        open={editTaskModalOpen}
                        onOpenChange={setEditTaskModalOpen}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}

            {taskDeleteDialogOpen && selectedTask && (
                <Suspense fallback={<CenterSpinner />}>
                    <DeleteConfirmDialog
                        open={taskDeleteDialogOpen}
                        onOpenChange={setTaskDeleteDialogOpen}
                        title="Delete Task?"
                        description="Are you sure you want to permanently delete this chat? This action cannot be undone."
                        onConfirm={async () => handleTaskDelete()}
                    />
                </Suspense>
            )}

            {/* =========marketingFunnels modals============= */}

            {/* Add Marketing Funnel Modal */}
            {addMarketingModalOpen && clientId && (
                <Suspense fallback={<CenterSpinner />}>
                    <AddMarketingFunnelModal
                        clientId={clientId}
                        open={addMarketingModalOpen}
                        onOpenChange={setAddMarketingModalOpen}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}

            {/* View Marketing Funnel Modal */}
            {viewMarketingFunnelModalOpen && selectedMarketingFunnel && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewMarketingFunnelDetailsModal
                        funnel={selectedMarketingFunnel}
                        open={viewMarketingFunnelModalOpen}
                        onOpenChange={setViewMarketingFunnelModalOpen}
                    />
                </Suspense>
            )}

            {/* Edit Marketing Funnel Modal */}
            {editMarketingFunnelModalOpen && selectedMarketingFunnel && (
                <Suspense fallback={<CenterSpinner />}>
                    <EditMarketingFunnelModal
                        funnel={selectedMarketingFunnel}
                        open={editMarketingFunnelModalOpen}
                        onOpenChange={setEditMarketingFunnelModalOpen}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}
            {mFunnelDeleteDialogOpen && selectedMarketingFunnel && (
                <Suspense fallback={<CenterSpinner />}>
                    <DeleteConfirmDialog
                        open={mFunnelDeleteDialogOpen}
                        onOpenChange={setMFunnelDeleteDialogOpen}
                        title="Delete Marketing Funnel?"
                        description="Are you sure you want to permanently delete this chat? This action cannot be undone."
                        onConfirm={async () => handleMFunnelDelete()}
                    />
                </Suspense>
            )}

            {/* =========meetings modals============= */}
            {/* Add Meeting Modal */}
            {meetingModalOpen && (
                <Suspense fallback={<CenterSpinner />}>
                    <AddMeetingModal
                        open={meetingModalOpen}
                        onOpenChange={setMeetingModalOpen}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}
            {/* View Meeting Modal */}
            {viewMeetingModalOpen && selectedMeeting && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewMeetingDetailsModal
                        meeting={selectedMeeting}
                        open={viewMeetingModalOpen}
                        onOpenChange={setViewMeetingModalOpen}
                    />
                </Suspense>
            )}

            {/* Edit Meeting Modal */}
            {editMeetingModalOpen && selectedMeeting && (
                <Suspense fallback={<CenterSpinner />}>
                    <EditMeetingModal
                        meeting={selectedMeeting}
                        open={editMeetingModalOpen}
                        onOpenChange={setEditMeetingModalOpen}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}
            {meetingDeleteDialogOpen && selectedMeeting && (
                <Suspense fallback={<CenterSpinner />}>
                    <DeleteConfirmDialog
                        open={meetingDeleteDialogOpen}
                        onOpenChange={setMeetingDeleteDialogOpen}
                        title="Delete Meeting?"
                        description="Are you sure you want to permanently delete this chat? This action cannot be undone."
                        onConfirm={async () => handleMeetingDelete()}
                    />
                </Suspense>
            )}

        </div>
    );
}
