import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Filter, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusFilterProps {
    meta: any
    statuses: { id: number; name: string }[]
    navigateWithLoading: (url: string) => void
}

export function StatusFilter({ meta, statuses, navigateWithLoading }: StatusFilterProps) {

    const handleClear = () => {
        const params = new URLSearchParams(window.location.search)
        params.delete("statusId")
        params.set("page", "1")
        navigateWithLoading(`?${params.toString()}`)
    }

    const handleStatusChanges = (sId: number) => {
        const params = new URLSearchParams(window.location.search);
        if (meta.statusId === String(sId)) {
            params.delete("statusId");
        } else {
            params.set("statusId", String(sId))
        }
        params.set("page", "1");
        navigateWithLoading(`?${params.toString()}`);
    }

    return (
        <div className="flex items-center gap-2 relative">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            meta.statusId ? "text-blue-600" : "text-muted-foreground",
                            "h-6 w-6"
                        )}
                    >
                        <Filter className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 max-h-64 overflow-auto">
                    {statuses.map((s) => {
                        const isSelected = String(s.id) === meta.statusId
                        return (
                            <DropdownMenuItem
                                key={s.id}
                                className={cn(isSelected && "bg-blue-100 text-blue-700")}
                                onClick={() => handleStatusChanges(s.id)}
                            >
                                <span className="flex items-center justify-between w-full">
                                    {s.name}
                                    {isSelected && <Check className="ml-2 h-4 w-4" />}
                                </span>
                            </DropdownMenuItem>
                        )
                    })}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear filter */}
            {meta.statusId && (
                <p
                    className="text-xs cursor-pointer text-blue-700 hover:text-destructive"
                    onClick={handleClear}
                >
                    Clear
                </p>
            )}
        </div>
    )
}
