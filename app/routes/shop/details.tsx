import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShopDetails } from "~/components/shop-details";
import { useFetcher, useLocation } from "react-router";
import { Separator } from "~/components/ui/separator";
import { Spinner } from "~/components/ui/spinner";
import { Badge } from "~/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { ShopHistory } from "~/components/shop-history";

export default function ShopDetailsPage() {

    const location = useLocation();
    const shopUrl = new URLSearchParams(location.search).get("shopUrl") || "";

    const infoFetcher = useFetcher<{ status: number; data: any }>();
    const historyFetcher = useFetcher<{ status: number; data: any }>();
    const chatsFetcher = useFetcher<{ status: number; data: any }>();

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

            chatsFetcher.submit(fd3, { method: "post", action: "/api/chats/get-chats-by-shop" });
        }
    }, [infoFetcher.state, infoFetcher.data]);

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
                    <ShopDetails shopUrl={shopUrl}/>
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
                                    value="meetings"
                                    className="flex-1 text-center px-6 py-4 text-lg font-medium"
                                >
                                    Meetings
                                    <Badge
                                        variant="secondary"
                                        className="bg-blue-500 text-white dark:bg-blue-600"
                                    >{23}</Badge>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="meetings"
                                    className="flex-1 text-center px-6 py-4 text-lg font-medium"
                                >
                                    Marketing Funnels
                                    <Badge
                                        variant="secondary"
                                        className="bg-blue-500 text-white dark:bg-blue-600"
                                    >{88}</Badge>
                                </TabsTrigger>
                            </TabsList>

                            {/* History Tab */}
                            <TabsContent value="history" className="mt-3">
                               <ShopHistory shopUrl={shopUrl}/>
                            </TabsContent>

                            {/* Placeholder Tabs */}
                            <TabsContent value="chats" className="mt-4 text-gray-500 text-sm">
                                {loadingChats ? (
                                    <div className="flex justify-center py-5">
                                        <Spinner />
                                    </div>
                                ) : chats.length > 0 ? (
                                    <div className="space-y-2">
                                        {chats.map((chat: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="p-3 border rounded-md hover:bg-gray-50 transition"
                                            >
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {chat.clientQuery}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Handled By: {chat.handleByUser?.name || "N/A"}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(chat.createdAt).toLocaleString()}
                                                </p>
                                                {chat.reviewText && (
                                                    <p className="text-xs mt-1 text-gray-600 italic">
                                                        “{chat.reviewText}”
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-center py-15">No chats available</div>
                                )}
                            </TabsContent>
                            <TabsContent value="tasks" className="mt-4 text-gray-500 text-sm">
                                <div className="text-gray-400 text-center py-4">
                                    No tasks available
                                </div>
                            </TabsContent>
                            <TabsContent
                                value="meetings"
                                className="mt-4 text-gray-500 text-sm"
                            >
                                <div className="text-gray-400 text-center py-4">
                                    No meetings available
                                </div>
                            </TabsContent>
                        </Tabs>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
