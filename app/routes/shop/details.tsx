import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFetcher, useLocation, useNavigate } from "react-router";
import { CenterSpinner } from "~/components/ui/center-spinner";
import { ChatsTable } from "~/components/tables/chats-table";
import { lazy, Suspense, useEffect, useState } from "react";
import { ShopDetails } from "~/components/shop-details";
import { ShopHistory } from "~/components/shop-history";
import { Separator } from "~/components/ui/separator";
import { Spinner } from "~/components/ui/spinner";
import { ExternalLink, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";

const ViewChatDetailsModal = lazy(() => import("~/components/modals/view-chat-modal").then((m) => ({ default: m.ViewChatDetailsModal })));
const DeleteConfirmDialog = lazy(() => import("~/components/ui/confirm-dialog").then((m) => ({ default: m.DeleteConfirmDialog })));
const EditChatModal = lazy(() => import("~/components/modals/edit-chat-modal").then((m) => ({ default: m.EditChatModal })));
const AddChatModal = lazy(() => import("~/components/modals/add-chat-modal").then((m) => ({ default: m.AddChatModal })));

export default function ShopDetailsPage() {

    const location = useLocation();
    const navigate = useNavigate();
    const shopUrl = new URLSearchParams(location.search).get("shopUrl") || "";
    const [clientId, setClientId] = useState<number>(0);

    const infoFetcher = useFetcher<{ status: number; data: any }>();
    const historyFetcher = useFetcher<{ status: number; data: any }>();
    const clientFetcher = useFetcher<{ status: number; data: any }>();
    const chatsFetcher = useFetcher<{ status: number; data: any }>();
    const [chatModalOpen, setChatModalOpen] = useState(false);
    const [viewChatModal, setViewChatModal] = useState(false)
    const [editChatModal, setEditChatModal] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedChat, setSelectedChat] = useState<any>(null)

    useEffect(() => {
        if (!shopUrl) return;

        const fd1 = new FormData();
        fd1.set("shop", shopUrl);
        infoFetcher.submit(fd1, { method: "post", action: "/api/inkybay/info" });

        const fd2 = new FormData();
        fd2.set("shop", shopUrl);
        historyFetcher.submit(fd2, { method: "post", action: "/api/inkybay/history" });
    }, [shopUrl]);

    useEffect(() => {
        // Only run when infoFetcher finishes
        if (infoFetcher.state === "idle" && infoFetcher.data?.data) {
            const shop = infoFetcher.data.data;
            const fd3 = new FormData();

            fd3.set("shopName", shop.shopify?.shop_name);
            fd3.set("shopEmail", shop.shopify?.client_email);
            fd3.set("shopUrl", shop.url);

            clientFetcher.submit(fd3, { method: "post", action: "/api/clients" });
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

    const refreshPage = () => { navigate(0); };

    const handleChatDelete = async () => {

        if (!selectedChat) return;

        try {
            const res = await fetch(`/api/chats/${selectedChat.id}`, {
                method: "DELETE",
            });
            if (!res.ok) toast.error("Failed to delete chat");
            toast.success("Chat deleted successfully.");
            navigate(0);
        } catch (err: any) {
            toast.error(err.message || "Failed to delete chat.");
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
                        <CardTitle className="text-xl">
                            {shopify['shop_name']}
                        </CardTitle>
                        <a
                            href={`https://${shop.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex text-blue-600 items-center gap-1 hover:underline"
                        >
                            {shop.url}
                            <ExternalLink className="w-4 h-4" />
                        </a>
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
                                    <Badge
                                        variant="secondary"
                                        className="bg-blue-500 text-white dark:bg-blue-600"
                                    >{11}</Badge>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="marketingFunnels"
                                    className="flex-1 text-center px-6 py-4 text-lg font-medium"
                                >
                                    Marketing Funnels
                                    <Badge
                                        variant="secondary"
                                        className="bg-blue-500 text-white dark:bg-blue-600"
                                    >{88}</Badge>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="meetings"
                                    className="flex-1 text-center px-6 py-4 text-lg font-medium"
                                >
                                    Meetings
                                    <Badge
                                        variant="secondary"
                                        className="bg-blue-500 text-white dark:bg-blue-600"
                                    >{23}</Badge>
                                </TabsTrigger>

                            </TabsList>

                            {/* History Tab */}
                            <TabsContent value="history" className="mt-3">
                                <ShopHistory shopUrl={shopUrl} />
                            </TabsContent>

                            {/* Placeholder Tabs */}
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
                                                        setChatModalOpen(true)
                                                    }}
                                                >
                                                    <Plus /> Add New Chat
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
                                                setChatModalOpen(true)
                                            }}
                                        >
                                            <Plus /> Add New Chat
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="tasks" className="mt-4 text-gray-500 text-sm">
                                <div className="text-gray-400 text-center py-15">
                                    No tasks available
                                </div>
                            </TabsContent>
                            <TabsContent
                                value="marketingFunnels"
                                className="mt-4 text-gray-500 text-sm"
                            >
                                <div className="text-gray-400 text-center py-15">
                                    No marketing funnels available
                                </div>
                            </TabsContent>
                            <TabsContent
                                value="meetings"
                                className="mt-4 text-gray-500 text-sm"
                            >
                                <div className="text-gray-400 text-center py-15">
                                    No meetings available
                                </div>
                            </TabsContent>
                        </Tabs>
                    </section>
                </CardContent>
            </Card>

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
        </div>
    );
}
