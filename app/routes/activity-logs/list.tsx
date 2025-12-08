import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "~/components/ui/dropdown-menu";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui/table";
import { Eye, Search, Ellipsis } from "lucide-react";
import { DynamicDateFilter } from "~/components/dynamic-date-filter";
import { CenterSpinner } from "~/components/ui/center-spinner";
import { Suspense, lazy, useEffect, useState } from "react";
import { PaginationBar } from "~/components/pagination-bar";
import { useLoaderData, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { prisma } from "~/lib/prisma.server";
import { format } from "date-fns";
import { generateActivityDescription } from "~/lib/helper.sever";

// Lazy-loaded modal
const ViewActivityLogModal = lazy(() =>
    import("~/components/modals/view-activity-log-modal").then((m) => ({
        default: m.ViewActivityLogModal,
    }))
);

export const meta = () => [{ title: "Activity Logs | InkyBay" }];

export async function loader({ request }: any) {

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);
    const search = url.searchParams.get("search") || "";
    const createdAt = url.searchParams.get("createdAt");
    const createdAtStart = url.searchParams.get("createdAtStart");
    const createdAtEnd = url.searchParams.get("createdAtEnd");

    const skip = (page - 1) * limit;
    const searchLower = search.toLowerCase();

    const where: any = search
        ? {
            OR: [
                { desc: { contains: searchLower } },
                { modelName: { contains: searchLower } },
                { action: { contains: searchLower } },
            ],
        }
        : {};

    if (createdAt) {
        const start = new Date(createdAt);
        start.setHours(0, 0, 0, 0);
        const end = new Date(createdAt);
        end.setHours(23, 59, 59, 999);
        where.createdAt = { gte: start, lt: end };
    } else if (createdAtStart && createdAtEnd) {
        const start = new Date(createdAtStart);
        start.setHours(0, 0, 0, 0);
        const end = new Date(createdAtEnd);
        end.setHours(23, 59, 59, 999);
        where.createdAt = { gte: start, lt: end };
    }

    const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
            where,
            skip,
            take: limit,
            orderBy: { id: "desc" },
            include: { user: { select: { fullName: true } } },
        }),
        prisma.activityLog.count({ where }),
    ]);

    return {
        logs,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            search,
            createdAt,
            createdAtStart,
            createdAtEnd,
        },
    };
}

export default function ActivityLogsPage() {

    const navigate = useNavigate();
    const { logs, meta } = useLoaderData<typeof loader>();
    const [search, setSearch] = useState(meta.search ?? "");
    const [loading, setLoading] = useState(true);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<any | null>(null);

    const navigateWithLoading = (url: string) => {
        setLoading(true);
        navigate(url, { replace: true });
    };

    const handleSearchChange = (e: any) => {
        const value = e.target.value;
        setSearch(value);
        clearTimeout((window as any)?._st);
        (window as any)._st = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            params.set("search", value);
            params.set("page", "1");
            navigateWithLoading(`?${params.toString()}`);
        }, 400);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", newPage.toString());
        navigateWithLoading(`?${params.toString()}`);
    };

    const handleLimitChange = (newLimit: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("limit", newLimit.toString());
        params.set("page", "1");
        navigateWithLoading(`?${params.toString()}`);
    };

    useEffect(() => {
        if (loading) setLoading(false);
    }, [logs]);

    return (
        <div className="px-6 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Activity Logs</h1>
            </div>

            {/* Search + Total */}
            <div className="flex items-center justify-between">
                <div className="relative w-full sm:w-64">
                    <Input
                        placeholder="Search activity logs..."
                        className="pr-10"
                        value={search}
                        onChange={handleSearchChange}
                    />
                    <Search className="size-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2" />
                </div>
                <div className="text-sm">Total: {meta.total}</div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Description</TableHead>
                            {/* <TableHead>User</TableHead> */}
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <span>Date & Time</span>
                                    <DynamicDateFilter
                                        label="Created At"
                                        paramKey="createdAt"
                                        meta={meta}
                                        navigateWithLoading={navigateWithLoading}
                                    />
                                </div>
                            </TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {logs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-50 text-muted-foreground">
                                    No activity logs found
                                </TableCell>
                            </TableRow>
                        )}

                        {logs.map((log: any, i: number) => (
                            <TableRow key={log.id}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{log.action || "—"}</p>
                                        {/* <p className="text-xs text-muted-foreground">
                                            {log.modelName ? `${log.modelName} #${log.recordId ?? ""}` : ""}
                                        </p> */}
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-sm break-words">{generateActivityDescription(log)}</TableCell>
                                {/* <TableCell>{log.user?.fullName || "—"}</TableCell> */}
                                <TableCell>
                                    {format(new Date(log.createdAt), "dd MMM yyyy, hh:mm a")}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Ellipsis />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setSelectedLog(log);
                                                    setViewModalOpen(true);
                                                }}
                                            >
                                                <Eye /> View Details
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <PaginationBar
                    meta={meta}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange}
                />
            </div>

            {/* View Details Modal */}
            {viewModalOpen && selectedLog && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewActivityLogModal
                        log={selectedLog}
                        open={viewModalOpen}
                        onOpenChange={setViewModalOpen}
                    />
                </Suspense>
            )}
        </div>
    );
}
