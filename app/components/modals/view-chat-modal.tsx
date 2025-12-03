import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { CommentList } from "@/components/comments/CommentList";
import { ShopDetails } from "@/components/shop-details";
import { ShopHistory } from "@/components/shop-history";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";

interface ViewChatDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    chatId: number;
}

export function ViewChatDetailsModal({ open, onOpenChange, chatId }: ViewChatDetailsModalProps) {
    if (!chatId) return null;
    const [loading, setLoading] = useState(true);
    const formatDate = (date?: Date | string | null) => date ? format(new Date(date), "PPPp") : "-";
    const [users, setUsers] = useState<any[]>([]);
    const [chat, setChat] = useState<any | null>({});
    const [currentUserId, setCurrentUserId] = useState<any>();

    const fetchData = async () => {
        const [usersRes, chatRes] = await Promise.all([
            fetch("/api/users").then((res) => res.json()),
            fetch(`/api/chats/${chatId}`).then((res) => res.json()),
        ]);
        setUsers(usersRes.users || []);
        setCurrentUserId(usersRes.currentUserId);
        setChat(chatRes.chat)
    };

    useEffect(() => {
        if (open && chatId) {
            fetchData();
            setLoading(false);
        }
    }, [open, chatId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader className="p-5 border-b">
                    <DialogTitle>Chat Details</DialogTitle>
                </DialogHeader>
                <section className="space-y-5 border rounded p-3">
                    <h3 className="text-base font-semibold mb-3">Chat Info</h3>
                    <Separator />
                    {
                        loading ? (
                            <>
                                <div className="flex justify-center py-15">
                                    <Spinner />
                                </div>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-x-4 text-sm">
                                <div className="space-y-2">
                                    <p><strong>Chat Date:</strong> {formatDate(chat.chatDate)}</p>
                                    <p className="break-words">
                                        <div className="flex gap-2 mt-1">
                                            <strong>Chat Transcript:</strong>{" "}
                                            {chat.chatTranscript ? (
                                                <>
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
                                                </>
                                            ) : (
                                                <span className="text-gray-500">N/A</span>
                                            )}
                                        </div>
                                    </p>
                                    <p><strong>Client Query:</strong> {chat.clientQuery || "-"}</p>
                                    <p><strong>Tags: </strong>
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
                                    <p><strong>Handled By:</strong>
                                        {chat.handledByUsers && chat.handledByUsers.length > 0 ? (
                                            chat.handledByUsers.map((user: any) => (
                                                <span
                                                    key={user.fullName}
                                                    className="bg-blue-100 text-blue-700 ml-1 px-2 py-0.5 rounded-full text-xs"
                                                >
                                                    {user.fullName}
                                                </span>
                                            ))
                                        ) : (
                                            <span>N/A</span>
                                        )}
                                    </p>
                                    <p><strong>Changes Made By Agent:</strong> {chat?.changesMadeByAgent || "N/A"}</p>
                                    <p><strong>Client Feedback:</strong> {chat?.clientFeedback || "N/A"}</p>
                                    <p><strong>Other Store Url:</strong> {chat?.otherStoresUrl || "N/A"}</p>
                                    <p>
                                        <strong>Client Emails:</strong>{" "}
                                        {chat?.client?.clientEmail && chat.client.clientEmail.length > 0
                                            ? chat.client.clientEmail.map((cEmail: any) => {
                                                return <Badge variant="secondary" className="m-1">{cEmail.email}</Badge>
                                            })
                                            : "N/A"}
                                    </p>
                                    <p>
                                        <div className="flex">
                                            <strong>Agent Rating: </strong>
                                            {chat?.review?.agentRating ? (
                                                [...Array(10)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-6 w-6 ${i < (chat?.review?.agentRating || 0)
                                                            ? "text-yellow-500 fill-yellow-500"
                                                            : "text-gray-300"
                                                            }`}
                                                    />
                                                ))
                                            ) : ' N/A'}
                                        </div>
                                    </p>
                                    {
                                        chat.externalChat && (
                                            <>
                                                <p><strong>Store Url:</strong> {chat?.shopUrl || "N/A"}</p>
                                                <p><strong>Shop Name:</strong> {chat?.shopName || "N/A"}</p>
                                                <p><strong>Shop Email:</strong> {chat?.shopEmail || "N/A"}</p>
                                            </>
                                        )
                                    }
                                </div>
                                <div className="space-y-2">
                                    <p><strong>Review Text:</strong> {chat?.review?.reviewText || "N/A"}</p>
                                    <p><strong>Review Status:</strong> {chat?.review?.reviewStatus ? "Yes" : 'No'}</p>
                                    <p><strong>Review Asked:</strong> {chat?.review?.reviewAsked ? "Yes" : 'No'}</p>
                                    <p><strong>Review not asking reason:</strong> {chat?.review?.reviewNotAskReason ? chat?.review?.reviewNotAskReason : 'No'}</p>
                                    <p><strong>Last Review Approach:</strong> {formatDate(chat.review?.lastReviewApproach) || "N/A"}</p>
                                    <p><strong>Review Submitted At:</strong> {formatDate(chat.review?.reviewSubmittedAt) || "N/A"}</p>
                                    <p><strong>Review Approach By:</strong>
                                        {chat.review?.reviewApproachByUsers && chat.review?.reviewApproachByUsers.length > 0 ? (
                                            chat.review?.reviewApproachByUsers.map((user: any) => (
                                                <span
                                                    key={user.fullName}
                                                    className="bg-blue-100 text-blue-700 ml-1 px-2 py-0.5 rounded-full text-xs"
                                                >
                                                    {user.fullName}
                                                </span>
                                            ))
                                        ) : (
                                            <span>N/A</span>
                                        )}
                                    </p>
                                    <p><strong>Feature Request:</strong> {chat?.featureRequest?.featureDetails || "N/A"}</p>
                                    <p><strong>Store Details:</strong> {chat?.storeDetails || "N/A"}</p>
                                    <p><strong>Created At:</strong> {formatDate(chat.createdAt)}</p>
                                    <p><strong>Updated At:</strong> {formatDate(chat.updatedAt)}</p>
                                    <p><strong>Rating Mood/Client nature:</strong> {chat?.review?.ratingMood || "N/A"}</p>
                                    <p className="font-medium flex">
                                        <strong>Review Rating:</strong>
                                        <div className="flex">
                                            {chat?.review?.rating ? (
                                                [...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-6 w-6 ${i < (chat?.review?.rating || 0)
                                                            ? "text-yellow-500 fill-yellow-500"
                                                            : "text-gray-300"
                                                            }`}
                                                    />
                                                ))
                                            ) : ' N/A'}
                                        </div>
                                    </p>
                                    <p className="font-medium flex">
                                        <strong>Agent Rating:</strong>
                                        <div className="flex">
                                            {chat?.agentRating ? (
                                                [...Array(10)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-6 w-6 ${i < (chat?.agentRating || 0)
                                                            ? "text-yellow-500 fill-yellow-500"
                                                            : "text-gray-300"
                                                            }`}
                                                    />
                                                ))
                                            ) : ' N/A'}
                                        </div>
                                    </p>
                                    <p><strong>Project:</strong> {chat?.project?.name || "N/A"}</p>
                                </div>
                            </div>
                        )
                    }

                    <Separator />
                    <div>
                        <h3 className="mb-2">Comments</h3>
                        <CommentList contextId={chat.id} currentUserId={currentUserId} contextType="chat" users={users} />
                    </div>
                    <Separator />
                    <ShopDetails shopUrl={chat?.client?.shopDomain} />
                    <Separator />
                    <ShopHistory shopUrl={chat?.client?.shopDomain} />
                </section>
                <DialogFooter className="p-6 border-t">
                    <Button variant="destructive" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
