"use client";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Option {
    label: string;
    value: string;
}

interface MultiSelectProps {
    options: Option[];
    value: string[] | undefined;
    onChange: (value: string[]) => void;
    placeholder?: string;
}

export function MultiSelect({
    options,
    value = [],
    onChange,
    placeholder = "Select...",
}: MultiSelectProps) {
    const selected = value || [];

    const toggle = (val: string) => {
        if (selected.includes(val)) {
            onChange(selected.filter((v) => v !== val));
        } else {
            onChange([...selected, val]);
        }
    };

    const clearAll = () => onChange([]);

    return (
        <div className="w-full">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full h-auto justify-between flex flex-wrap items-center"
                    >
                        <div className="flex gap-2 flex-wrap">
                            {value?.length === 0 ? (
                                <span className="text-muted-foreground">{placeholder}</span>
                            ) : (
                                selected?.map((v) => {
                                    const item = options.find((o) => o.value === v);
                                    return (
                                        <Badge
                                            key={v}
                                            variant="secondary"
                                            className="flex items-center"
                                        >
                                            {item?.label}
                                            <p
                                                className="cursor-pointer text-red-500"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    toggle(v);
                                                }}
                                            ><X className="h-3 w-3" /> </p>
                                        </Badge>
                                    );
                                })
                            )}
                        </div>
                        {/* {value && value.length > 0 && (
                            <p
                                className="cursor-pointer text-red-500"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    clearAll();
                                }}
                            ><X className="h-4 w-4" /></p>
                        )} */}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-2">
                    {options
                        .filter((o) => !selected?.includes(o.value))
                        .map((o) => (
                            <div
                                key={o.value}
                                className="w-full flex items-center py-1 cursor-pointer hover:bg-accent rounded"
                                onClick={() => toggle(o.value)}
                            >
                                <span className="px-2">{o.label}</span>
                            </div>
                        ))}

                    {options.filter((o) => !selected?.includes(o.value)).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                            No more users
                        </p>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
}
