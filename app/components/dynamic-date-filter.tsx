import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Filter } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface DynamicDateFilterProps {
    label: string // 👈 e.g. "Created At", "Follow-up Date"
    paramKey: string // 👈 base param name like "createdAt" or "followUpDate"
    meta: Record<string, any>
    navigateWithLoading: (url: string) => void
}

export function DynamicDateFilter({
    label,
    paramKey,
    meta,
    navigateWithLoading,
}: DynamicDateFilterProps) {
    const singleKey = `${paramKey}`
    const fromKey = `${paramKey}Start`
    const toKey = `${paramKey}End`

    const [date, setDate] = useState<Date | undefined>(
        meta[singleKey] ? new Date(meta[singleKey]) : undefined
    )
    const [range, setRange] = useState<DateRange | undefined>({
        from: meta[fromKey] ? new Date(meta[fromKey]) : undefined,
        to: meta[toKey] ? new Date(meta[toKey]) : undefined,
    })

    const handleSingleDate = (selectedDate?: Date) => {
        setDate(selectedDate)
        const params = new URLSearchParams(window.location.search)

        if (selectedDate) {
            params.set(singleKey, format(selectedDate, "yyyy-MM-dd"))
            params.delete(fromKey)
            params.delete(toKey)
        } else {
            params.delete(singleKey)
        }

        params.set("page", "1")
        navigateWithLoading(`?${params.toString()}`)
    }

    const handleRangePart = (key: "from" | "to", value?: Date) => {
        setDate(undefined)
        const updatedRange:any = { ...range, [key]: value }
        setRange(updatedRange);

        const params = new URLSearchParams(window.location.search)
        if (updatedRange.from) params.set(fromKey, format(updatedRange.from, "yyyy-MM-dd"))
        else params.delete(fromKey)
        if (updatedRange.to) params.set(toKey, format(updatedRange.to, "yyyy-MM-dd"))
        else params.delete(toKey)

        params.delete(singleKey)
        navigateWithLoading(`?${params.toString()}`)
    }

    const handleClear = () => {
        setDate(undefined)
        setRange({ from: undefined, to: undefined })

        const params = new URLSearchParams(window.location.search)
        params.delete(singleKey)
        params.delete(fromKey)
        params.delete(toKey)
        params.set("page", "1")
        navigateWithLoading(`?${params.toString()}`)
    }

    return (
        <div className="flex items-center">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-6 w-6 cursor-pointer",
                            meta[singleKey] || meta[fromKey] || meta[toKey]
                                ? "text-blue-600"
                                : "text-muted-foreground"
                        )}
                        title={`Filter by ${label}`}
                    >
                        <Filter className="size-4" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[350px] mt-1.5">
                    <div className="flex justify-between items-center mb-2">
                        <Label className="font-semibold text-sm">{label}</Label>
                        {(date || range?.from || range?.to) && (
                            <p
                                className="text-xs cursor-pointer text-blue-700 hover:text-destructive"
                                onClick={handleClear}
                            >
                                Clear
                            </p>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* 📅 Single Date Picker */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Single Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={handleSingleDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* 📆 Date Range */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Date Range</Label>
                            <div className="flex items-center gap-2">
                                {/* FROM */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "flex-1 justify-start text-left font-normal",
                                                !range?.from && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {range?.from ? format(range.from, "LLL dd, y") : "From"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="start" className="p-0">
                                        <Calendar
                                            mode="single"
                                            selected={range?.from}
                                            onSelect={(date) => handleRangePart("from", date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                <span className="text-muted-foreground">to</span>

                                {/* TO */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "flex-1 justify-start text-left font-normal",
                                                !range?.to && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {range?.to ? format(range.to, "LLL dd, y") : "To"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="start" className="p-0">
                                        <Calendar
                                            mode="single"
                                            selected={range?.to}
                                            onSelect={(date) => handleRangePart("to", date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
