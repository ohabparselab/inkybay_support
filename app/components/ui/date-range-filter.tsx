import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface DateFilterProps {
    meta: any
    navigateWithLoading: (url: string) => void
}

export function DateAndDateRangeFilter({ meta, navigateWithLoading }: DateFilterProps) {

    const [date, setDate] = useState<Date | undefined>(
        meta.date ? new Date(meta.date) : undefined
    )

    const [range, setRange] = useState<DateRange | undefined>({
        from: meta.startDate ? new Date(meta.startDate) : undefined,
        to: meta.endDate ? new Date(meta.endDate) : undefined,
    })

    const handleSingleDate = (selectedDate: Date | undefined) => {
        setDate(selectedDate)
        const params = new URLSearchParams(window.location.search)
        if (selectedDate) {
            params.set("date", selectedDate.toISOString())
            params.delete("startDate")
            params.delete("endDate")
        } else {
            params.delete("date")
        }
        params.set("page", "1")
        navigateWithLoading(`?${params.toString()}`)
    }

    const handleRangePart = (key: "from" | "to", value: Date | undefined) => {
        setDate(undefined)
        const updatedRange = { ...range, [key]: value }
        setRange({
            from: updatedRange?.from ?? undefined,
            to: updatedRange?.to ?? undefined,
        })

        const params = new URLSearchParams(window.location.search)
        if (updatedRange.from)
            params.set("startDate", format(updatedRange.from, "yyyy-MM-dd"))
        else params.delete("startDate")

        if (updatedRange.to)
            params.set("endDate", format(updatedRange.to, "yyyy-MM-dd"))
        else params.delete("endDate")

        params.delete("date");
        navigateWithLoading(`?${params.toString()}`)
    }

    const handleClear = () => {
        setDate(undefined)
        setRange({ from: undefined, to: undefined })

        const params = new URLSearchParams(window.location.search)
        params.delete("date")
        params.delete("startDate")
        params.delete("endDate")
        params.set("page", "1")
        navigateWithLoading(`?${params.toString()}`)
    }

    return (
        <div className="flex items-center">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer">
                        <Filter
                            className={cn(
                                "size-4 transition-colors",
                                meta.date || meta.startDate || meta.endDate
                                    ? "text-blue-600"
                                    : "text-muted-foreground"
                            )}
                        />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[350px] mt-1.5">
                    <div className="flex justify-end mb-2">
                        {(date || range?.from || range?.to) && (
                            <p
                                className="h-7 px-2 test text-xs cursor-pointer text-blue-700 hover:text-destructive"
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
                                <PopoverContent
                                    side="bottom"
                                    align="start"
                                    sideOffset={6}
                                    avoidCollisions={true}
                                    collisionPadding={10}
                                    className="p-0 max-h-[50vh] overflow-y-auto"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={handleSingleDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* 📆 Date Range with Separate Pickers */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Date Range</Label>
                            <div className="flex items-center gap-2">
                                {/* FROM Picker */}
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
                                    <PopoverContent
                                        side="bottom"
                                        align="start"
                                        sideOffset={6}
                                        avoidCollisions={true}
                                        collisionPadding={10}
                                        className="p-0 max-h-[80vh] overflow-y-auto"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={range?.from}
                                            onSelect={(date) => handleRangePart("from", date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                <span className="text-muted-foreground">to</span>

                                {/* TO Picker */}
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
                                    <PopoverContent
                                        side="bottom"
                                        align="start"
                                        sideOffset={6}
                                        avoidCollisions={true}
                                        collisionPadding={10}
                                        className="p-0 max-h-[80vh] overflow-y-auto"
                                    >
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
