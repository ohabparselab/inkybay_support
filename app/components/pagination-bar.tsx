import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
} from "@tabler/icons-react";

interface PaginationMeta {
    page: number;
    totalPages: number;
    limit: number;
}

interface PaginationBarProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
}

export function PaginationBar({ meta, onPageChange, onLimitChange }: PaginationBarProps) {
    return (
        <div className="flex items-center justify-between px-4 py-3 border-t">
            {/* Left text info */}
            <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                Page {meta.page} of {meta.totalPages}
            </div>

            {/* Pagination controls */}
            <div className="flex w-full items-center gap-8 lg:w-fit">
                {/* Rows per page selector */}
                {onLimitChange && (
                    <div className="hidden items-center gap-2 lg:flex">
                        <Label htmlFor="rows-per-page" className="text-sm font-medium">
                            Rows per page
                        </Label>
                        <Select
                            value={`${meta.limit}`}
                            onValueChange={(value) => onLimitChange(Number(value))}
                        >
                            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                <SelectValue placeholder={meta.limit} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Page counter */}
                <div className="flex w-fit items-center justify-center text-sm font-medium">
                    Page {meta.page} of {meta.totalPages}
                </div>

                {/* Buttons */}
                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => onPageChange(1)}
                        disabled={meta.page <= 1}
                    >
                        <span className="sr-only">Go to first page</span>
                        <IconChevronsLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => onPageChange(meta.page - 1)}
                        disabled={meta.page <= 1}
                    >
                        <span className="sr-only">Previous page</span>
                        <IconChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => onPageChange(meta.page + 1)}
                        disabled={meta.page >= meta.totalPages}
                    >
                        <span className="sr-only">Next page</span>
                        <IconChevronRight className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        className="hidden size-8 lg:flex"
                        size="icon"
                        onClick={() => onPageChange(meta.totalPages)}
                        disabled={meta.page >= meta.totalPages}
                    >
                        <span className="sr-only">Go to last page</span>
                        <IconChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
