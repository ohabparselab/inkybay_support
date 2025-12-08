import { useState } from "react";
import { CommentInput } from "./CommentInput";
import { MentionTooltip } from "./MentionTooltip";

interface CommentItemProps {
    comment: any;
    users: any[];
    currentUserId: number;
    onReply: (content: string, mentions: number[], parentId: number) => Promise<any>;
    onEdit: (commentId: number, content: string, mentions: number[]) => Promise<any>;
}

export function CommentItem({ comment, users, currentUserId, onReply, onEdit }: CommentItemProps) {

    const [showReplyBox, setShowReplyBox] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState<any[]>([]);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);

    const isOwner = (userId: number) => userId === currentUserId;

    const fetchReplies = async () => {
        setLoadingReplies(true);
        const res = await fetch(`/api/comments?threadId=${comment.id}`);
        const data = await res.json();
        if (data.success) setReplies(data.replies);
        setShowReplies(true);
        setLoadingReplies(false);
    };

    const handleReplySubmit = async (content: string, mentions: number[], parentReply?: any) => {
        const parentId = comment.id; // parent is always top-level comment
        const mentionIds = [...mentions];
        if (parentReply && parentReply.user?.id !== currentUserId && !mentionIds.includes(parentReply.user.id)) {
            mentionIds.push(parentReply.user.id); // mention the reply user
        }

        await onReply(content, mentionIds, parentId);

        // Add reply locally
        setReplies(prev => [...prev, { content, user: users.find(u => u.id === currentUserId), createdAt: new Date(), id: Math.random() }]);
        setShowReplies(true);
        // setShowReplyBox(false);
        fetchReplies();
    };

    const handleEditSubmit = async (commentId: number, content: string, mentions: number[]) => {
        await onEdit(commentId, content, mentions);
        setEditingCommentId(null);
        fetchReplies();    
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
                        <span className="text-blue-600 font-medium cursor-pointer hover:underline">@{name}</span>
                    </MentionTooltip>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div className="mt-4">
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <img
                    src={comment.user?.avatar || "/avatar-default.svg"}
                    alt={comment.user?.fullName}
                    className="w-8 h-8 rounded-full object-cover mt-1"
                />

                <div className="flex-1">
                    {/* Name + timestamp */}
                    <div className="flex items-center gap-2">
                        <strong className="text-sm">{comment.user?.fullName}</strong>
                        <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>

                    {/* Comment content / edit input */}
                    {editingCommentId === comment.id ? (
                        <div className="mt-1">
                            <CommentInput
                                users={users}
                                value={comment.content}
                                onSubmit={(content, mentions) => handleEditSubmit(comment.id, content, mentions)}
                            />
                            <button
                                onClick={() => setEditingCommentId(null)}
                                className="text-xs text-red-500 hover:underline mt-1 cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm mt-1">{renderContent(comment.content)}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-1">
                        {isOwner(comment.user?.id) && editingCommentId === null && (
                            <button
                                onClick={() => setEditingCommentId(comment.id)}
                                className="text-xs text-blue-600 hover:underline cursor-pointer"
                            >
                                Edit
                            </button>
                        )}

                        <button
                            onClick={() => {
                                setShowReplyBox(!showReplyBox)
                                 setShowReplies(!showReplies);
                            }}
                            className={`cursor-pointer text-xs hover:underline ${showReplyBox ? "text-red-500" : "text-blue-600"}`}
                        >
                            {showReplyBox ? "Cancel" : "Reply"}
                        </button>

                        {comment._count?.replies > 0 && !showReplies && (
                            <button
                                onClick={() => {
                                    fetchReplies();
                                    setShowReplyBox(!showReplyBox);
                                }
                                }
                                className="text-xs text-gray-500 hover:underline"
                                disabled={loadingReplies}
                            >
                                {loadingReplies ? "Loading..." : `View ${comment._count.replies} repl${comment._count.replies > 1 ? "ies" : "y"}`}
                            </button>
                        )}

                        {showReplies && replies.length > 0 && (
                            <button
                                onClick={() => {
                                    setShowReplies(false);
                                    setShowReplyBox(false);
                                }}
                                className="text-xs text-gray-500 hover:underline"
                            >
                                Hide replies
                            </button>
                        )}
                    </div>

                    {/* Replies */}
                    {showReplies && replies.length > 0 && (
                        <div className="ml-10 mt-2 space-y-3">
                            {replies.map(reply => {
                                const isReplyOwner = isOwner(reply.user?.id);
                                return (
                                    <div key={reply.id} className="flex items-start gap-2">
                                        <img
                                            src={reply.user?.avatar || "/avatar-default.svg"}
                                            alt={reply.user?.fullName}
                                            className="w-7 h-7 rounded-full mt-1"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <strong className="text-sm">{reply.user?.fullName}</strong>
                                                <span className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleString()}</span>
                                            </div>

                                            {editingCommentId === reply.id ? (
                                                <div className="mt-1">
                                                    <CommentInput
                                                        users={users}
                                                        value={reply.content}
                                                        onSubmit={(content, mentions) => handleEditSubmit(reply.id, content, mentions)}
                                                    />
                                                    <button
                                                        onClick={() => setEditingCommentId(null)}
                                                        className="text-xs text-red-500 hover:underline mt-1 cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-sm mt-1">{renderContent(reply.content)}</p>
                                            )}

                                            {isReplyOwner && editingCommentId === null && (
                                                <button
                                                    onClick={() => setEditingCommentId(reply.id)}
                                                    className="text-xs text-blue-600 hover:underline mt-1 cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Reply input */}
                    {showReplyBox && (
                        <div className="ml-10 mt-2">
                            <CommentInput
                                users={users}
                                onSubmit={(content, mentions) => handleReplySubmit(content, mentions)}
                                placeholder={`Reply to ${comment.user?.fullName}...`}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
