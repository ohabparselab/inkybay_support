import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useLoaderData, useNavigate, useRouteLoaderData, type LoaderFunctionArgs } from "react-router";
import { AlertTriangle, Ellipsis, Eye, PenBox, Plus, Search, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { DeleteConfirmDialog } from "~/components/ui/confirm-dialog";
import { CenterSpinner } from "~/components/ui/center-spinner";
import { PaginationBar } from "~/components/pagination-bar";
import { lazy, Suspense, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { prisma } from "~/lib/prisma.server";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { DynamicSelectFilter } from "~/components/dynamic-select-filter";

const AddMarketingFunnelModal = lazy(() =>
    import("~/components/modals/add-marketing-funnel-modal").then((m) => ({ default: m.AddMarketingFunnelModal }))
);

const ViewMarketingFunnelDetailsModal = lazy(() =>
    import("~/components/modals/view-marketing-funnel-modal").then((m) => ({ default: m.ViewMarketingFunnelDetailsModal }))
);

const EditMarketingFunnelModal = lazy(() =>
    import("~/components/modals/edit-marketing-funnel-modal").then((m) => ({ default: m.EditMarketingFunnelModal }))
);

export const meta = () => [{ title: "Marketing Funnels | InkyBay" }];

export async function loader({ request }: LoaderFunctionArgs) {

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);
    const search = url.searchParams.get("search") || "";
    const skip = (page - 1) * limit;
    const searchLower = search.toLowerCase();

    const installPhase = url.searchParams.get("installPhase") || ""; // "install" | "uninstall" | ""
    const clientSuccessStatus = url.searchParams.get("clientSuccessStatus") || ""; // "1st" | "2nd" | ""
    const followUpStatus = url.searchParams.get("followUpStatus") || ""; // "1st" | "2nd" | ""

    const followUpDate = url.searchParams.get("followUpDate");
    const followUpStart = url.searchParams.get("followUpStart");
    const followUpEnd = url.searchParams.get("followUpEnd");

    const createdDate = url.searchParams.get("createdDate");
    const createdStart = url.searchParams.get("createdStart");
    const createdEnd = url.searchParams.get("createdEnd");

    // Build base filter
    const where: any = {
        currentPhase: true,
    };

    // Search filter
    if (search) {
        where.OR = [
            { client: { shopDomain: { contains: searchLower } } },
            { client: { shopName: { contains: searchLower } } },
            { client: { email: { contains: searchLower } } },
            { installPhase: { contains: searchLower } },
            { typeOfProducts: { contains: searchLower } },
        ];
    }

    // Install phase filter
    if (installPhase) {
        where.installPhase = installPhase;
    }

    // Install phase filter
    if (followUpStatus) {
        where.followUpStep = followUpStatus;
    }

    // Follow-up status filter
    if (clientSuccessStatus) {
        where.clientSuccessStatus = clientSuccessStatus;
    }

    // Follow-up date range filter
    if (followUpStart || followUpEnd) {
        where.followUpDate = {};
        if (followUpStart) where.followUpDate.gte = new Date(followUpStart);
        if (followUpEnd) where.followUpDate.lte = new Date(followUpEnd);
    }

    // Created at range filter
    if (createdStart || createdEnd) {
        where.createdAt = {};
        if (createdStart) where.createdAt.gte = new Date(createdStart);
        if (createdEnd) where.createdAt.lte = new Date(createdEnd);
    }


    const [funnels, total] = await Promise.all([
        prisma.marketingFunnel.findMany({
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
                }
            },
        }),
        prisma.marketingFunnel.count({ where }),
    ]);

    return {
        funnels,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            search,
            installPhase,
            followUpStatus,
            clientSuccessStatus,
            followUpDate,
            followUpStart,
            followUpEnd,
            createdDate,
            createdStart,
            createdEnd,
        },
    };
}

export default function MarketingFunnelListPage() {

    const [loading, setLoading] = useState(true);
    const { funnels, meta } = useLoaderData<typeof loader>();
    const [search, setSearch] = useState(meta.search ?? "");
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [addMarketingModalOpen, setAddMarketingModalOpen] = useState(false);
    const [selectedMarketingFunnel, setSelectedMarketingFunnel] = useState<any | null>(null);
    const [viewMarketingFunnelModalOpen, setViewMarketingFunnelModalOpen] = useState(false);
    const [editMarketingFunnelModalOpen, setEditMarketingFunnelModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const navigate = useNavigate();

    const rootData = useRouteLoaderData("root") as any;
    const permissions = rootData?.permissions ?? [];
    const canView = permissions.includes("marketing-funnels.view");
    const canEdit = permissions.includes("marketing-funnels.edit");
    const canDelete = permissions.includes("marketing-funnels.delete");
    const canCreate = permissions.includes("marketing-funnels.create");

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
        if (!selectedMarketingFunnel) return;

        try {
            const res = await fetch(`/api/marketing-funnels/${selectedMarketingFunnel.id}`, {
                method: "DELETE",
            });
            if (!res.ok) toast.error("Failed to delete task");
            toast.success("Task deleted successfully.");
            refreshPage();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete task.");
        }
    }

    const refreshPage = () => {
        navigateWithLoading(window.location.pathname + window.location.search);
    };

    useEffect(() => {
        if (loading) setLoading(false);
    }, [funnels]);

    const generateFollowUpOptions = (count = 20) => {
        const suffix = (n: number) => {
            if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
            if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
            if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
            return `${n}th`;
        };

        return Array.from({ length: count }, (_, i) => {
            const label = suffix(i + 1);
            return { id: label, name: label };
        });
    }

    return (
        <div className="px-6 space-y-2">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Marketing Funnels</h1>
            </div>

            <div className="w-full space-y-4">
                {/* Search + Total */}
                <div className="flex items-center justify-between">
                    <div className="relative w-full sm:w-64">
                        <Input
                            placeholder="Search marketing funnels..."
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
                                <TableHead>
                                    <div className="flex items-center gap-2">
                                        <span>Install Phase</span>
                                        <DynamicSelectFilter
                                            label="Install Phase"
                                            paramKey="installPhase"
                                            meta={meta}
                                            navigateWithLoading={navigateWithLoading}
                                            options={[
                                                { id: "install", name: "Install" },
                                                { id: "uninstall", name: "Uninstall" },
                                            ]}
                                        />
                                    </div>
                                </TableHead>
                                <TableHead>

                                    <div className="flex items-center gap-2">
                                        <span>Follow-up Status</span>
                                        <DynamicSelectFilter
                                            label="Follow-up Status"
                                            paramKey="followUpStatus"
                                            meta={meta}
                                            navigateWithLoading={navigateWithLoading}
                                            options={generateFollowUpOptions(20)}
                                        />
                                    </div>
                                </TableHead>
                                <TableHead>Follow-up Date</TableHead>
                                <TableHead>
                                    <div className="flex items-center gap-2">
                                        <span>Client Success</span>
                                        <DynamicSelectFilter
                                            label="Client Success"
                                            paramKey="clientSuccessStatus"
                                            meta={meta}
                                            navigateWithLoading={navigateWithLoading}
                                            options={[
                                                { id: "yes", name: "Yes" },
                                                { id: "no", name: "No" },
                                            ]}
                                        />
                                    </div>
                                </TableHead>
                                <TableHead>Initial Feedback</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                loading ? (
                                    Array.from({ length: 9 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={9} className="py-4">
                                                <div className="animate-pulse h-5 bg-accent rounded" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    canView ? (
                                        funnels.length > 0 ? (
                                            funnels.map((funnel: any, idx) => (
                                                <TableRow key={funnel.id}>
                                                    <TableCell>{idx + 1}</TableCell>
                                                    <TableCell
                                                        className="hover:underline text-blue-700 cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedMarketingFunnel(funnel);
                                                            setViewMarketingFunnelModalOpen(true);
                                                        }}
                                                    >{funnel.client.shopDomain.split('.')[0]}</TableCell>
                                                    <TableCell>{funnel.installPhase}</TableCell>
                                                    <TableCell><Badge variant="outline">{funnel.followUpStep}</Badge></TableCell>
                                                    <TableCell>{new Date(funnel.followUpDate).toLocaleDateString()}</TableCell>
                                                    <TableCell><Badge variant="outline">{funnel.clientSuccessStatus == 'yes' ? 'Yes' : 'No'}</Badge></TableCell>

                                                    <TableCell className="max-w-[20px] truncate">
                                                        {funnel.initialFeedback ? (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span>{funnel.initialFeedback}</span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{funnel.initialFeedback}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ) : (
                                                            <span>N/A</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{new Date(funnel.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="cursor-pointer" size="icon">
                                                                    <Ellipsis />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => {
                                                                    setSelectedMarketingFunnel(funnel);
                                                                    setViewMarketingFunnelModalOpen(true);
                                                                }}>
                                                                    <Eye /> View Details
                                                                </DropdownMenuItem>
                                                                {
                                                                    canCreate && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setSelectedClientId(funnel.clientId);
                                                                                setSelectedMarketingFunnel(funnel);
                                                                                setAddMarketingModalOpen(true);
                                                                            }}
                                                                        >
                                                                            <Plus /> Add Marketing Funnel
                                                                        </DropdownMenuItem>
                                                                    )
                                                                }
                                                                {
                                                                    canEdit && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setSelectedMarketingFunnel(funnel);
                                                                                setEditMarketingFunnelModalOpen(true);
                                                                            }}
                                                                        >
                                                                            <PenBox /> Edit Marketing Funnel
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
                                                                                    setSelectedMarketingFunnel(funnel);
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
                                                    No marketing funnels found.
                                                </TableCell>
                                            </TableRow>
                                        )
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={9}>
                                                <div className="flex flex-col items-center justify-center py-50 text-yellow-600">
                                                    <div className="flex items-center gap-2">
                                                        <AlertTriangle className="w-5 h-5" />
                                                        <span>You don’t have permission to view marketing funnels data.</span>
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

            {/* Add Marketing Funnel Modal */}
            {addMarketingModalOpen && selectedClientId && selectedMarketingFunnel && (
                <Suspense fallback={<CenterSpinner />}>
                    <AddMarketingFunnelModal
                        clientId={selectedClientId}
                        open={addMarketingModalOpen}
                        onOpenChange={setAddMarketingModalOpen}
                        refreshPage={refreshPage}
                        funnel={selectedMarketingFunnel}
                    />
                </Suspense>
            )}

            {/* View Marketing Funnel Modal */}
            {viewMarketingFunnelModalOpen && selectedMarketingFunnel && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewMarketingFunnelDetailsModal
                        funnel={selectedMarketingFunnel}
                        open={viewMarketingFunnelModalOpen}
                        onOpenChange={setViewMarketingFunnelModalOpen}
                    />
                </Suspense>
            )}

            {/* Edit Marketing Funnel Modal */}
            {editMarketingFunnelModalOpen && selectedMarketingFunnel && (
                <Suspense fallback={<CenterSpinner />}>
                    <EditMarketingFunnelModal
                        funnel={selectedMarketingFunnel}
                        open={editMarketingFunnelModalOpen}
                        onOpenChange={setEditMarketingFunnelModalOpen}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}
            {deleteDialogOpen && selectedMarketingFunnel && (
                <Suspense fallback={<CenterSpinner />}>
                    <DeleteConfirmDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        title="Delete Marketing Funnel?"
                        description="Are you sure you want to permanently delete this chat? This action cannot be undone."
                        onConfirm={async () => handleDelete()}
                    />
                </Suspense>
            )}
        </div>
    );
}
