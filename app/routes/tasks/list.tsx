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
import { ChevronLeft, ChevronRight, Ellipsis, Eye, PenBox, Plus, Search } from "lucide-react";
import { useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router";
import { CenterSpinner } from "~/components/ui/center-spinner";
import { lazy, Suspense, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { prisma } from "~/lib/prisma.server";

const AddTaskModal = lazy(() =>
    import("~/components/modals/add-task-modal").then((m) => ({ default: m.AddTaskModal }))
);

const ViewTaskDetailsModal = lazy(() =>
    import("~/components/modals/view-task-modal").then((m) => ({ default: m.ViewTaskDetailsModal }))
);

const EditTaskModal = lazy(() =>
    import("~/components/modals/edit-task-modal").then((m) => ({ default: m.EditTaskModal }))
);

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);
    const search = url.searchParams.get("search") || "";
    const skip = (page - 1) * limit;
    const searchLower = search.toLowerCase();


    const where = search
        ? {
            OR: [
                { client: { shopDomain: { contains: searchLower } } },
                { client: { shopName: { contains: searchLower } } },
                { client: { email: { contains: searchLower } } },
                { taskDetails: { contains: searchLower } },
                { providedByUser: { fullName: { contains: searchLower } } },
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
                client: {
                    select: {
                        id: true, shopDomain: true, shopName: true,
                        clientEmail: {
                            select: { id: true, email: true },
                        },
                    },
                },
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
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [viewTaskModalOpen, setViewTaskModalOpen] = useState(false);
    const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
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

    const refreshPage = () => {
        navigate(window.location.pathname + window.location.search, { replace: true });
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
                                <TableHead>Shop Name</TableHead>
                                <TableHead>Task Details</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Provided By</TableHead>
                                <TableHead>Solved By</TableHead>
                                <TableHead>Store Access</TableHead>
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
                                        <TableCell>{task.client.shopName}</TableCell>
                                        <TableCell className="max-w-[20px] truncate">{task.taskDetails}</TableCell>
                                        <TableCell>{task.client?.shopName ?? "—"}</TableCell>
                                        <TableCell>{task.providedByUser?.fullName ?? "—"}</TableCell>
                                        <TableCell>{task.solvedByUser?.fullName ?? "—"}</TableCell>
                                        <TableCell>{task.storeAccess == 'given' ? "Given" : ' Not Necessary'}</TableCell>
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
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedTask(task);
                                                        setViewTaskModalOpen(true);
                                                    }}>
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
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedTask(task);
                                                            setEditTaskModalOpen(true);
                                                        }}
                                                    >
                                                        <PenBox /> Edit Task
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
                <Suspense fallback={<CenterSpinner />}>
                    <AddTaskModal clientId={selectedClientId} open={taskModalOpen} onOpenChange={setTaskModalOpen} />
                </Suspense>
            )}

            {/* View Task Modal */}
            {viewTaskModalOpen && selectedTask && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewTaskDetailsModal
                        task={selectedTask}
                        open={viewTaskModalOpen}
                        onOpenChange={setViewTaskModalOpen}
                    />
                </Suspense>
            )}
            {/* Edit Task Modal */}
            {editTaskModalOpen && selectedTask && (
                <Suspense fallback={<CenterSpinner />}>
                    <EditTaskModal
                        task={selectedTask}
                        open={editTaskModalOpen}
                        onOpenChange={setEditTaskModalOpen}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}
        </div>
    );
}
