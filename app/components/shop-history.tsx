import { Spinner } from "~/components/ui/spinner";
import { useFetcher } from "react-router";
import { useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface ShopifyHistoryProps {
    shopUrl: string;
}

export function ShopHistory({ shopUrl }: ShopifyHistoryProps) {

    const historyFetcher = useFetcher<{ status: number; data: any }>();

    // Submit fetch request when shopUrl changes
    useEffect(() => {
        if (!shopUrl) return;
        const fd = new FormData();
        fd.set("shop", shopUrl);
        historyFetcher.submit(fd, { method: "post", action: "/api/inkybay/history" });
    }, [shopUrl]);

    const loading = historyFetcher.state !== "idle";
    const histories = historyFetcher.data?.data?.history || {};
    const historyData = historyFetcher.data?.data || {};

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <Spinner />
            </div>
        );
    }

    return (
        <section>
            <h2 className="text-lg font-semibold">Shop History Details</h2>
            <div className="grid grid-cols-2 rounded-md p-3 gap-y-1 text-sm text-gray-700 ">
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
            <div className="rounded border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Date & Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {histories.length > 0 ? (
                            histories.map((history: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{history.event}</TableCell>
                                    <TableCell>{history.description}</TableCell>
                                    <TableCell>{history.time}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center py-6 text-muted-foreground"
                                >
                                    <div className="text-gray-400 text-center py-4">
                                        No history available
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </section>
    );
}
