import { useFetcher, useLocation, useParams } from "react-router";
import { Spinner } from "~/components/ui/spinner";
import { useEffect } from "react";

interface ShopInfo {
    id: string;
    shop_name: string;
    url: string;
    client_email: string;
    created_at?: string;
}

interface ShopHistoryItem {
    id: string;
    action: string;
    timestamp: string;
    details?: string;
}

export default function ShopDetailsPage() {

    const location = useLocation();
    const shopUrl = new URLSearchParams(location.search).get("shopUrl") || "";
    const infoFetcher = useFetcher<{ status: number; data: ShopInfo }>();
    const historyFetcher = useFetcher<{ status: number; data: ShopHistoryItem[] }>();

    // Fetch shop info
    useEffect(() => {
        if (!shopUrl) return;
        const fd = new FormData();
        fd.set("shop", `${shopUrl}`); // replace with dynamic param if needed
        infoFetcher.submit(fd, { method: "post", action: "/api/inkybay/info" });
    }, []);

    // Fetch shop history
    useEffect(() => {
        if (!shopUrl) return;
        const fd = new FormData();
        fd.set("shop", `${shopUrl}`); // replace with dynamic param if needed
        historyFetcher.submit(fd, { method: "post", action: "/api/inkybay/history" });
    }, []);

    const loadingInfo = infoFetcher.state !== "idle";
    const loadingHistory = historyFetcher.state !== "idle";

    const shop = infoFetcher.data?.data;
    const history = historyFetcher.data?.data || [];

    return (
        <div className="max-w-4xl mt-10 p-6 bg-white rounded-lg shadow-lg space-y-8">
            {/* Shop Info Card */}
            <div className="space-y-2">
                {loadingInfo ? (
                    <Spinner className="mx-auto my-10" />
                ) : shop ? (
                    <>
                        <h1 className="text-2xl font-bold text-blue-600 hover:underline">
                            {shop.shop_name}
                        </h1>
                        <p className="text-green-600 text-sm">{shop.url}</p>
                        <div className="text-gray-700 text-sm mt-1 space-y-1">
                            <p>
                                <span className="font-medium">Client Email:</span> {shop.client_email}
                            </p>
                            <p>
                                <span className="font-medium">Shop ID:</span> {shop.id}
                            </p>
                            {shop.created_at && (
                                <p>
                                    <span className="font-medium">Created At:</span>{" "}
                                    {new Date(shop.created_at).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-500">Shop info not found</div>
                )}
            </div>

            {/* Shop History */}
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">History</h2>
                {loadingHistory ? (
                    <Spinner className="mx-auto my-10" />
                ) : history.length > 0 ? (
                    history.map((item: ShopHistoryItem) => (
                        <div
                            key={item.id}
                            className="p-3 border rounded-lg hover:bg-gray-50 transition cursor-pointer"
                        >
                            <p className="text-sm text-gray-800 font-medium">{item.action}</p>
                            {item.details && (
                                <p className="text-xs text-gray-500 truncate">{item.details}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(item.timestamp).toLocaleString()}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-400 text-center py-4">No history available</div>
                )}
            </div>
        </div>
    );
}
