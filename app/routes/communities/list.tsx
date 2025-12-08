import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "~/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Eye, PenBox, Trash2, Plus, Search, Ellipsis, ExternalLink, AlertTriangle } from "lucide-react";
import { useLoaderData, useNavigate, useRouteLoaderData } from "react-router";
import { DeleteConfirmDialog } from "~/components/ui/confirm-dialog";
import { DynamicDateFilter } from "~/components/dynamic-date-filter";
import { CenterSpinner } from "~/components/ui/center-spinner";
import { PaginationBar } from "~/components/pagination-bar";
import { useState, useEffect, Suspense, lazy } from "react";
import { StatusFilter } from "~/components/ui/status-filter";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { prisma } from "~/lib/prisma.server";
import { toast } from "sonner";

const ViewCommunityModal = lazy(() =>
    import("~/components/modals/view-community-modal").then((m) => ({ default: m.ViewCommunityModal }))
);

const EditCommunityModal = lazy(() =>
    import("~/components/modals/edit-community-modal").then((m) => ({ default: m.EditCommunityModal }))
);

const AddCommunityModal = lazy(() =>
    import("~/components/modals/add-community-modal").then((m) => ({ default: m.AddCommunityModal }))
);

export const meta = () => [{ title: "Community Questions | InkyBay" }];

export async function loader({ request }: any) {

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;
    const search = url.searchParams.get("search") || "";
    const searchLower = search.toLowerCase();

    const statusId = url.searchParams.get("statusId");
    const listedDate = url.searchParams.get("listedDate");
    const listedDateStart = url.searchParams.get("listedDateStart");
    const listedDateEnd = url.searchParams.get("listedDateEnd");

    const where: any = search
        ? {
            OR: [
                { question: { contains: searchLower } },
                { questionUrl: { contains: searchLower } },
            ],
        }
        : {};

    if (statusId) where.statusId = Number(statusId);

    if (listedDate) {
        const start = new Date(listedDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(listedDate);
        end.setHours(23, 59, 59, 999);
        where.listedDate = { gte: start, lt: end };
    } else if (listedDateStart && listedDateEnd) {
        const start = new Date(listedDateStart);
        start.setHours(0, 0, 0, 0);
        const end = new Date(listedDateEnd);
        end.setHours(23, 59, 59, 999);
        where.listedDate = { gte: start, lt: end };
    }

    const [communities, total, statuses] = await Promise.all([
        prisma.community.findMany({
            where,
            skip,
            take: limit,
            orderBy: { id: "desc" },
            include: {
                project: true,
                addedBy: true,
                status: true,
            },
        }),
        prisma.community.count({ where }),
        prisma.communityStatus.findMany({ select: { id: true, name: true } }),
    ]);

    return {
        communities,
        statuses,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            search,
            statusId,
            listedDate,
            listedDateStart,
            listedDateEnd,
        },
    };
}

export default function CommunityListPage() {

    const { communities, statuses, meta } = useLoaderData<typeof loader>();
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
    const canView = permissions.includes("community.view");
    const canEdit = permissions.includes("community.edit");
    const canDelete = permissions.includes("community.delete");
    const canCreate = permissions.includes("community.create");

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
            const res = await fetch(`/api/communities/${selected.id}`, { method: "DELETE" });
            if (!res.ok) toast.error("Failed to delete question.");
            toast.success("Question deleted successfully.");
            refreshPage();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete question.");
        }
    };

    useEffect(() => {
        if (loading) setLoading(false);
    }, [communities]);

    return (
        <div className="px-6 space-y-3">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Community Questions</h1>
                {
                    canCreate && (
                        <Button onClick={() => setAddModalOpen(true)}>
                            <Plus /> Add Question
                        </Button>
                    )
                }
            </div>
            <div className="flex items-center justify-between">
                <div className="relative w-full sm:w-64">
                    <Input
                        placeholder="Search..."
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
                            <TableHead>Question</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Added By</TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <span>Status</span>
                                    <StatusFilter meta={meta} statuses={statuses} navigateWithLoading={navigateWithLoading} />
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <span>Listed Date</span>
                                    <DynamicDateFilter label="Listed Date" paramKey="listedDate" meta={meta} navigateWithLoading={navigateWithLoading} />
                                </div>
                            </TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={8} className="py-4">
                                            <div className="animate-pulse h-5 bg-accent rounded" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                canView ? (
                                    communities.length > 0 ? (
                                        communities.map((c: any, i: number) => (
                                            <TableRow key={c.id}>
                                                <TableCell>{i + 1}</TableCell>
                                                <TableCell className="text-blue-600 hover:underline cursor-pointer"
                                                    onClick={() => { setSelected(c); setViewModalOpen(true); }}
                                                >{c.question}</TableCell>
                                                <TableCell>{c.project?.name ?? "—"}</TableCell>
                                                <TableCell>{c.addedBy?.fullName ?? "—"}</TableCell>
                                                <TableCell>{c.status?.name ?? "—"}</TableCell>
                                                <TableCell>{c.listedDate ? new Date(c.listedDate).toLocaleDateString() : 'N/A'}</TableCell>
                                                <TableCell>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <Ellipsis />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => { setSelected(c); setViewModalOpen(true); }}>
                                                                <Eye /> View Details
                                                            </DropdownMenuItem>
                                                            {
                                                                canEdit && (
                                                                    <DropdownMenuItem onClick={() => { setSelected(c); setEditModalOpen(true); }}>
                                                                        <PenBox /> Edit Question
                                                                    </DropdownMenuItem>
                                                                )
                                                            }
                                                            {
                                                                canDelete && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem className="text-red-600" onClick={() => { setSelected(c); setDeleteDialogOpen(true); }}>
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
                                                No communities questions found.
                                            </TableCell>
                                        </TableRow>
                                    )
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                            <div className="flex flex-col items-center justify-center py-50 text-yellow-600">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5" />
                                                    <span>You don’t have permission to view communities questions data.</span>
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
                    <AddCommunityModal open={addModalOpen} onOpenChange={setAddModalOpen} refreshPage={refreshPage} />
                </Suspense>
            )}
            {viewModalOpen && selected && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewCommunityModal open={viewModalOpen} onOpenChange={setViewModalOpen} communityId={selected.id} />
                </Suspense>
            )}
            {editModalOpen && selected && (
                <Suspense fallback={<CenterSpinner />}>
                    <EditCommunityModal open={editModalOpen} onOpenChange={setEditModalOpen} community={selected} refreshPage={refreshPage} />
                </Suspense>
            )}
            {deleteDialogOpen && selected && (
                <Suspense fallback={<CenterSpinner />}>
                    <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Delete Question?" description="Are you sure you want to permanently delete this question?" onConfirm={handleDelete} />
                </Suspense>
            )}
        </div>
    );
}
