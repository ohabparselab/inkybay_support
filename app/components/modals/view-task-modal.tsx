import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { ShopDetails } from "@/components/shop-details";
import { ShopHistory } from "@/components/shop-history";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ViewTaskDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: any;
}

export function ViewTaskDetailsModal({ open, onOpenChange, task }: ViewTaskDetailsModalProps) {

    if (!task) return null;

    const formatDate = (date?: Date | string | null) => date ? format(new Date(date), "PPPp") : "-";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader className="p-5 border-b">
                    <DialogTitle>Task Details</DialogTitle>
                </DialogHeader>

                <section className="space-y-5 border rounded p-3">
                    <h3 className="text-base font-semibold mb-3">Task Info</h3>
                    <Separator />

                    <div className="grid grid-cols-2 gap-x-6 space-y-2 text-sm text-gray-700">
                        <p><strong>Client:</strong> {task.client?.shopName || "-"}</p>
                        <p><strong>Provided By:</strong> {task.providedByUser?.fullName || "-"}</p>
                        <p><strong>Solved By:</strong> {task.solvedByUser?.fullName || "N/A"}</p>
                        <p><strong>Status:</strong>
                            {task.status ? (
                                <Badge variant="secondary" className="ml-2">{task.status.name}</Badge>
                            ) : (
                                <span className="text-gray-500 ml-1">N/A</span>
                            )}
                        </p>
                        <p><strong>Store Password:</strong> {task.storePassword || "N/A"}</p>
                        <p><strong>Store Access:</strong> {task.storeAccess || "N/A"}</p>
                        <p><strong>Task Added Date:</strong> {formatDate(task.taskAddedDate)}</p>
                        <p><strong>Created At:</strong> {formatDate(task.createdAt)}</p>
                        <p><strong>Updated At:</strong> {formatDate(task.updatedAt)}</p>
                        <p><strong>Reply:</strong> {task.reply || "N/A"}</p>
                        <p><strong>Task Details:</strong> {task.taskDetails || "-"}</p>
                        <p><strong>Comments:</strong> {task.comments || "N/A"}</p>
                    </div>
                    <Separator />
                    <ShopDetails shopUrl={task.client.shopDomain} />
                    <Separator />
                    <ShopHistory shopUrl={task.client.shopDomain} />
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
