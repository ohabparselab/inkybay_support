import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { HtmlViewerWithIframe } from "../ui/html-viewer";

interface ViewCommunityModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    communityId?: number | null;
}

export function ViewCommunityModal({
    open,
    onOpenChange,
    communityId,
}: ViewCommunityModalProps) {
    const [loading, setLoading] = useState(false);
    const [community, setCommunity] = useState<any>(null);

    const fetchCommunity = async () => {
        if (!communityId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/communities/${communityId}`);
            if (!res.ok) throw new Error("Failed to fetch community details");
            const data = await res.json();
            setCommunity(data.community);
        } catch (err: any) {
            toast.error(err.message || "Error loading community details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && communityId) fetchCommunity();
    }, [open, communityId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>View Community Details</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Spinner />
                    </div>
                ) : !community ? (
                    <div className="text-center text-muted-foreground py-10">
                        No details found.
                    </div>
                ) : (
                    <ScrollArea className="max-h-[75vh] pr-3">
                        <div className="space-y-6">
                            {/* Question */}
                            <div>
                                <Label className="text-base font-semibold">Question</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {community.question || "N/A"}
                                </p>
                            </div>

                            {/* Question URL */}
                            {community.questionUrl && (
                                <div>
                                    <Label className="text-base font-semibold">Question URL</Label>
                                    <a
                                        href={community.questionUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline break-all text-sm mt-1 block"
                                    >
                                        {community.questionUrl}
                                    </a>
                                </div>
                            )}

                            <Separator />

                            {/* Project, User, Status */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label className="font-semibold">Project</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {community.project?.projectName || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <Label className="font-semibold">Added By</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {community.addedBy?.fullName || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <Label className="font-semibold">Status</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {community.status?.name || "N/A"}
                                    </p>
                                </div>
                            </div>

                            {/* Listed Date */}
                            <div>
                                <Label className="font-semibold flex items-center gap-1">
                                    <CalendarIcon className="w-4 h-4" /> Listed Date
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {community.listedDate
                                        ? format(new Date(community.listedDate), "PPP")
                                        : "N/A"}
                                </p>
                            </div>

                            <Separator />

                            {/* Reply (Rich Text) */}
                            <div>
                                <Label className="text-base font-semibold">Reply</Label>
                                <div className="border p-3 rounded-md bg-muted/30 mt-1">
                                    {community.reply ? (
                                        <HtmlViewerWithIframe content={community.reply} />
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No reply added</p>
                                    )}
                                </div>
                            </div>

                            {/* Comments */}
                            <div>
                                <Label className="text-base font-semibold">Comments</Label>
                                <div className="mt-2 space-y-2">
                                    {community.comments?.length > 0 ? (
                                        community.comments.map((comment: any) => (
                                            <div
                                                key={comment.id}
                                                className="border p-2 rounded-md bg-muted/20 text-sm"
                                            >
                                                <p>{comment.content}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    — {comment.user?.fullName || "Unknown"} (
                                                    {format(new Date(comment.createdAt), "PPP")})
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No comments yet</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                )}

                <DialogFooter className="!justify-center flex gap-2 mt-4">
                    <Button variant="destructive" onClick={() => onOpenChange(false)}>
                        <X className="w-4 h-4 mr-1" /> Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
