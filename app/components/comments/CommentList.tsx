import { useEffect, useState } from "react";
import { CommentItem } from "./CommentItem";
import { CommentInput } from "./CommentInput";
import { Label } from "../ui/label";

interface CommentListProps {
    contextId: number;
    contextType: "task" | "chat" | "community";
    users: any[];
}

export function CommentList({ contextId, contextType, users }: CommentListProps) {

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

    return (
        <div className="space-y-3">
            <div className="mt-4 space-y-3">
                {comments.map((c) => (
                    <CommentItem key={c.id} comment={c} users={users} onReply={addComment} />
                ))}
            </div>
            <CommentInput users={users} onSubmit={addComment} placeholder="Add a comment..." />
        </div>
    );
}
