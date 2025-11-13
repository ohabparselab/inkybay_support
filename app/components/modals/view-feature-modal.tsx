import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ShopDetails } from "../shop-details";
import { ShopHistory } from "../shop-history";

interface FeatureRequestDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    featureRequest: any;
}

export function FeatureRequestDetailsModal({
    open,
    onOpenChange,
    featureRequest,
}: FeatureRequestDetailsModalProps) {

    console.log()
    if (!featureRequest) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Feature Request Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2 text-sm">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-muted-foreground">Shop Name</p>
                            <p className="font-medium">{featureRequest.shopName || featureRequest.chat?.shopName || "—"}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Shop URL</p>
                            <p className="font-medium break-words">
                                {featureRequest.shopUrl || featureRequest.client?.shopDomain || featureRequest.chat?.shopUrl || "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Email</p>
                            <p className="font-medium">{featureRequest.email || featureRequest.client?.email || "—"}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Created By</p>
                            <p className="font-medium">
                                {featureRequest.createdByUser?.fullName || "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Created At</p>
                            <p className="font-medium">
                                {featureRequest.createdAt
                                    ? format(new Date(featureRequest.createdAt), "dd MMM yyyy, hh:mm a")
                                    : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Updated At</p>
                            <p className="font-medium">
                                {featureRequest.updatedAt
                                    ? format(new Date(featureRequest.updatedAt), "dd MMM yyyy, hh:mm a")
                                    : "—"}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Feature Details */}
                    <div>
                        <p className="text-muted-foreground mb-1">Feature Details</p>
                        <p className="whitespace-pre-line text-sm">
                            {featureRequest.featureDetails || "—"}
                        </p>
                    </div>

                    <Separator />

                    {/* Optional sections (ShopDetails / ShopHistory if needed) */}

                    <ShopDetails shopUrl={featureRequest.shopUrl || featureRequest.client?.shopDomain || featureRequest.chat?.shopUrl} />
                    <Separator />
                    <ShopHistory shopUrl={featureRequest.shopUrl || featureRequest.client?.shopDomain || featureRequest.chat?.shopUrl} />

                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
