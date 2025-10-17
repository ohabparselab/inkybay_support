import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Separator } from "../ui/separator";

interface ViewChatDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    chat?: any;
}

export function ViewChatDetailsModal({ open, onOpenChange, chat }: ViewChatDetailsModalProps) {
    if (!chat) return null;
    const formatDate = (date?: Date | string | null) => date ? format(new Date(date), "PPPp") : "-";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader className="p-5 border-b">
                    <DialogTitle>Chat Details</DialogTitle>
                </DialogHeader>
                <section className="space-y-5 border rounded p-3">
                    <h3 className="text-base font-semibold mb-3">Chat Info</h3>
                    <Separator />
                    <div className="grid grid-cols-2 gap-x-6 space-y-2 text-sm text-gray-700">
                        <p><strong>Chat Date:</strong> {formatDate(chat.chatDate)}</p>
                        <p><strong>Handled By:</strong> {chat.handleByUser?.fullName || "-"}</p>
                        <p className="break-words">
                           
                            {chat.chatTranscript ? (
                                <div className="flex gap-2 mt-1">
                                     <strong>Chat Transcript:</strong>{" "}
                                    {/* View Button */}
                                    <a
                                        href={chat.chatTranscript}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                       View
                                    </a>

                                    {/* Download Button */}
                                    <a
                                        href={chat.chatTranscript}
                                        download
                                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 text-xs"
                                    >
                                        Download
                                    </a>
                                </div>
                            ) : (
                                <span className="text-gray-500">N/A</span>
                            )}
                        </p>

                        <p><strong>Review Asked:</strong> {chat?.reviewAsked ? "Yes" : 'No'}</p>
                        <p><strong>Review Status:</strong> {chat?.reviewStatus ? "Yes" : 'No'}</p>
                        <p><strong>Agent Rating:</strong> {chat?.agentRating || "N/A"}</p>
                        <p><strong>Other Store Url:</strong> {chat?.otherStoresUrl || "N/A"}</p>
                        <p><strong>Last Review Approach:</strong> {formatDate(chat.chatDate) || "N/A"}</p>
                        <p><strong>Tags:</strong>
                            {chat.chatTags && chat.chatTags.length > 0 ? (
                                <>
                                    {chat.chatTags.map((ct: any, i: number) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                            {ct.tag.name}
                                        </Badge>
                                    ))}
                                </>
                            ) : (
                                <span className="text-gray-500">N/A</span>
                            )}
                        </p>
                        <p><strong>Store Details:</strong> {chat?.storeDetails || "N/A"}</p>
                        <p><strong>Created At:</strong> {formatDate(chat.createdAt)}</p>
                        <p><strong>Updated At:</strong> {formatDate(chat.updatedAt)}</p>
                        <p><strong>Review Text:</strong> {chat?.reviewText || "N/A"}</p>
                        <p><strong>Client Query:</strong> {chat.clientQuery || "-"}</p>
                        <p><strong>Client Feedback:</strong> {chat?.clientFeedback || "N/A"}</p>
                        <p><strong>Feature Request:</strong> {chat?.featureRequest || "N/A"}</p>
                        <p><strong>Agent Comment:</strong> {chat?.agentComments || "N/A"}</p>
                        <p><strong>Changes Made By Agent:</strong> {chat?.changesMadeByAgent || "N/A"}</p>

                    </div>
                    <Separator />
                    <section>
                        <h3 className="text-base font-semibold mb-3">Shop Details</h3>
                        <p className="text-gray-500 italic">Coming soon...</p>
                    </section>
                </section>
                <DialogFooter className="p-6 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
