import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface Comment {
    id?: number;
    content: string;
    userId: number;
    parentId?: number;
    replies?: Comment[];
}

interface CommentBoxProps {
    parentType: "task" | "chat";
    parentId?: number; // undefined for new parent
    currentUserId: number;
    existingComments?: Comment[];
    onCommentAdded?: (comment: Comment) => void;
    onDraftCommentsChange?: (drafts: Comment[]) => void;
}

export function CommentBox({
    parentType,
    parentId,
    currentUserId,
    existingComments = [],
    onCommentAdded,
    onDraftCommentsChange,
}: CommentBoxProps) {
    const [comments, setComments] = useState<Comment[]>(existingComments);
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [content, setContent] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [showMentions, setShowMentions] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [mentionQuery, setMentionQuery] = useState("");
    const editorRef = useRef<HTMLDivElement>(null);

    // Fetch users for mentions
    useEffect(() => {
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => setUsers(data.users));
    }, []);

    // Detect "@" mentions inside contenteditable
    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const text = editorRef.current?.innerText || "";
        setContent(text);

        const selection = window.getSelection();
        if (!selection) return;

        const cursorPos = selection.anchorOffset;
        const textUntilCursor = text.slice(0, cursorPos);
        const match = textUntilCursor.match(/@(\w*)$/);

        if (match) {
            setShowMentions(true);
            setMentionQuery(match[1]);
            setFilteredUsers(
                users.filter((u) =>
                    u.fullName.toLowerCase().includes(match[1].toLowerCase())
                )
            );
        } else {
            setShowMentions(false);
        }
    };

    // Insert mention as styled span
    const handleSelectMention = (user: any) => {
        const html = editorRef.current?.innerHTML || "";
        const newHtml = html.replace(/@(\w*)$/, `<span contenteditable="false" class="bg-blue-100 text-blue-700 px-1 rounded">@${user.fullName}</span>&nbsp;`);
        if (editorRef.current) editorRef.current.innerHTML = newHtml;
        setContent(editorRef.current?.innerText || "");
        setShowMentions(false);

        // Move cursor to end
        const range = document.createRange();
        const sel = window.getSelection();
        if (editorRef.current && sel) {
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
            editorRef.current.focus();
        }
    };

    const handleSubmit = async () => {
        if (!content.trim() || !parentId) return;

        const res = await fetch("/api/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content, userId: currentUserId, [parentType + "Id"]: parentId }),
        });
        if (res.ok) {
            const saved: Comment = await res.json();
            setComments([...comments, saved]);
            onCommentAdded?.(saved);
            if (editorRef.current) editorRef.current.innerHTML = "";
            setContent("");
            setReplyTo(null);
        }
    };

    const renderComments = (list: Comment[]) =>
        list.map((c) => (
            <div key={c.id ?? Math.random()} className="ml-4 mt-2">
                <div className="flex justify-between items-center">
                    <div>
                        <strong>User {c.userId}</strong>: {c.content}
                    </div>
                    <button
                        className="text-sm text-blue-600 ml-2"
                        onClick={() => setReplyTo(c.id!)}
                    >
                        Reply
                    </button>
                </div>
                {c.replies && c.replies.length > 0 && (
                    <div className="ml-4">{renderComments(c.replies)}</div>
                )}
            </div>
        ));

    return (
        <div className="relative w-full">
            <div
                ref={editorRef}
                onInput={handleInput}
                contentEditable
                className="border rounded p-2 min-h-[80px] focus:outline-none focus:ring focus:ring-blue-300"
                // placeholder={replyTo ? "Write a reply..." : "Write a comment... use @ to mention someone"}
            ></div>

            {/* Mentions dropdown */}
            {showMentions && (
                <div className="absolute z-50 bg-white border rounded-md shadow-md mt-1 max-h-40 overflow-y-auto w-full">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((u) => (
                            <div
                                key={u.id}
                                className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-blue-700 font-semibold rounded-sm"
                                onClick={() => handleSelectMention(u)}
                            >
                                @{u.fullName}
                            </div>
                        ))
                    ) : (
                        <div className="p-2 text-gray-500 text-sm">No matches</div>
                    )}
                </div>
            )}

            <div className="flex justify-between mt-2">
                {replyTo && (
                    <button
                        className="text-sm text-red-600"
                        onClick={() => setReplyTo(null)}
                    >
                        Cancel Reply
                    </button>
                )}
                {parentId && (
                    <Button onClick={handleSubmit} disabled={!content.trim()}>
                        {replyTo ? "Reply" : "Comment"}
                    </Button>
                )}
            </div>

            <div className="mt-4">{renderComments(comments)}</div>
        </div>
    );
}
