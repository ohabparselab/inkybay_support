import { useState } from "react";
import { CommentInput } from "./CommentInput";
import { MentionTooltip } from "./MentionTooltip";

interface CommentItemProps {
    comment: any;
    users: any[];
    onReply: (content: string, mentions: number[], parentId: number) => Promise<any>;
}

export function CommentItem({ comment, users, onReply }: CommentItemProps) {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState<any[]>([]);
    const [loadingReplies, setLoadingReplies] = useState(false);

    const fetchReplies = async () => {
        setLoadingReplies(true);
        const res = await fetch(`/api/comments?threadId=${comment.id}`);
        const data = await res.json();
        if (data.success) {
            setReplies(data.replies);
            setShowReplies(true);
        }
        setLoadingReplies(false);
    };

    const handleReplySubmit = async (content: string, mentions: number[]) => {
        // Create reply on backend
        const res = await fetch("/api/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content,
                mentions,
                parentId: comment.id,
                // also pass context ids if needed (chatId, taskId, etc)
                chatId: comment.chatId || undefined,
                taskId: comment.taskId || undefined,
                communityId: comment.communityId || undefined,
            }),
        });

        const data = await res.json();

        if (data.success && data.comment) {
            setReplies((prev) => [...prev, data.comment]);
            setShowReplies(true);
            // setShowReplyBox(false);
        }
    };

    const renderContent = (text: string) => {
        const parts = text.split(/(@\[[^\]]+\]\(\d+\))/g);
        return parts.map((part, i) => {
            const match = part.match(/@\[(.+?)\]\((\d+)\)/);
            if (match) {
                const name = match[1];
                const id = Number(match[2]);
                return (
                    <MentionTooltip key={i} userId={id}>
                        <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                            @{name}
                        </span>
                    </MentionTooltip>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div className="mt-4">
            <div className="flex items-start gap-3">
                <img
                    src={comment.user?.avatar || "/avatar-default.svg"}
                    alt={comment.user?.fullName}
                    className="w-8 h-8 rounded-full object-cover mt-1"
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <strong className="text-sm">{comment.user?.fullName}</strong>
                        <span className="text-xs text-gray-400">
                            {new Date(comment.createdAt).toLocaleString()}
                        </span>
                    </div>

                    <p className="text-sm mt-1">{renderContent(comment.content)}</p>

                    <div className="flex items-center gap-3 mt-1">
                        <button
                            onClick={() => {
                                setShowReplyBox(!showReplyBox)
                                setShowReplies(!showReplies);
                            }}
                            className={`text-xs hover:underline ${showReplyBox ? "text-red-500" : "text-blue-600"}`}
                        >
                            {showReplyBox ? "Cancel" : "Reply"}
                        </button>

                        {comment._count?.replies > 0 && !showReplies && (
                            <button
                                onClick={() => {
                                    fetchReplies();
                                    setShowReplyBox(true)
                                }}
                                className="text-xs text-gray-500 hover:underline"
                                disabled={loadingReplies}
                            >
                                {loadingReplies
                                    ? "Loading..."
                                    : `View ${comment._count.replies} repl${comment._count.replies > 1 ? "ies" : "y"
                                    }`}
                            </button>
                        )}

                        {showReplies && replies.length > 0 && (
                            <button
                                onClick={() => {
                                    setShowReplies(false);
                                    setShowReplyBox(false);
                                }
                                }
                                className="text-xs text-gray-500 hover:underline"
                            >
                                Hide replies
                            </button>
                        )}
                    </div>

                    {/* Replies */}
                    {showReplies && (
                        <div className="ml-10 mt-2 space-y-3">
                            {replies.map((reply) => (
                                <div key={reply.id} className="flex items-start gap-2">
                                    <img
                                        src={reply.user?.avatar || "/avatar-default.svg"}
                                        alt={reply.user?.fullName}
                                        className="w-7 h-7 rounded-full mt-1"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <strong className="text-sm">{reply.user?.fullName}</strong>
                                            <span className="text-xs text-gray-400">
                                                {new Date(reply.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm mt-1">{renderContent(reply.content)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reply input */}
                    {showReplyBox && (
                        <div className="ml-10 mt-2">
                            <CommentInput
                                users={users}
                                onSubmit={handleReplySubmit}
                                placeholder={`Reply to ${comment.user?.fullName}...`}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
