import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "~/components/ui/table";
import {
    Eye,
    PenBox,
    Trash2,
    Search,
    Plus,
    Ellipsis,
    AlertTriangle,
} from "lucide-react";
import { DynamicDateFilter } from "~/components/dynamic-date-filter";
import { DeleteConfirmDialog } from "~/components/ui/confirm-dialog";
import { CenterSpinner } from "~/components/ui/center-spinner";
import { Suspense, lazy, useEffect, useState } from "react";
import { PaginationBar } from "~/components/pagination-bar";
import { useLoaderData, useNavigate, useRouteLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { prisma } from "~/lib/prisma.server";
import { toast } from "sonner";

const AddFeatureRequestModal = lazy(() =>
    import("~/components/modals/add-feature-modal").then((m) => ({
        default: m.AddFeatureRequestModal,
    }))
);

const EditFeatureRequestModal = lazy(() =>
    import("~/components/modals/edit-feature-modal").then((m) => ({
        default: m.EditFeatureRequestModal,
    }))
);

const ViewFeatureRequestModal = lazy(() =>
    import("~/components/modals/view-feature-modal").then((m) => ({
        default: m.FeatureRequestDetailsModal,
    }))
);

export const meta = () => [{ title: "Feature Requests | InkyBay" }];

export async function loader({ request }: any) {

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);
    const search = url.searchParams.get("search") || "";
    const skip = (page - 1) * limit;
    const searchLower = search.toLowerCase();

    const createdAt = url.searchParams.get("createdAt");
    const createdAtStart = url.searchParams.get("createdAtStart");
    const createdAtEnd = url.searchParams.get("createdAtEnd");

    const where: any = search
        ? {
            OR: [
                { shopUrl: { contains: searchLower } },
                { shopName: { contains: searchLower } },
                { featureDetails: { contains: searchLower } },
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

    const [features, total] = await Promise.all([
        prisma.featureRequest.findMany({
            where,
            skip,
            take: limit,
            orderBy: { id: "desc" },
            include: {
                chat: {
                    select:
                    {
                        shopName: true,
                        shopUrl: true
                    }
                },
                client: true,
                createdByUser: true,
            },
        }),
        prisma.featureRequest.count({ where }),
    ]);

    return {
        features,
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

//
// Page Component
//
export default function FeatureRequestListPage() {

    const navigate = useNavigate();
    const { features, meta } = useLoaderData<typeof loader>();
    const [search, setSearch] = useState(meta.search ?? "");
    const [loading, setLoading] = useState(true);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const rootData = useRouteLoaderData("root") as any;
    const permissions = rootData?.permissions ?? [];
    const canView = permissions.includes("feature.view");
    const canEdit = permissions.includes("feature.edit");
    const canDelete = permissions.includes("feature.delete");
    const canCreate = permissions.includes("feature.create");

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
    }, [features]);

    const refreshPage = () => {
        navigateWithLoading(window.location.pathname + window.location.search);
    };

    const handleDelete = async () => {
        if (!selectedFeature) return;
        try {
            const res = await fetch(`/api/features/${selectedFeature.id}`, {
                method: "DELETE",
            });
            if (!res.ok) toast.error("Failed to delete feature request.");
            toast.success("Feature Request deleted successfully.");
            refreshPage();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete feature request.");
        }
    };

    return (
        <div className="px-6 space-y-3">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Feature Requests</h1>
                {
                    canCreate && (
                        <Button onClick={() => setAddModalOpen(true)}>
                            <Plus /> Add Feature Request
                        </Button>
                    )
                }
            </div>

            <div className="flex items-center justify-between">
                <div className="relative w-full sm:w-64">
                    <Input
                        placeholder="Search feature requests..."
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
                            <TableHead>Shop URL</TableHead>
                            <TableHead>Feature Details</TableHead>
                            <TableHead>Added By</TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <span>Added Date</span>
                                    <DynamicDateFilter
                                        label="Added Date"
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
                                        <TableCell colSpan={9} className="py-4">
                                            <div className="animate-pulse h-5 bg-accent rounded" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                canView ? (
                                    features.length > 0 ? (
                                        features.map((fr: any, i: number) => (
                                            <TableRow key={fr.id}>
                                                <TableCell>{i + 1}</TableCell>
                                                <TableCell
                                                    className="text-blue-600 hover:underline cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedFeature(fr);
                                                        setViewModalOpen(true);
                                                    }}
                                                >
                                                    {fr.shopUrl || fr.client?.shopDomain || fr.chat?.shopUrl || "—"}
                                                </TableCell>
                                                <TableCell className="max-w-md truncate">
                                                    {fr.featureDetails ?? "—"}
                                                </TableCell>
                                                <TableCell>{fr.createdByUser?.fullName ?? "—"}</TableCell>
                                                <TableCell>
                                                    {new Date(fr.createdAt).toLocaleDateString()}
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
                                                                    setSelectedFeature(fr);
                                                                    setViewModalOpen(true);
                                                                }}
                                                            >
                                                                <Eye /> View Details
                                                            </DropdownMenuItem>
                                                            {
                                                                canEdit && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setSelectedFeature(fr);
                                                                            setEditModalOpen(true);
                                                                        }}
                                                                    >
                                                                        <PenBox /> Edit Feature
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
                                                                                setSelectedFeature(fr);
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
                                                No feature requests found.
                                            </TableCell>
                                        </TableRow>
                                    )
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9}>
                                            <div className="flex flex-col items-center justify-center py-50 text-yellow-600">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5" />
                                                    <span>You don’t have permission to view feature request data.</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            )
                        }
                    </TableBody>
                </Table>
                <PaginationBar
                    meta={meta}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange}
                />
            </div>

            {/* Modals */}
            {addModalOpen && (
                <Suspense fallback={<CenterSpinner />}>
                    <AddFeatureRequestModal
                        open={addModalOpen}
                        onOpenChange={setAddModalOpen}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}

            {viewModalOpen && selectedFeature && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewFeatureRequestModal
                        featureRequest={selectedFeature}
                        open={viewModalOpen}
                        onOpenChange={setViewModalOpen}
                    />
                </Suspense>
            )}

            {editModalOpen && selectedFeature && (
                <Suspense fallback={<CenterSpinner />}>
                    <EditFeatureRequestModal
                        featureRequest={selectedFeature}
                        open={editModalOpen}
                        onOpenChange={setEditModalOpen}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}

            {deleteDialogOpen && selectedFeature && (
                <Suspense fallback={<CenterSpinner />}>
                    <DeleteConfirmDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        title="Delete Feature Request?"
                        description="Are you sure you want to permanently delete this feature request? This action cannot be undone."
                        onConfirm={async () => handleDelete()}
                    />
                </Suspense>
            )}
        </div>
    );
}
