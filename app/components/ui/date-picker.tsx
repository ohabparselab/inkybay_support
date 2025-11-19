import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

interface DatePickerWithClearProps {
    value: Date | undefined;
    onChange: (date?: Date) => void;
    placeholder?: string;
}

export function DatePickerWithClear({ value, onChange, placeholder = "Pick a date" }: DatePickerWithClearProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative w-full">
                    <Button type="button" variant="outline" className="w-full justify-between text-left font-normal">
                        {value ? format(value, "PPP") : placeholder}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                    {value && (
                        <X
                            className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer opacity-70 hover:opacity-100"
                            onClick={(e) => {
                                e.stopPropagation(); 
                                onChange(undefined);
                            }}
                        />
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-0">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
