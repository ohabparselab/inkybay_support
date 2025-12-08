import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"

export function ViewActivityLogModal({ open, onOpenChange, log }: any) {
    if (!log) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Activity Log Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-muted-foreground">Action</p>
                            <p className="font-medium">{log.action || "—"}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Model</p>
                            <p className="font-medium">{log.modelName || "—"}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Record ID</p>
                            <p className="font-medium">{log.recordId ?? "—"}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">User</p>
                            <p className="font-medium">{log.user?.fullName || "—"}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Date & Time</p>
                            <p className="font-medium">
                                {format(new Date(log.createdAt), "dd MMM yyyy, hh:mm a")}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <p className="text-muted-foreground mb-1">Description</p>
                        <p>{log.desc || "—"}</p>
                    </div>

                    {log.changes && (
                        <>
                            <Separator />
                            <div>
                                <p className="text-muted-foreground mb-1">Changes</p>
                                <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(log.changes, null, 2)}
                                </pre>
                            </div>
                        </>
                    )}

                    {log.metadata && (
                        <>
                            <Separator />
                            <div>
                                <p className="text-muted-foreground mb-1">Metadata</p>
                                <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
