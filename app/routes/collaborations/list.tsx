import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "~/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Eye, PenBox, Trash2, Plus, Search, Ellipsis, AlertTriangle } from "lucide-react";
import { useLoaderData, useNavigate, useRouteLoaderData } from "react-router";
import { DynamicSelectFilter } from "~/components/dynamic-select-filter";
import { DeleteConfirmDialog } from "~/components/ui/confirm-dialog";
import { DynamicDateFilter } from "~/components/dynamic-date-filter";
import { CenterSpinner } from "~/components/ui/center-spinner";
import { StatusFilter } from "~/components/ui/status-filter";
import { PaginationBar } from "~/components/pagination-bar";
import { useState, useEffect, Suspense, lazy } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { prisma } from "~/lib/prisma.server";
import { toast } from "sonner";

const ViewCollaborationModal = lazy(() =>
    import("~/components/modals/view-collaboration-modal").then((m) => ({ default: m.ViewCollaborationModal }))
);

const EditCollaborationModal = lazy(() =>
    import("~/components/modals/edit-collaboration-modal").then((m) => ({ default: m.EditCollaborationModal }))
);

const AddCollaborationModal = lazy(() =>
    import("~/components/modals/add-collaboration-modal").then((m) => ({ default: m.AddCollaborationModal }))
);

export const meta = () => [{ title: "Collaborations | InkyBay" }];

export async function loader({ request }: any) {

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;
    const search = url.searchParams.get("search") || "";
    const searchLower = search.toLowerCase();

    const requestType = url.searchParams.get("requestType") || "";
    const completedDate = url.searchParams.get("completedDate");
    const completedDateStart = url.searchParams.get("completedDateStart");
    const completedDateEnd = url.searchParams.get("completedDateEnd");
    const createdAt = url.searchParams.get("createdAt");
    const createdAtStart = url.searchParams.get("createdAtStart");
    const createdAtEnd = url.searchParams.get("createdAtEnd");

    const statusId = url.searchParams.get("statusId");

    const where: any = search
        ? {
            OR: [
                { appName: { contains: searchLower } },
                { companyName: { contains: searchLower } },
                { appUrl: { contains: searchLower } },
                {
                    emails: {
                        some: {
                            email: { contains: searchLower },
                        },
                    },
                }
            ],
        }
        : {};

    if (requestType) {
        where.requestType = requestType;
    }

    if (completedDate) {
        const start = new Date(completedDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(completedDate);
        end.setHours(23, 59, 59, 999);

        where.completedDate = {
            gte: start,
            lt: end,
        };
    } else if (completedDateStart && completedDateEnd) {
        const start = new Date(completedDateStart);
        start.setHours(0, 0, 0, 0);

        const end = new Date(completedDateEnd);
        end.setHours(23, 59, 59, 999);

        where.completedDate = {
            gte: start,
            lt: end,
        };
    }

    if (createdAt) {
        const start = new Date(createdAt);
        start.setHours(0, 0, 0, 0);

        const end = new Date(createdAt);
        end.setHours(23, 59, 59, 999);

        where.createdAt = {
            gte: start,
            lt: end,
        };
    } else if (createdAtStart && createdAtEnd) {
        const start = new Date(createdAtStart);
        start.setHours(0, 0, 0, 0);

        const end = new Date(createdAtEnd);
        end.setHours(23, 59, 59, 999);

        where.createdAt = {
            gte: start,
            lt: end,
        };
    }


    if (statusId) {
        where.statusId = Number(statusId);
    }

    const [collaborations, total, colStatuses] = await Promise.all([
        prisma.collaborationApp.findMany({
            where,
            skip,
            take: limit,
            orderBy: { id: "desc" },
            include: {
                status: true,
                sendBy: true,
                addedBy: true,
                project: true,
                collaborationAreas: {
                    include: {
                        areaOption: true,
                    },
                },
            },
        }),
        prisma.collaborationApp.count({ where }),
        prisma.collaborationStatus.findMany({
            select: { id: true, name: true }
        })
    ]);

    return {
        collaborations,
        colStatuses,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            search,
            requestType,
            completedDate,
            completedDateStart,
            completedDateEnd,
            createdAt,
            createdAtStart,
            createdAtEnd,
            statusId
        },
    };
}

export default function CollaborationsListPage() {

    const { collaborations, meta, colStatuses } = useLoaderData<typeof loader>();
    const navigate = useNavigate();

    const [search, setSearch] = useState(meta.search ?? "");
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);

    const rootData = useRouteLoaderData("root") as any;
    const permissions = rootData?.permissions ?? [];
    const canView = permissions.includes("collaboration.view");
    const canEdit = permissions.includes("collaboration.edit");
    const canDelete = permissions.includes("collaboration.delete");
    const canCreate = permissions.includes("collaboration.create");

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

    const refreshPage = () => {
        navigateWithLoading(window.location.pathname + window.location.search);
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            const res = await fetch(`/api/collaborations/${selected.id}`, {
                method: "DELETE",
            });
            if (!res.ok) toast.error("Failed to delete collaboration.");
            toast.success("Collaboration deleted successfully.");
            refreshPage();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete collaboration.");
        }
    };

    useEffect(() => {
        if (loading) setLoading(false);
    }, [collaborations]);

    return (
        <div className="px-6 space-y-3">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Collaborations</h1>
                {
                    canCreate && (
                        <Button onClick={() => setAddModalOpen(true)}>
                            <Plus /> Add Collaboration
                        </Button>
                    )
                }
            </div>

            <div className="flex items-center justify-between">
                <div className="relative w-full sm:w-64">
                    <Input
                        placeholder="Search by App or Company..."
                        className="pr-10"
                        value={search}
                        onChange={handleSearchChange}
                    />
                    <Search className="size-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2" />
                </div>
                <div className="text-sm">Total: {meta.total}</div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>App Name</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <span>Status</span>
                                    <StatusFilter
                                        meta={meta}
                                        statuses={colStatuses}
                                        navigateWithLoading={navigateWithLoading}
                                    />
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <span>Completed Date</span>
                                    <DynamicDateFilter
                                        label="Completed Date"
                                        paramKey="completedDate"
                                        meta={meta}
                                        navigateWithLoading={navigateWithLoading}
                                    />
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <span>Request Type</span>
                                    <DynamicSelectFilter
                                        label="Request Type"
                                        paramKey="requestType"
                                        meta={meta}
                                        navigateWithLoading={navigateWithLoading}
                                        options={[
                                            { id: "Received", name: "Received" },
                                            { id: "Sent", name: "Sent" },
                                        ]}
                                    />
                                </div>
                            </TableHead>
                            <TableHead>Collaboration Areas</TableHead>
                            <TableHead>Added By</TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <span>Created At</span>
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
                                    collaborations.length > 0 ? (
                                        collaborations.map((c: any, i: number) => (
                                            <TableRow key={c.id}>
                                                <TableCell>{i + 1}</TableCell>
                                                <TableCell className="text-blue-500 hover:underline cursor-pointer"
                                                    onClick={() => {
                                                        setSelected(c);
                                                        setViewModalOpen(true);
                                                    }}
                                                >{c.appName}</TableCell>
                                                <TableCell>{c.companyName ?? "—"}</TableCell>
                                                <TableCell>{c.status?.name ?? "—"}</TableCell>
                                                <TableCell>{c.completedDate ? new Date(c.completedDate).toLocaleDateString() : 'N/A'}</TableCell>
                                                <TableCell>{c.requestType ?? "—"}</TableCell>
                                                <TableCell className="max-w-[200px] truncate">
                                                    {c.collaborationAreas.map((a: any) => <Badge variant="outline" className="ml-1">{a.areaOption.name}</Badge>) || "—"}
                                                </TableCell>
                                                <TableCell>{c.addedBy?.fullName ?? "—"}</TableCell>
                                                <TableCell>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
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
                                                                    setSelected(c);
                                                                    setViewModalOpen(true);
                                                                }}
                                                            >
                                                                <Eye /> View Details
                                                            </DropdownMenuItem>
                                                            {
                                                                canEdit && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setSelected(c);
                                                                            setEditModalOpen(true);
                                                                        }}
                                                                    >
                                                                        <PenBox /> Edit Collaboration
                                                                    </DropdownMenuItem>
                                                                )
                                                            }
                                                            {
                                                                canDelete && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            className="text-red-600"
                                                                            onClick={() => {
                                                                                setSelected(c);
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
                                            <TableCell colSpan={9} className="text-center py-50 text-muted-foreground">
                                                No collaborations found.
                                            </TableCell>
                                        </TableRow>
                                    )
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10}>
                                            <div className="flex flex-col items-center justify-center py-50 text-yellow-600">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5" />
                                                    <span>You don’t have permission to view collaborations data.</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            )
                        }
                    </TableBody>
                </Table>
                <PaginationBar meta={meta} onPageChange={handlePageChange} onLimitChange={handleLimitChange} />
            </div>

            {/* Modals */}
            {addModalOpen && (
                <Suspense fallback={<CenterSpinner />}>
                    <AddCollaborationModal open={addModalOpen} onOpenChange={setAddModalOpen} refreshPage={refreshPage} />
                </Suspense>
            )}
            {viewModalOpen && selected && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewCollaborationModal open={viewModalOpen} onOpenChange={setViewModalOpen} collaborationId={selected.id} />
                </Suspense>
            )}
            {editModalOpen && selected && (
                <Suspense fallback={<CenterSpinner />}>
                    <EditCollaborationModal
                        open={editModalOpen}
                        onOpenChange={setEditModalOpen}
                        collaborationId={selected.id}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}
            {deleteDialogOpen && selected && (
                <Suspense fallback={<CenterSpinner />}>
                    <DeleteConfirmDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        title="Delete Collaboration?"
                        description="Are you sure you want to permanently delete this collaboration record?"
                        onConfirm={handleDelete}
                    />
                </Suspense>
            )}
        </div>
    );
}
