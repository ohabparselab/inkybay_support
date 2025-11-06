import { MentionsInput, Mention } from "react-mentions";
import { useState } from "react";

interface CommentInputProps {
    onSubmit: (content: string, mentions: number[]) => Promise<void>;
    users: { id: number; fullName: string }[];
    placeholder?: string;
    value?: string;
    isSubmitting?: boolean;
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
            const mentionIds = extractMentions(content, users);
            await onSubmit(content, mentionIds);
            setContent("");
        }
    };

    return (
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
    );
}

function extractMentions(content: string, users: any[]) {
    const mentionIds: number[] = [];
    users.forEach((u) => {
        if (content.includes(`@${u.fullName}`)) mentionIds.push(u.id);
    });
    return mentionIds;
}

const mentionsInputStyle = {
    control: {
        backgroundColor: '#fff',
        fontSize: 14,
        fontWeight: 'normal',
    },

    '&multiLine': {
        control: {
            minHeight: 63,
        },
        highlighter: {
            padding: 9,
            border: '1px solid transparent',
        },
        input: {
            padding: 9,
            border: '1px solid silver',
        },
    },

    '&singleLine': {
        display: 'inline-block',
        width: 180,

        highlighter: {
            padding: 1,
            border: '2px inset transparent',
        },
        input: {
            padding: 1,
            border: '2px inset',
        },
    },

    suggestions: {
        list: {
            backgroundColor: 'white',
            border: '1px solid rgba(0,0,0,0.15)',
            fontSize: 14,
        },
        item: {
            padding: '5px 15px',
            borderBottom: '1px solid rgba(0,0,0,0.15)',
            '&focused': {
                backgroundColor: '#dcd7f7',
            },
        },
    }
}

const mentionStyle = {
    backgroundColor: '#dcd7f7',
};
