import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
import { useLoaderData, useNavigate, useRouteLoaderData, type LoaderFunctionArgs } from "react-router";
import { AlertTriangle, Ellipsis, Eye, Filter, PenBox, Plus, Search, Trash2 } from "lucide-react";
import { DateAndDateRangeFilter } from "~/components/ui/date-range-filter";
import { DeleteConfirmDialog } from "~/components/ui/confirm-dialog";
import { CenterSpinner } from "~/components/ui/center-spinner";
import { StatusFilter } from "~/components/ui/status-filter";
import { PaginationBar } from "~/components/pagination-bar";
import { lazy, Suspense, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { prisma } from "~/lib/prisma.server";
import { toast } from "sonner";

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

    const date = url.searchParams.get("date");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const statusId = url.searchParams.get("statusId");

    const where: any = search
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

    if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        where.taskAddedDate = {
            gte: start,
            lt: end,
        };
    } else if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        where.taskAddedDate = {
            gte: start,
            lt: end,
        };
    }

    if (statusId) {
        where.statusId = Number(statusId);
    }

    const [tasks, total, statuses] = await Promise.all([
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
                project: { select: { id: true, name: true } },
            },
        }),
        prisma.task.count({ where }),
        prisma.status.findMany({
            select: { id: true, name: true }
        })
    ]);


    return {
        tasks,
        statuses,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            search,
            date,
            startDate,
            endDate,
            statusId
        },
    };
}

export const meta = () => [{ title: "Tasks | InkyBay" }];

export default function TasksListPage() {

    const [loading, setLoading] = useState(true);
    const { tasks, meta, statuses } = useLoaderData<typeof loader>();
    const [search, setSearch] = useState(meta.search ?? "");
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [viewTaskModalOpen, setViewTaskModalOpen] = useState(false);
    const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const navigate = useNavigate();

    const rootData = useRouteLoaderData("root") as any;
    const permissions = rootData?.permissions ?? [];
    const canView = permissions.includes("tasks.view");
    const canEdit = permissions.includes("tasks.edit");
    const canDelete = permissions.includes("tasks.delete");
    const canCreate = permissions.includes("tasks.create");

    const navigateWithLoading = (url: string) => {
        setLoading(true);
        navigate(url, { replace: true });
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", newPage.toString());
        navigateWithLoading(`?${params.toString()}`);
    };

    const handleLimitChange = (newLimit: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("limit", newLimit.toString());
        params.set("page", "1"); // reset to first page
        navigateWithLoading(`?${params.toString()}`);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        clearTimeout((window as any)._searchTimeout);
        (window as any)._searchTimeout = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            params.set("search", value);
            params.set("page", "1");
            navigateWithLoading(`?${params.toString()}`);
        }, 400);
    };

    const handleDelete = async () => {
        if (!selectedTask) return;

        try {
            const res = await fetch(`/api/tasks/${selectedTask.id}`, {
                method: "DELETE",
            });
            if (!res.ok) toast.error("Failed to delete task");
            toast.success("Task deleted successfully.");
            refreshPage()
        } catch (err: any) {
            toast.error(err.message || "Failed to delete task.");
        }
    }

    const refreshPage = () => {
        navigateWithLoading(window.location.pathname + window.location.search);
    };

    useEffect(() => {
        if (loading) setLoading(false);
    }, [tasks]);

   
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
                                <TableHead>Shop URL</TableHead>
                                {/* <TableHead>Task Details</TableHead> */}
                                <TableHead>Provided By</TableHead>
                                <TableHead>Solved By</TableHead>
                                <TableHead>Store Access</TableHead>
                                <TableHead>Store Password</TableHead>
                                <TableHead>
                                    <div className="flex items-center gap-2">
                                        <span>Status</span>
                                        <StatusFilter
                                            meta={meta}
                                            statuses={statuses}
                                            navigateWithLoading={navigateWithLoading}
                                        />
                                    </div>
                                </TableHead>

                                <TableHead>
                                    <div className="flex items-center gap-2">
                                        <span>Task Added </span>
                                        <DateAndDateRangeFilter
                                            meta={meta}
                                            navigateWithLoading={navigateWithLoading}
                                        />
                                    </div>
                                </TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                loading ? (
                                    Array.from({ length: 10 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={10} className="py-4">
                                                <div className="animate-pulse h-5 bg-accent rounded" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    canView ? (
                                        tasks.length > 0 ? (
                                            tasks.map((task, idx) => (
                                                <TableRow key={task.id}>
                                                    <TableCell>{idx + 1}</TableCell>
                                                    <TableCell
                                                        className="hover:underline text-blue-700 cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedTask(task);
                                                            setViewTaskModalOpen(true);
                                                        }}

                                                    >
                                                        {task.client?.shopDomain?.split(".")[0]}
                                                    </TableCell>
                                                    {/* <TableCell className="max-w-[20px] truncate">{task.taskDetails}</TableCell> */}
                                                    <TableCell>{task.providedByUser?.fullName ?? "—"}</TableCell>
                                                    <TableCell>{task.solvedByUser?.fullName ?? "—"}</TableCell>
                                                    <TableCell>{task.storeAccess == 'given' ? "Given" : ' Not Necessary'}</TableCell>
                                                    <TableCell>{task.storePassword}</TableCell>
                                                    <TableCell>{task.status?.name ?? "—"}</TableCell>
                                                    <TableCell>
                                                        {task.taskAddedDate
                                                            ? new Date(task.taskAddedDate).toLocaleDateString()
                                                            : "—"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="cursor-pointer" size="icon">
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
                                                                {
                                                                    canCreate && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setSelectedClientId(task.clientId);
                                                                                setTaskModalOpen(true);
                                                                                setSelectedTask(task);
                                                                            }}
                                                                        >
                                                                            <Plus /> Add Task
                                                                        </DropdownMenuItem>
                                                                    )
                                                                }
                                                                {
                                                                    canEdit && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setSelectedTask(task);
                                                                                setEditTaskModalOpen(true);
                                                                            }}
                                                                        >
                                                                            <PenBox /> Edit Task
                                                                        </DropdownMenuItem>
                                                                    )
                                                                }
                                                                {
                                                                    canDelete && (
                                                                        <>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem
                                                                                variant="destructive"
                                                                                onClick={() => {
                                                                                    setSelectedTask(task);
                                                                                    setDeleteDialogOpen(true);
                                                                                }}
                                                                            >
                                                                                <Trash2 /> Delete
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )
                                                                }
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={10} className="text-center py-50 text-muted-foreground">
                                                    No tasks found.
                                                </TableCell>
                                            </TableRow>
                                        )
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={10}>
                                                <div className="flex flex-col items-center justify-center py-50 text-yellow-600">
                                                    <div className="flex items-center gap-2">
                                                        <AlertTriangle className="w-5 h-5" />
                                                        <span>You don't have permission view task data.</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                )
                            }
                        </TableBody>
                    </Table>
                    {/* Pagination */}
                    <PaginationBar
                        meta={meta}
                        onPageChange={handlePageChange}
                        onLimitChange={handleLimitChange}
                    />
                </div>


            </div>

            {/* Add Task Modal */}
            {taskModalOpen && selectedClientId && selectedTask && (
                <Suspense fallback={<CenterSpinner />}>
                    <AddTaskModal
                        clientId={selectedClientId}
                        open={taskModalOpen}
                        onOpenChange={setTaskModalOpen}
                        task={selectedTask}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}

            {/* View Task Modal */}
            {viewTaskModalOpen && selectedTask && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewTaskDetailsModal
                        taskId={selectedTask.id}
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
            {deleteDialogOpen && selectedTask && (
                <Suspense fallback={<CenterSpinner />}>
                    <DeleteConfirmDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        title="Delete Task?"
                        description="Are you sure you want to permanently delete this chat? This action cannot be undone."
                        onConfirm={async () => handleDelete()}
                    />
                </Suspense>
            )}
        </div>
    );
}
