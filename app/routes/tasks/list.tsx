import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { ChevronLeft, ChevronRight, Ellipsis, Eye, Plus, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router";
import { prisma } from "~/lib/prisma.server";
import { lazy, Suspense, useState } from "react";
import { CenterSpinner } from "~/components/ui/center-spinner";

const AddTaskModal = lazy(() =>
    import("~/components/modals/add-task-modal").then((m) => ({ default: m.AddTaskModal }))
);

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);
    const search = url.searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where = search
        ? {
            OR: [
                { taskDetails: { contains: search, mode: "insensitive" } },
                { taskStatus: { contains: search, mode: "insensitive" } },
                { client: { shopName: { contains: search, mode: "insensitive" } } },
                { providedByUser: { fullName: { contains: search, mode: "insensitive" } } },
            ],
        }
        : {};

    const [tasks, total] = await Promise.all([
        prisma.task.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                client: { select: { id: true, shopName: true, shopDomain: true } },
                providedByUser: { select: { id: true, fullName: true } },
                solvedByUser: { select: { id: true, fullName: true } },
                status: { select: { id: true, name: true } },
            },
        }),
        prisma.task.count({ where }),
    ]);

    return {
        tasks,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            search,
        },
    };
}

export default function TasksListPage() {
    const { tasks, meta } = useLoaderData<typeof loader>();
    const [search, setSearch] = useState(meta.search ?? "");
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const navigate = useNavigate();

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", newPage.toString());
        navigate(`?${params.toString()}`);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        clearTimeout((window as any)._searchTimeout);
        (window as any)._searchTimeout = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            params.set("search", value);
            params.set("page", "1");
            navigate(`?${params.toString()}`);
        }, 400);
    };

    return (
        <div className="px-6 space-y-2">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
            </div>

            <div className="w-full space-y-4">
                {/* Search + total */}
                <div className="flex items-center justify-between">
                    <div className="relative w-full sm:w-64">
                        <Input
                            placeholder="Search tasks..."
                            className="pr-10"
                            value={search}
                            onChange={handleSearchChange}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4 pointer-events-none" />
                    </div>
                    <div className="text-sm text-muted-foreground">Total: {meta.total}</div>
                </div>

                {/* Table */}
                <div className="rounded-md border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Task Details</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Provided By</TableHead>
                                <TableHead>Solved By</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Task Added</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.length > 0 ? (
                                tasks.map((task, idx) => (
                                    <TableRow key={task.id}>
                                        <TableCell>{idx + 1}</TableCell>
                                        <TableCell className="max-w-xs truncate">{task.taskDetails}</TableCell>
                                        <TableCell>{task.client?.shopName ?? "—"}</TableCell>
                                        <TableCell>{task.providedByUser?.fullName ?? "—"}</TableCell>
                                        <TableCell>{task.solvedByUser?.fullName ?? "—"}</TableCell>
                                        <TableCell>{task.status?.name ?? "—"}</TableCell>
                                        <TableCell>
                                            {task.taskAddedDate
                                                ? new Date(task.taskAddedDate).toLocaleDateString()
                                                : "—"}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Ellipsis />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => { }}>
                                                        <Eye /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedClientId(task.clientId);
                                                            setTaskModalOpen(true);
                                                        }}
                                                    >
                                                        <Plus /> Add Task
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                                        No tasks found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Page {meta.page} of {meta.totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(meta.page - 1)}
                            disabled={meta.page <= 1}
                        >
                            <ChevronLeft className="size-4 mr-1" /> Prev
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(meta.page + 1)}
                            disabled={meta.page >= meta.totalPages}
                        >
                            Next <ChevronRight className="size-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Add Task Modal */}
            {taskModalOpen && selectedClientId && (
                <Suspense fallback={<CenterSpinner/>}>
                    <AddTaskModal clientId={selectedClientId} open={taskModalOpen} onOpenChange={setTaskModalOpen} />
                </Suspense>
            )}
        </div>
    );
}
