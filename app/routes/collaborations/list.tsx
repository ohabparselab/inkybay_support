import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "~/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Eye, PenBox, Trash2, Plus, Search, Ellipsis } from "lucide-react";
import { DeleteConfirmDialog } from "~/components/ui/confirm-dialog";
import { CenterSpinner } from "~/components/ui/center-spinner";
import { PaginationBar } from "~/components/pagination-bar";
import { useState, useEffect, Suspense, lazy } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { prisma } from "~/lib/prisma.server";
import { toast } from "sonner";

// const ViewCollaborationModal = lazy(() =>
//     import("~/components/modals/view-collaboration-modal").then((m) => ({ default: m.ViewCollaborationModal }))
// );

// const EditCollaborationModal = lazy(() =>
//     import("~/components/modals/edit-collaboration-modal").then((m) => ({ default: m.EditCollaborationModal }))
// );

// const AddCollaborationModal = lazy(() =>
//     import("~/components/modals/add-collaboration-modal").then((m) => ({ default: m.AddCollaborationModal }))
// );

export const meta = () => [{ title: "Collaborations | InkyBay" }];

export async function loader({ request }: any) {

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);
    const search = url.searchParams.get("search") || "";
    const skip = (page - 1) * limit;
    const searchLower = search.toLowerCase();

    const where: any = search
        ? {
            OR: [
                { appName: { contains: searchLower, mode: "insensitive" } },
                { companyName: { contains: searchLower, mode: "insensitive" } },
                { appUrl: { contains: searchLower, mode: "insensitive" } },
            ],
        }
        : {};

    const [collaborations, total] = await Promise.all([
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
    ]);

    return {
        collaborations,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            search,
        },
    };
}

export default function CollaborationsListPage() {
    
    const { collaborations, meta } = useLoaderData<typeof loader>();
    const navigate = useNavigate();

    const [search, setSearch] = useState(meta.search ?? "");
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);

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
                <Button onClick={() => setAddModalOpen(true)}>
                    <Plus /> Add Collaboration
                </Button>
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
                            <TableHead>Status</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Request Type</TableHead>
                            <TableHead>Collaboration Areas</TableHead>
                            <TableHead>Added By</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {collaborations.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-50 text-muted-foreground">
                                    No collaborations found
                                </TableCell>
                            </TableRow>
                        )}

                        {collaborations.map((c: any, i: number) => (
                            <TableRow key={c.id}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>{c.appName}</TableCell>
                                <TableCell>{c.companyName ?? "—"}</TableCell>
                                <TableCell>{c.status?.name ?? "—"}</TableCell>
                                <TableCell>{c.project?.name ?? "—"}</TableCell>
                                <TableCell>{c.requestType ?? "—"}</TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                    {c.collaborationAreas.map((a: any) => a.areaOption.name).join(", ") || "—"}
                                </TableCell>
                                <TableCell>{c.addedBy?.fullName ?? "—"}</TableCell>

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
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setSelected(c);
                                                    setEditModalOpen(true);
                                                }}
                                            >
                                                <PenBox /> Edit
                                            </DropdownMenuItem>
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
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <PaginationBar meta={meta} onPageChange={handlePageChange} onLimitChange={handleLimitChange} />
            </div>

            {/* Modals */}
            {/* {addModalOpen && (
                <Suspense fallback={<CenterSpinner />}>
                    <AddCollaborationModal open={addModalOpen} onOpenChange={setAddModalOpen} refreshPage={refreshPage} />
                </Suspense>
            )}
            {viewModalOpen && selected && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewCollaborationModal open={viewModalOpen} onOpenChange={setViewModalOpen} collaboration={selected} />
                </Suspense>
            )}
            {editModalOpen && selected && (
                <Suspense fallback={<CenterSpinner />}>
                    <EditCollaborationModal
                        open={editModalOpen}
                        onOpenChange={setEditModalOpen}
                        collaboration={selected}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )} */}
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
