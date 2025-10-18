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

    const formatDateTime = (date?: Date | string | null) => date ? format(new Date(date), "PPPp") : "-";
    const formatDate = (date?: Date | string | null) => date ? format(new Date(date), "PPP") : "-";

    console.log(funnel.client.clientEmail);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader className="p-5 border-b">
                    <DialogTitle>Marketing Funnel Details</DialogTitle>
                </DialogHeader>

                <section className="space-y-5 border rounded p-3">
                    <h3 className="text-base font-semibold mb-3">Marketing Funnel Info</h3>
                    <Separator />

                    <div className="grid grid-cols-2 gap-x-6 space-y-2 text-sm text-gray-700">
                        <p>
                            <strong>Install Phase:</strong> {funnel.installPhase || "N/A"}
                        </p>
                        <p>
                            <strong>Type of Products:</strong> {funnel.typeOfProducts || "N/A"}
                        </p>
                        <p>
                            <strong>Other Apps Installed:</strong>{" "}
                            {funnel.otherAppsInstalled || "N/A"}
                        </p>
                        <p>
                            <strong>Customization Type:</strong>{" "}
                            {funnel.customizationType || "N/A"}
                        </p>
                        <p>
                            <strong>Client Success Status:</strong>{" "}
                            {funnel.clientSuccessStatus == 'yes' ? "Yes" : "No"}
                            {/* <Badge variant="secondary">{}</Badge> */}
                        </p>
                        <p>
                            <strong>Created At:</strong> {formatDateTime(funnel.createdAt)}
                        </p>
                        <p>
                            <strong>Updated At:</strong> {formatDateTime(funnel.updatedAt)}
                        </p>
                        <p>
                            <strong>Initial Feedback:</strong>{" "}
                            {funnel.initialFeedback || "N/A"}
                        </p>
                    </div>

                    <Separator />
                    <section>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-base font-semibold mb-3">Follow Ups</h3>
                                {funnel.followUps && funnel.followUps.length > 0 ? (
                                    <ul className="list-disc ml-6 text-sm space-y-1">
                                        {funnel.followUps.map((fu: any, index: number) => (
                                            <li key={index}>
                                                Follow-up Date:{" "}
                                                <span className="font-medium">
                                                    {formatDate(fu.followUpDate)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 italic">No follow-ups recorded.</p>
                                )}
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
                                    <p className="text-gray-500 italic">No follow-ups recorded.</p>
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
