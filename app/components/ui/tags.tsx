import { useState } from "react";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface TagsInputProps {
    control: any;
    name: string;
    label?: string;
}

export function TagsInput({ control, name }: TagsInputProps) {
    const [inputValue, setInputValue] = useState("");

    return (
        <Controller
            control={control}
            name={name as any}
            defaultValue={[] as any[]}
            render={({ field }) => {
                const tags = Array.isArray(field.value) ? field.value : [];

                return (
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 border rounded-md p-2 min-h-[44px]">
                            {tags.map((tag: string, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                                >
                                    <span>{tag}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newTags = tags.filter((_, i) => i !== index);
                                            field.onChange(newTags);
                                        }}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}

                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && inputValue.trim()) {
                                        e.preventDefault();
                                        if (!tags.includes(inputValue.trim())) {
                                            field.onChange([...tags, inputValue.trim()]);
                                        }
                                        setInputValue("");
                                    }
                                }}
                                placeholder="Type tag & press Enter..."
                                className="flex-1 border-none shadow-none focus:ring-0"
                            />
                        </div>
                    </div>
                );
            }}
        />
    );
}
