import { MentionsInput, Mention } from "react-mentions";
import { useState } from "react";
import { Send, SendHorizontal } from "lucide-react"; // optional icon (from lucide-react)

interface CommentInputProps {
    onSubmit: (content: string, mentions: number[]) => Promise<void>;
    users: { id: number; fullName: string }[];
    placeholder?: string;
    value?: string;
    isSubmitting?: boolean;
    sendButtonShow?: boolean;
    readOnly?: boolean;
    onChange?: (content: string, mentions: number[]) => void;
}

export function CommentInput({
    value,
    onChange,
    onSubmit,
    users = [],
    readOnly = false,
    placeholder = "Type a comment...",
    isSubmitting = false,
    sendButtonShow = true,
}: CommentInputProps) {

    const [content, setContent] = useState(value || "");

    const handleChange = (
        event: any,
        newValue: string,
        newPlainTextValue: string,
        mentions: any[]
    ) => {
        setContent(newValue);
        if (onChange) onChange(newValue, mentions.map((m) => Number(m.id)));
    };

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey && !readOnly) {
            e.preventDefault();
            await handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!content.trim()) return;
        const mentionIds = extractMentions(content);
        await onSubmit(content, mentionIds);
        setContent("");
    };

    return (
        <div className="flex items-center gap-2 mt-2">
            <div className="flex-1">
                <MentionsInput
                    value={content}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    allowSuggestionsAboveCursor={true}
                    disabled={readOnly}
                    className="react-mentions w-full"
                    style={mentionsInputStyle}
                >
                    <Mention
                        trigger="@"
                        data={users
                            .filter((u) => u && u.id != null && u.fullName)
                            .map((u) => ({ id: u.id, display: u.fullName }))}
                        displayTransform={(id, display) => `@${display}`}
                        appendSpaceOnAdd={true}
                        markup="@[__display__](__id__)"
                        style={mentionStyle}
                    />
                </MentionsInput>
            </div>

            {/* Send button */}


            {
                sendButtonShow && (
                    <button
                        onClick={handleSubmit}
                        disabled={readOnly || isSubmitting || !content.trim()}
                        className={`p-2 rounded-full transition ${content.trim()
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <SendHorizontal size={30} />
                    </button>
                )
            }


        </div>
    );
}

function extractMentions(content: string): number[] {
    const mentionIds: number[] = [];
    const mentionRegex = /@\[[^\]]+\]\((\d+)\)/g; // ✅ correct regex pattern
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
        mentionIds.push(Number(match[1]));
    }
    return mentionIds;
}

const mentionsInputStyle = {
    control: {
        backgroundColor: "transparent",
        fontSize: 14,
        fontWeight: "normal",
    },

    "&multiLine": {
        control: {
            minHeight: 63,
        },
        highlighter: {
            padding: 20,
            border: "1px solid transparent",
        },
        input: {
            padding: 20,
            border: "1px solid silver",
            borderRadius: "50px",
        },
    },

    "&singleLine": {
        display: "inline-block",
        width: 180,

        highlighter: {
            padding: 1,
            border: "2px inset transparent",
        },
        input: {
            padding: 1,
            border: "2px inset",
        },
    },

    suggestions: {
        list: {
            backgroundColor: "white",
            border: "1px solid rgba(0,0,0,0.15)",
            fontSize: 14,
        },
        item: {
            padding: "5px 15px",
            borderBottom: "1px solid rgba(0,0,0,0.15)",
            "&focused": {
                backgroundColor: "#dcd7f7",
            },
        },
    },
};

const mentionStyle = {
    backgroundColor: "#dcd7f7",
};
