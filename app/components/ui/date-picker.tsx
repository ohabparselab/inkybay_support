import { useState, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

interface DatePickerWithClearProps {
    value: Date | undefined;
    onChange: (date: Date | undefined) => void;
    placeholder?: string;
}

export function DatePickerWithClear({ value, onChange, placeholder = "Pick a date" }: DatePickerWithClearProps) {
    // Local state to prevent RHF from restoring old values
    const [localValue, setLocalValue] = useState<Date | undefined>(value);

    // Update when parent changes (initial load or reset)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleSelect = (date: Date | undefined) => {
        setLocalValue(date);
        onChange(date);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLocalValue(undefined);
        onChange(undefined);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative w-full">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between text-left font-normal"
                    >
                        {localValue ? format(localValue, "PPP") : placeholder}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>

                    {localValue && (
                        <X
                            className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer 
                                       opacity-70 hover:opacity-100 rounded-full"
                            onClick={handleClear}
                        />
                    )}
                </div>
            </PopoverTrigger>

            <PopoverContent align="start" className="p-0">
                <Calendar
                    mode="single"
                    selected={localValue}
                    onSelect={handleSelect}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
