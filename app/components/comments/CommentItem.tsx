import { MentionTooltip } from "./MentionTooltip";
import { CommentInput } from "./CommentInput";
import { useState } from "react";

interface CommentItemProps {
    comment: any;
    users: any[];
    onReply: (content: string, mentions: number[], parentId: number) => void | Promise<void>;
}

export function CommentItem({ comment, users, onReply }: CommentItemProps) {

    const [showReply, setShowReply] = useState(false);

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
        <div className="flex flex-col border-l border-gray-200 pl-4 mt-3">
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <img
                    src={comment.user?.avatar || "/avatar-default.svg"}
                    alt={comment.user?.fullName}
                    className="w-8 h-8 rounded-full object-cover mt-1"
                />

                <div className="flex-1">
                    {/* Name and timestamp */}
                    <div className="flex items-center gap-2">
                        <strong className="text-sm">{comment.user?.fullName}</strong>
                        <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>

                    {/* Comment content */}
                    <p className="text-sm mt-1">{renderContent(comment.content)}</p>

                    {/* Reply button */}
                    <button
                        onClick={() => setShowReply(!showReply)}
                        className={`text-xs mt-1 hover:underline ${showReply ? "text-red-500" : "text-blue-600"
                            }`}
                    >
                        {showReply ? "Cancel" : "Reply"}
                    </button>

                    {/* Nested replies */}
                    {comment.replies?.length > 0 && (
                        <div className="ml-6 mt-3 space-y-3">
                            {comment.replies.map((reply: any) => (
                                <CommentItem key={reply.id} comment={reply} users={users} onReply={onReply} />
                            ))}
                        </div>
                    )}

                    {showReply && (
                        <div className="ml-6 mt-2">
                            <CommentInput
                                users={users}
                                onSubmit={async (content, mentions) => onReply(content, mentions, comment.id)}
                                placeholder={`Reply to ${comment.user?.fullName}...`}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
