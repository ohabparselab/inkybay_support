import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFetcher, useLocation } from "react-router";
import { Spinner } from "~/components/ui/spinner";
import { useEffect } from "react";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { ExternalLink } from "lucide-react";

export default function ShopDetailsPage() {

    const location = useLocation();
    const shopUrl = new URLSearchParams(location.search).get("shopUrl") || "";

    const infoFetcher = useFetcher<{ status: number; data: any }>();
    const historyFetcher = useFetcher<{ status: number; data: any }>();

    useEffect(() => {
        if (!shopUrl) return;

        const fd1 = new FormData();
        fd1.set("shop", shopUrl);
        infoFetcher.submit(fd1, { method: "post", action: "/api/inkybay/info" });

        const fd2 = new FormData();
        fd2.set("shop", shopUrl);
        historyFetcher.submit(fd2, { method: "post", action: "/api/inkybay/history" });
    }, [shopUrl]);

    const loadingInfo = infoFetcher.state !== "idle";
    const loadingHistory = historyFetcher.state !== "idle";

    const shop = infoFetcher.data?.data || {};
    const historyData = historyFetcher.data?.data || {};

    const inkybay = shop.inkybay || {};
    const shopify = shop.shopify || {};
    const history = historyData.history || [];
    const totalHistory = history.length;

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
                        <CardTitle className="text-xl text-blue-700">
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
                    <section>
                        <h2 className="text-lg font-semibold mb-3">Shopify Details</h2>
                        {loadingInfo ? (
                            <div className="flex justify-center py-10">
                                <Spinner />
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-y-1 text-sm text-gray-700">
                                <p>
                                    <span className="font-bold">Shop ID:</span>{" "}
                                    {shopify.id}
                                </p>
                                <p>
                                    <span className="font-bold">Shop Name:</span>{" "}
                                    {shopify['shop_name']}
                                </p>
                                <p>
                                    <span className="font-bold">Plan:</span> {shopify['plan']}
                                </p>
                                <p>
                                    <span className="font-bold">Free User:</span> {shopify.free_user ? 'Yes' : 'No'}
                                </p>
                                <p>
                                    <span className="font-bold">Frozen:</span> {shopify['frozen'] ? 'Yes' : 'No'}
                                </p>
                                <p>
                                    <span className="font-bold">Client Name:</span>{" "}
                                    {shopify.client_name}
                                </p>
                                <p>
                                    <span className="font-bold">Email:</span>{" "}
                                    {shopify.client_email}
                                </p>
                                <p>
                                    <span className="font-bold">Phone:</span>{" "}
                                    {shopify.client_phone}
                                </p>
                                <p>
                                    <span className="font-bold">Country:</span>{" "}
                                    {shopify.client_country_name}
                                </p>
                                <p>
                                    <span className="font-bold">Country  Code:</span>{" "}
                                    {shopify.client_country_code}
                                </p>
                                <p>
                                    <span className="font-bold">Address:</span>{" "}
                                    {`${shopify.client_address1} ${shopify.client_address2}`}
                                </p>
                                <p>
                                    <span className="font-bold">Zip Code:</span>{" "}
                                    {shopify.client_zip}
                                </p>
                                <p>
                                    <span className="font-bold">Province:</span>{" "}
                                    {shopify.client_province}
                                </p>
                                <p>
                                    <span className="font-bold">City:</span>{" "}
                                    {shopify.client_city}
                                </p>
                                <p>
                                    <span className="font-bold">Currency:</span>{" "}
                                    {shopify.client_currency}
                                </p>
                            </div>
                        )}

                    </section>
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
                                    Chats
                                </TabsTrigger>
                                <TabsTrigger
                                    value="tasks"
                                    className="flex-1 text-center px-6 py-4 text-lg font-medium"
                                >
                                    Tasks
                                </TabsTrigger>
                                <TabsTrigger
                                    value="meetings"
                                    className="flex-1 text-center px-6 py-4 text-lg font-medium"
                                >
                                    Meetings
                                </TabsTrigger>
                            </TabsList>


                            {/* History Tab */}
                            <TabsContent value="history" className="mt-3">

                                <div className="mb-5 p-3 border rounded">
                                    <h4 className="pb-2">Uses Details</h4>
                                    {loadingHistory ? (
                                        <div className="flex justify-center py-5">
                                            <Spinner />
                                        </div>
                                    ) : (
                                        <div className="grid grid-col gap-y-1 text-sm text-gray-700 ">
                                            <p>
                                                <span className="font-bold">Use Second:</span>{" "}
                                                {historyData.inkybay_used_second}
                                            </p>
                                            <p>
                                                <span className="font-bold">Use Days:</span>{" "}
                                                {historyData.inkybay_used_days}
                                            </p>
                                            <p>
                                                <span className="font-bold">Use Months:</span>{" "}
                                                {historyData.inkybay_used_months}
                                            </p>
                                            <p>
                                                <span className="font-bold">Use Years:</span>{" "}
                                                {historyData.inkybay_used_years}
                                            </p>
                                        </div>
                                    )}

                                </div>

                                {loadingHistory ? (
                                    <div className="flex justify-center py-15">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <>
                                        {history.length > 0 ? (
                                            <div className="space-y-2">
                                                {history.map((item: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="p-3 border rounded-md hover:bg-gray-50 transition"
                                                    >
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {item.event}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{item.description}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-gray-400 text-center py-4">
                                                No history available
                                            </div>
                                        )}
                                    </>
                                )}
                            </TabsContent>

                            {/* Placeholder Tabs */}
                            <TabsContent value="chats" className="mt-4 text-gray-500 text-sm">
                                Coming soon...
                            </TabsContent>
                            <TabsContent value="tasks" className="mt-4 text-gray-500 text-sm">
                                Coming soon...
                            </TabsContent>
                            <TabsContent
                                value="meetings"
                                className="mt-4 text-gray-500 text-sm"
                            >
                                Coming soon...
                            </TabsContent>
                        </Tabs>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
