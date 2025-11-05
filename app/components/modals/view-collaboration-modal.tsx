import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { CenterSpinner } from "@/components/ui/center-spinner";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface ViewCollaborationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collaborationId: number | null;
}

export function ViewCollaborationModal({
    open,
    onOpenChange,
    collaborationId,
}: ViewCollaborationModalProps) {


    const [loading, setLoading] = useState(false);
    const [c, setC] = useState<any>({});

    useEffect(() => {
        if (!collaborationId || !open) return;
        setLoading(true);
        fetch(`/api/collaborations/${collaborationId}`)
            .then((res) => res.json())
            .then((data) => {
                const c = data.collaboration;
                setC(c);
            })
            .catch(() => toast.error("Failed to fetch collaboration data"))
            .finally(() => setLoading(false));
    }, [collaborationId, open]);

    if (loading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <CenterSpinner />
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>View Collaboration Details</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 space-y-2 text-sm">
                    <div className="flex gap-2 items-center">
                        <strong>App Name:</strong>
                        {c.appUrl ? (
                            <a href={c.appUrl} target="_blank" className="text-blue-600 underline inline-flex items-center gap-1">
                                {c.appName} <ExternalLink className="w-4 h-4" />
                            </a>
                        ) : (
                            "N/A"
                        )}
                    </div>
                    <div className="flex gap-2 items-center">
                        <strong>App URL:</strong>
                        {c.appUrl ? (
                            <a href={c.appUrl} target="_blank" className="text-blue-600 underline inline-flex items-center gap-1">
                                {c.appUrl} <ExternalLink className="w-4 h-4" />
                            </a>
                        ) : (
                            "N/A"
                        )}
                    </div>
                    <div className="flex gap-2 items-center">
                        <strong>Company Name:</strong>
                        {c.companyUrl ? (
                            <a href={c.companyUrl} target="_blank" className="text-blue-600 inline-flex items-center underline gap-1">
                                {c.companyName}{" "} <ExternalLink className="w-4 h-4" />
                            </a>
                        ) : (
                            "N/A"
                        )}
                    </div>

                    <div className="flex gap-2">
                        <strong>Company Name:</strong>
                        {c.companyUrl ? (
                            <a href={c.companyUrl} target="_blank" className="text-blue-600 inline-flex items-center underline gap-1">
                                {c.companyUrl}{" "} <ExternalLink className="w-4 h-4" />
                            </a>
                        ) : (
                            "N/A"
                        )}
                    </div>

                    <div className="flex gap-2">
                        <strong>App Added Date:</strong>
                        <p>{c.appAddedDate ? new Date(c.appAddedDate).toLocaleDateString() : "N/A"}</p>
                    </div>
                    <div className="flex gap-2">
                        <strong>Completed Date:</strong>
                        <p>{c.completedDate ? new Date(c.completedDate).toLocaleDateString() : "N/A"}</p>
                    </div>

                    <div className="flex gap-2">
                        <strong>Request Type:</strong> <p>{c.requestType || "N/A"}</p>
                    </div>
                    <div className="flex gap-2">
                        <strong>Status:</strong> <p>{c.status?.name || "N/A"}</p>
                    </div>

                    <div className="flex gap-2">
                        <strong>Project:</strong> <p>{c.project?.name || "N/A"}</p>
                    </div>
                    <div className="flex gap-2">
                        <strong>Send By:</strong> <p>{c.sendBy?.fullName || "N/A"}</p>
                    </div>

                    <div className="flex gap-2 items-center">
                        <strong>Added By:</strong> <p>{c.addedBy?.fullName || "N/A"}</p>
                    </div>

                    <div className="flex gap-2">
                        <strong>Emails:</strong>
                        <div className="flex flex-wrap gap-1">
                            {c.emails?.length ? (
                                c.emails.map((e: any, i: number) => (
                                    <span
                                        key={i}
                                        className="bg-gray-100 border px-2 py-1 rounded-2xl text-xs"
                                    >
                                        {e.email}
                                    </span>
                                ))
                            ) : (
                                <p>N/A</p>
                            )}
                        </div>
                    </div>

                    <div className="col-span-2 flex gap-2">
                        <strong>Collaboration Areas:</strong>
                        <div className="flex flex-wrap gap-1">
                            {c.collaborationAreas?.length ? (
                                c.collaborationAreas.map((a: any) => (
                                    <span
                                        key={a.id}
                                        className="bg-gray-100 border px-2 py-1 rounded-xl text-xs"
                                    >
                                        {a.areaOption?.name || a.name}
                                    </span>
                                ))
                            ) : (
                                <p>N/A</p>
                            )}
                        </div>
                    </div>

                    <div className="col-span-2">
                        <Separator className="my-2" />
                        <strong>App Details:</strong>
                        <p className="mt-1 whitespace-pre-wrap">{c.appDetails || "N/A"}</p>
                    </div>

                    <div className="col-span-2">
                        <strong>Meeting Details:</strong>
                        <p className="mt-1 whitespace-pre-wrap">{c.meetingDetails || "N/A"}</p>
                    </div>

                    <div className="col-span-2">
                        <strong>Comments:</strong>
                        <p className="mt-1 whitespace-pre-wrap">{c.comments || "N/A"}</p>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
