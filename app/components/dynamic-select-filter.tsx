import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DynamicFilterProps {
    /** Filter key in URL (e.g. "statusId", "installPhase") */
    paramKey: string;

    /** Current meta/query params */
    meta: Record<string, any>;

    /** Options list */
    options: { id: string | number | any; name: string }[];

    /** Callback for navigation (preserves query state) */
    navigateWithLoading: (url: string) => void;

    /** Optional label shown beside icon */
    label?: string;

    /** Optional URL param reset on change (e.g. "page") */
    resetParam?: string;
}

/**
 * Reusable dropdown filter for any query param.
 * - Auto highlights selected item
 * - Handles clear
 * - Works for any data key (paramKey)
 */
export function DynamicSelectFilter({
    paramKey,
    meta,
    options,
    navigateWithLoading,
    label,
    resetParam = "page",
}: DynamicFilterProps) {
    const selectedValue = meta[paramKey];

    const handleClear = () => {
        const params = new URLSearchParams(window.location.search);
        params.delete(paramKey);
        if (resetParam) params.set(resetParam, "1");
        navigateWithLoading(`?${params.toString()}`);
    };

    const handleValueChange = (value: string | number) => {
        const params = new URLSearchParams(window.location.search);
        const stringValue = String(value);

        // toggle if same value is clicked again
        if (selectedValue === stringValue) {
            params.delete(paramKey);
        } else {
            params.set(paramKey, stringValue);
        }

        if (resetParam) params.set(resetParam, "1");
        navigateWithLoading(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2 relative">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            selectedValue ? "text-blue-600" : "text-muted-foreground",
                            "h-6 w-6"
                        )}
                        title={label || "Filter"}
                    >
                        <Filter className="size-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="max-h-64 overflow-auto">
                    {options.map((opt) => {
                        const isSelected = String(opt.id) === selectedValue;
                        return (
                            <DropdownMenuItem
                                key={opt.id}
                                onClick={() => handleValueChange(opt.id)}
                                className={cn(isSelected && "bg-blue-100 text-blue-700")}
                            >
                                <span className="flex items-center justify-between w-full">
                                    {opt.name}
                                    {isSelected && <Check className="ml-2 h-4 w-4" />}
                                </span>
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>

            {selectedValue && (
                <p
                    className="text-xs cursor-pointer text-blue-700 hover:text-destructive"
                    onClick={handleClear}
                >
                    Clear
                </p>
            )}
        </div>
    );
}
