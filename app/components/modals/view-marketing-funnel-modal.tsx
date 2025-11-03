import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ShopDetails } from "@/components/shop-details";
import { ShopHistory } from "@/components/shop-history";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useFetcher } from "react-router";
import { useEffect, useState } from "react";

interface ViewMarketingFunnelDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    funnel?: any;
}

export function ViewMarketingFunnelDetailsModal({
    open,
    onOpenChange,
    funnel,
}: ViewMarketingFunnelDetailsModalProps) {

    if (!funnel) return null;
    const funnelsFetcher = useFetcher<{ status: number; data: any }>();
    const [funnels, setFunnels] = useState<any | null>([]);
    const clientId = funnel.clientId;


    const formatDateTime = (date?: Date | string | null) => date ? format(new Date(date), "PPPp") : "-";
    const formatDate = (date?: Date | string | null) => date ? format(new Date(date), "PPP") : "-";

    // 🔹 Fetch funnels by clientId
    useEffect(() => {
        if (clientId) {
            const cf = new FormData();
            cf.set("clientId", String(clientId));
            funnelsFetcher.submit(cf, {
                method: "post",
                action: "/api/marketing-funnels/get-marketing-funnels-by-client-id",
            });
        }
    }, [clientId]);

    useEffect(() => {
        if (funnelsFetcher.data?.data) {
            setFunnels(funnelsFetcher.data.data);
        }
    }, [funnelsFetcher.data]);

    const loadingFunnels = funnelsFetcher.state !== "idle";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader className="p-5 border-b">
                    <DialogTitle>Marketing Funnel Details</DialogTitle>
                </DialogHeader>

                <section className="space-y-5 border rounded p-3">
                    <h3 className="text-base font-semibold mb-3">Marketing Funnel Info</h3>
                    <Separator />

                    <div className="grid grid-cols-2 gap-x-6 space-y-2 text-sm">
                        <p>
                            <strong>Type of Products:</strong> {funnel.typeOfProducts || "N/A"}
                        </p>
                        <p>
                            <strong>Customization Type:</strong>{" "}
                            {funnel.customizationType || "N/A"}
                        </p>
                        <p>
                            <strong>Created At:</strong> {formatDateTime(funnel.createdAt)}
                        </p>
                        <p>
                            <strong>Updated At:</strong> {formatDateTime(funnel.updatedAt)}
                        </p>
                    </div>

                    <Separator />
                    <section>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <h3 className="text-base font-semibold mb-3">Follow Ups</h3>
                                <div className="rounded-md border bg-card shadow-sm">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Install Phase</TableHead>
                                                <TableHead>Follow-up Status</TableHead>
                                                <TableHead>Follow-up Date</TableHead>
                                                <TableHead>Success Status</TableHead>
                                                <TableHead>Initial Feedback</TableHead>
                                                <TableHead>Other App Install</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {
                                                loadingFunnels ? (
                                                    Array.from({ length: 9 }).map((_, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell colSpan={9} className="py-4">
                                                                <div className="animate-pulse h-5 bg-accent rounded" />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    funnels.length > 0 ? (
                                                        funnels.map((funnel: any, index: number) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{funnel.installPhase}</TableCell>
                                                                <TableCell>{funnel.followUpStep}</TableCell>
                                                                <TableCell>{formatDate(funnel.followUpDate)}</TableCell>
                                                                <TableCell>{funnel.clientSuccessStatus}</TableCell>
                                                                <TableCell>{funnel.initialFeedback}</TableCell>
                                                                <TableCell>{funnel.otherAppsInstalled}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <p className="italic">No follow-ups recorded.</p>
                                                    )
                                                )
                                            }
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-base font-semibold mb-3">Client Emails</h3>
                                {funnel?.client?.clientEmail && funnel?.client.clientEmail?.length > 0 ? (
                                    <ul className="list-decimal ml-6 text-sm space-y-1">
                                        {funnel.client.clientEmail.map((e: any, index: number) => (
                                            <li key={index}>
                                                Mail:{" "}
                                                <span className="font-medium">
                                                    {e.email}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="italic">No follow-ups recorded.</p>
                                )}
                            </div>
                        </div>
                    </section>
                    <Separator />
                    <ShopDetails shopUrl={funnel.client.shopDomain} />
                    <Separator />
                    <ShopHistory shopUrl={funnel.client.shopDomain} />
                </section>

                <DialogFooter className="p-6 border-t">
                    <Button variant="destructive" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
