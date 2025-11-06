import { useState } from "react";
import { CommentInput } from "./CommentInput";
import { MentionTooltip } from "./MentionTooltip";

interface CommentItemProps {
    comment: any;
    users: any[];
    onReply: (content: string, mentions: number[], parentId: number) => void | Promise<void>;
}

export function CommentItem({ comment, users, onReply }: CommentItemProps) {
    const [showReply, setShowReply] = useState(false);

    const renderContent = (text: string) => {
        const parts = text.split(/(@\[([^\]]+)\]\((\d+)\))/g);
        return parts.map((part, i) => {
            const match = part.match(/@\[([^\]]+)\]\((\d+)\)/);
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
        <div className="border-l pl-3 mt-3">
            <div className="flex justify-between items-start">
                <div>
                    <strong>{comment.user.fullName}</strong>
                    <p className="text-sm">{renderContent(comment.content)}</p>
                </div>
                <button
                    onClick={() => setShowReply(!showReply)}
                    className="text-xs text-gray-500 hover:underline"
                >
                    Reply
                </button>
            </div>

            {showReply && (
                <div className="ml-6 mt-2">
                    <CommentInput
                        users={users}
                        onSubmit={async (c, m) => onReply(c, m, comment.id)}
                        placeholder={`Reply to ${comment.user.fullName}`}
                    />
                </div>
            )}

            {comment.replies?.map((reply: any) => (
                <CommentItem key={reply.id} comment={reply} users={users} onReply={onReply} />
            ))}
        </div>
    );
}
