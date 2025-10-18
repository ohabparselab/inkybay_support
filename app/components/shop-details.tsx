import { useEffect } from "react";
import { useFetcher } from "react-router";
import { Spinner } from "~/components/ui/spinner";

interface ShopDetailsProps {
    shopUrl: string;
}

export function ShopDetails({ shopUrl }: ShopDetailsProps) {

    const infoFetcher = useFetcher<{ status: number; data: any }>();

    // Submit fetch request when shopUrl changes
    useEffect(() => {
        if (!shopUrl) return;
        const fd = new FormData();
        fd.set("shop", shopUrl);
        infoFetcher.submit(fd, { method: "post", action: "/api/inkybay/info" });
    }, [shopUrl]);

    const loading = infoFetcher.state !== "idle";
    const shop = infoFetcher.data?.data?.shopify || {};
    const isShopEmpty = Object.keys(shop).length === 0;

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <Spinner />
            </div>
        );
    }

    return (
        <section>
            <h2 className="text-lg font-semibold mb-3">Shop Details</h2>
            {isShopEmpty ? (
                <div className="text-gray-400 text-center py-4">
                    No shop details found
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-y-1 text-sm text-gray-700">
                    <p><span className="font-bold">Shop ID:</span> {shop.id}</p>
                    <p><span className="font-bold">Shop Name:</span> {shop.shop_name}</p>
                    <p><span className="font-bold">Plan:</span> {shop.plan}</p>
                    <p><span className="font-bold">Free User:</span> {shop.free_user ? 'Yes' : 'No'}</p>
                    <p><span className="font-bold">Frozen:</span> {shop.frozen ? 'Yes' : 'No'}</p>
                    <p><span className="font-bold">Client Name:</span> {shop.client_name}</p>
                    <p><span className="font-bold">Email:</span> {shop.client_email}</p>
                    <p><span className="font-bold">Phone:</span> {shop.client_phone}</p>
                    <p><span className="font-bold">Country:</span> {shop.client_country_name}</p>
                    <p><span className="font-bold">Country Code:</span> {shop.client_country_code}</p>
                    <p><span className="font-bold">Address:</span> {`${shop.client_address1} ${shop.client_address2}`}</p>
                    <p><span className="font-bold">Zip Code:</span> {shop.client_zip}</p>
                    <p><span className="font-bold">Province:</span> {shop.client_province}</p>
                    <p><span className="font-bold">City:</span> {shop.client_city}</p>
                    <p><span className="font-bold">Currency:</span> {shop.client_currency}</p>
                </div>
            )}
        </section>
    );
}
