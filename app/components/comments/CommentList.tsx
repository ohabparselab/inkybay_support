import { useEffect, useState } from "react";
import { CommentItem } from "./CommentItem";
import { CommentInput } from "./CommentInput";
import { toast } from "sonner";

interface CommentListProps {
    currentUserId: number;
    contextId: number;
    contextType: "task" | "chat" | "community";
    users: any[];
}

export function CommentList({ contextId, contextType, users, currentUserId }: CommentListProps) {

    const [comments, setComments] = useState<any[]>([]);

    const fetchComments = async () => {
        const res = await fetch(`/api/comments?type=${contextType}&id=${contextId}`);
        const data = await res.json();
        if (data.success) setComments(data.comments);
    };

    useEffect(() => {
        fetchComments();
    }, [contextId]);

    const addComment = async (content: string, mentions: number[], parentId?: number) => {
        const res = await fetch("/api/comments", {
            method: "POST",
            body: JSON.stringify({
                content,
                mentions,
                parentId,
                [`${contextType}Id`]: contextId,
            }),
        });
        const data = await res.json();
        if (data.success) fetchComments();
    };

    const editComment = async (commentId: number, content: string, mentions: number[]) => {
        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, mentions }),
            });
            const data = await res.json();
            if (!data.success) toast.error('Failed to update comment');
            if (data.success) fetchComments();
        } catch (err: any) {
            console.error("Failed to edit comment:", err);
            toast.error('Failed to edit comment, please again.');
        }
    };

    return (
        <div className="space-y-3">
            <div className="mt-4 space-y-3">
                {comments.map((c) => (
                    <CommentItem
                        key={c.id}
                        comment={c}
                        users={users}
                        currentUserId={currentUserId}
                        onReply={addComment}
                        onEdit={editComment}
                    />

                ))}
            </div>
            <CommentInput users={users} onSubmit={addComment} placeholder="Add a comment..." />
        </div>
    );
}
