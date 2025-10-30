import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { ShopHistory } from "@/components/shop-history";
import { ShopDetails } from "@/components/shop-details";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ViewMeetingDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    meeting?: any;
}

export function ViewMeetingDetailsModal({ open, onOpenChange, meeting }: ViewMeetingDetailsModalProps) {

    if (!meeting) return null;

    const formatDate = (date?: Date | string | null) =>
        date ? format(new Date(date), "PPPp") : "-";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader className="p-5 border-b">
                    <DialogTitle>Meeting Details</DialogTitle>
                </DialogHeader>

                <section className="space-y-5 border rounded p-3">
                    <h3 className="text-base font-semibold mb-3">Meeting Info</h3>
                    <Separator />

                    <div className="grid grid-cols-2 gap-x-4 text-sm">
                        <div className="space-y-2">
                            <p><strong>Store URL:</strong> {meeting.storeUrl || "N/A"}</p>
                            <p><strong>Meeting Date & Time:</strong> {formatDate(meeting.meetingDateTime)}</p>
                            <p><strong>Joining Status:</strong> {meeting.joiningStatus ? "Joined" : "Not Joined"}</p>
                            <p><strong>Review Asked:</strong> {meeting.review?.reviewAsked ? "Yes" : "No"}</p>
                            <p><strong>Review Given:</strong> {meeting.review?.reviewGiven ? "Yes" : "No"}</p>
                            <p><strong>Review Date:</strong> {formatDate(meeting.review?.reviewDate)}</p>
                        </div>
                        <div className="space-y-2">
                            <p><strong>Agent:</strong> {meeting.user?.fullName || "N/A"}</p>
                            <p><strong>External Meeting:</strong> {meeting.isExternalMeeting ? "Yes" : "No"}</p>
                            <p className="break-words">
                                <strong>Recorded Video Link:</strong>{" "}
                                {meeting.recordedVideo ? (
                                    <a
                                        href={meeting.recordedVideo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline ml-1"
                                    >
                                        View Recording
                                    </a>
                                ) : (
                                    <span>N/A</span>
                                )}
                            </p>
                            <p><strong>Created At:</strong> {formatDate(meeting.createdAt)}</p>
                            <p><strong>Updated At:</strong> {formatDate(meeting.updatedAt)}</p>
                            <p><strong>Project:</strong> {meeting.project?.name}</p>
                        </div>
                    </div>

                    <Separator />

                    <section>
                        <h3 className="text-base font-semibold mb-2"> Emails</h3>
                        {meeting.emails && meeting.emails.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {meeting.emails.map((emailObj: any, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                        {emailObj.email}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p>No associated emails.</p>
                        )}
                    </section>

                    <Separator />

                    <section>
                        <h3 className="text-base font-semibold mb-2">Meeting Details</h3>
                        <p className="whitespace-pre-line">
                            {meeting.meetingDetails || "N/A"}
                        </p>
                    </section>

                    <Separator />

                    <section>
                        <h3 className="text-base font-semibold mb-2">Meeting Notes</h3>
                        <p className="whitespace-pre-line">
                            {meeting.meetingNotes || "N/A"}
                        </p>
                    </section>

                    <Separator />

                    <section>
                        <h3 className="text-base font-semibold mb-2">Reviews Info</h3>
                        <p className="whitespace-pre-line">
                            {meeting.review?.reviewText || "N/A"}
                        </p>
                    </section>
                    <Separator />
                    <ShopDetails shopUrl={meeting?.storeUrl} />
                    <Separator />
                    <ShopHistory shopUrl={meeting?.storeUrl} />
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
