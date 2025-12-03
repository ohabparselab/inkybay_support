import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "~/components/ui/dropdown-menu"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui/table";
import { Eye, PenBox, Trash2, Search, AlertTriangle, Plus, Ellipsis, Filter, X } from "lucide-react";
import { useLoaderData, useNavigate, useRouteLoaderData } from "react-router";
import { DynamicDateFilter } from "~/components/dynamic-date-filter";
import { DeleteConfirmDialog } from "~/components/ui/confirm-dialog";
import { CenterSpinner } from "~/components/ui/center-spinner";
import { Suspense, lazy, useEffect, useState } from "react";
import { PaginationBar } from "~/components/pagination-bar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { prisma } from "~/lib/prisma.server";
import { cn } from "~/lib/utils";
import { toast } from "sonner"

const AddReviewModal = lazy(() =>
    import("~/components/modals/add-review-modal").then((m) => ({ default: m.AddReviewModal }))
);

const ViewReviewDetailsModal = lazy(() =>
    import("~/components/modals/view-review-modal").then((m) => ({ default: m.ReviewDetailsModal }))
);

const EditReviewModal = lazy(() =>
    import("~/components/modals/edit-review-modal").then((m) => ({ default: m.EditReviewModal }))
);

export const meta = () => [{ title: "Reviews | InkyBay" }];

export async function loader({ request }: any) {

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);
    const search = url.searchParams.get("search") || "";
    const skip = (page - 1) * limit;
    const searchLower = search.toLowerCase();
    const userParams = url.searchParams.get("users");
    const selectedUsers = userParams ? userParams.split(",").map((t) => t.trim()) : [];

    const reviewSubmittedAt = url.searchParams.get("reviewSubmittedAt");
    const reviewSubmittedAtStart = url.searchParams.get("reviewSubmittedAtStart");
    const reviewSubmittedAtEnd = url.searchParams.get("reviewSubmittedAtEnd");

    const lastReviewApproach = url.searchParams.get("lastReviewApproach");
    const lastReviewApproachStart = url.searchParams.get("lastReviewApproachStart");
    const lastReviewApproachEnd = url.searchParams.get("lastReviewApproachEnd");

    const ratingMood = url.searchParams.get("ratingMood");

    const where: any = search
        ? {
            AND: [
                {
                    OR: [
                        { chat: { client: { shopDomain: { contains: searchLower } } } },
                        { meeting: { storeUrl: { contains: searchLower } } },
                        { reviewText: { contains: searchLower } },
                    ],
                },
                {
                    NOT: {
                        reviewText: null,
                    },
                },
                {
                    reviewText: { not: "" },
                },
            ],
        }
        : {
            NOT: {
                OR: [
                    { reviewText: null },
                    { reviewText: "" },
                ],
            },
        };

    if (ratingMood) where.ratingMood = ratingMood;

    if (reviewSubmittedAt) {
        const start = new Date(reviewSubmittedAt);
        start.setHours(0, 0, 0, 0);

        const end = new Date(reviewSubmittedAt);
        end.setHours(23, 59, 59, 999);

        where.reviewSubmittedAt = {
            gte: start,
            lt: end,
        };
    } else if (reviewSubmittedAtStart && reviewSubmittedAtEnd) {
        const start = new Date(reviewSubmittedAtStart);
        start.setHours(0, 0, 0, 0);

        const end = new Date(reviewSubmittedAtEnd);
        end.setHours(23, 59, 59, 999);

        where.reviewSubmittedAt = {
            gte: start,
            lt: end,
        };
    }

    if (lastReviewApproach) {
        const start = new Date(lastReviewApproach);
        start.setHours(0, 0, 0, 0);

        const end = new Date(lastReviewApproach);
        end.setHours(23, 59, 59, 999);

        where.reviewSubmittedAt = {
            gte: start,
            lt: end,
        };
    } else if (lastReviewApproachStart && lastReviewApproachEnd) {
        const start = new Date(lastReviewApproachStart);
        start.setHours(0, 0, 0, 0);

        const end = new Date(lastReviewApproachEnd);
        end.setHours(23, 59, 59, 999);

        where.lastReviewApproach = {
            gte: start,
            lt: end,
        };
    }

    if (selectedUsers.length > 0) {
        where.reviewApproachBy = {
            in: selectedUsers.map(Number)
        };
    }

    const [reviews, total, users] = await Promise.all([
        prisma.review.findMany({
            where,
            skip,
            take: limit,
            orderBy: { id: "desc" },
            include: {
                chat: {
                    select:
                    {
                        shopName: true,
                        shopUrl: true,
                        client: {
                            select: {
                                shopName: true,
                                shopDomain: true
                            }
                        },
                        projectId: true
                    }
                },
                meeting: {
                    select: {
                        projectId: true,
                        storeUrl: true
                    }
                },
                reviewApproachByUsers: true,
                createdByUser: true,
                project: true
            }
        }),
        prisma.review.count({ where }),
        prisma.user.findMany({ where: { role: { slug: 'user' } } })
    ]);

    return {
        reviews,
        users,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            search,
            reviewSubmittedAt,
            reviewSubmittedAtStart,
            reviewSubmittedAtEnd,
            lastReviewApproach,
            lastReviewApproachStart,
            lastReviewApproachEnd,
            ratingMood,
            selectedUsers
        }
    }
}

export default function ReviewListPage() {

    const navigate = useNavigate();
    const { reviews, meta, users } = useLoaderData<typeof loader>();
    const [search, setSearch] = useState(meta.search ?? "");
    const [loading, setLoading] = useState(true);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [viewReviewModalOpen, setViewReviewModalOpen] = useState(false);
    const [editReviewModalOpen, setEditReviewModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<any | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const rootData = useRouteLoaderData("root") as any;
    const permissions = rootData?.permissions ?? [];
    const canView = permissions.includes("review.view");
    const canEdit = permissions.includes("review.edit");
    const canDelete = permissions.includes("review.delete");
    const canCreate = permissions.includes("review.create");

    const navigateWithLoading = (url: string) => {
        setLoading(true);
        navigate(url, { replace: true })
    };

    const handleSearchChange = (e: any) => {
        const value = e.target.value;
        setSearch(value)
        clearTimeout((window as any)?._st);
        (window as any)._st = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            params.set("search", value);
            params.set("page", "1");
            navigateWithLoading(`?${params.toString()}`)
        }, 400)
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
        if (loading) setLoading(false)
    }, [reviews]);

    const refreshPage = () => {
        navigateWithLoading(window.location.pathname + window.location.search);
    };

    const handleDelete = async () => {
        if (!selectedReview) return;

        try {
            const res = await fetch(`/api/reviews/${selectedReview.id}`, {
                method: "DELETE",
            });
            if (!res.ok) toast.error("Failed to delete review.");
            toast.success("Reviews deleted successfully.");
            refreshPage();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete review.");
        }
    }

    const handleUserToggle = (id: string, checked: boolean) => {
        const params = new URLSearchParams(window.location.search);
        const currentUsers = params.get("users")
            ? params.get("users")!.split(",").filter(Boolean)
            : [];
        let newUsers: string[];
        if (checked) newUsers = [...new Set([...currentUsers, id])];
        else newUsers = currentUsers.filter((t) => t !== id);

        if (newUsers.length) params.set("users", newUsers.join(","));
        else params.delete("users");

        params.set("page", "1");
        navigateWithLoading(`?${params.toString()}`);
    };

    const clearUserFilter = () => {
        const params = new URLSearchParams(window.location.search);
        params.delete("users");
        params.set("page", "1");
        navigateWithLoading(`?${params.toString()}`);
    }

    return (
        <div className="px-6 space-y-3">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Reviews</h1>
                {
                    canCreate && (
                        <Button
                            onClick={() => {
                                setReviewModalOpen(true);
                            }}
                        >
                            <Plus /> Add Review
                        </Button>
                    )
                }
            </div>

            <div className="flex items-center justify-between">
                <div className="relative w-full sm:w-64">
                    <Input
                        placeholder="Search reviews..."
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
                            <TableHead>Rating</TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <span>Review Submitted At</span>
                                    <DynamicDateFilter
                                        label="Review Submitted At"
                                        paramKey="reviewSubmittedAt"
                                        meta={meta}
                                        navigateWithLoading={navigateWithLoading}
                                    />
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <span>Review Approach Date</span>
                                    <DynamicDateFilter
                                        label="Review Approach Date"
                                        paramKey="lastReviewApproach"
                                        meta={meta}
                                        navigateWithLoading={navigateWithLoading}
                                    />
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-1">
                                    <span>Approached By</span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer">
                                                <Filter
                                                    className={cn(
                                                        "size-4 transition-colors",
                                                        meta.selectedUsers.length > 0
                                                            ? "text-blue-600"
                                                            : "text-muted-foreground"
                                                    )}
                                                />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="max-h-64 overflow-auto w-48"
                                        >
                                            {users.length === 0 ? (
                                                <div className="p-2 text-center text-sm text-muted-foreground">
                                                    No Users found
                                                </div>
                                            ) : (
                                                users.map((t: any) => (
                                                    <DropdownMenuCheckboxItem
                                                        key={t.id}
                                                        checked={meta.selectedUsers.includes(String(t.id))}
                                                        onCheckedChange={(checked) =>
                                                            handleUserToggle(String(t.id), checked)
                                                        }
                                                    >
                                                        {t.fullName}
                                                    </DropdownMenuCheckboxItem>
                                                ))
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    {meta.selectedUsers.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-red-500 hover:text-red-700"
                                            onClick={() => clearUserFilter()}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
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
                                    reviews.length > 0 ? (
                                        reviews.map((rev: any, i: number) => (
                                            <TableRow key={rev.id}>
                                                <TableCell>{i + 1}</TableCell>
                                                <TableCell className="text-blue-600 hover:underline cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedReview(rev);
                                                        setViewReviewModalOpen(true);
                                                    }}
                                                >
                                                    {
                                                        rev.shopUrl || rev.chat?.shopUrl || rev.chat?.client?.shopDomain ||
                                                        rev.meeting?.storeUrl || "—"
                                                    }
                                                </TableCell>
                                                <TableCell>{rev.rating ?? "—"}</TableCell>
                                                <TableCell>{rev.reviewSubmittedAt ? new Date(rev.reviewSubmittedAt).toLocaleDateString() : "—"}</TableCell>
                                                <TableCell>{rev.lastReviewApproach ? new Date(rev.lastReviewApproach).toLocaleDateString() : "—"}</TableCell>
                                                <TableCell>
                                                    {rev.reviewApproachByUsers && rev.reviewApproachByUsers.length > 0 ? (
                                                        rev.reviewApproachByUsers?.map((user: any) => (
                                                            <span
                                                                key={user.fullName}
                                                                className="bg-blue-100 text-blue-700 ml-0.5 px-2 py-0.5 rounded-full text-xs"
                                                            >
                                                                {user.fullName}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span>N/A</span>
                                                    )}
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
                                                                setSelectedReview(rev);
                                                                setViewReviewModalOpen(true);
                                                            }}>
                                                                <Eye /> View Details
                                                            </DropdownMenuItem>
                                                            {
                                                                canEdit && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setSelectedReview(rev);
                                                                            setEditReviewModalOpen(true);
                                                                        }}
                                                                    >
                                                                        <PenBox /> Edit Review
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
                                                                                setSelectedReview(rev);
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
                                            <TableCell colSpan={7} className="text-center py-50 text-muted-foreground">
                                                No reviews found.
                                            </TableCell>
                                        </TableRow>
                                    )
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <div className="flex flex-col items-center justify-center py-50 text-yellow-600">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5" />
                                                    <span>You don’t have permission to view review data.</span>
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

            {/* Add review Modal */}
            {reviewModalOpen && (
                <Suspense fallback={<CenterSpinner />}>
                    <AddReviewModal
                        open={reviewModalOpen}
                        onOpenChange={setReviewModalOpen}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}

            {/* View review Modal */}
            {viewReviewModalOpen && selectedReview && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewReviewDetailsModal
                        review={selectedReview}
                        open={viewReviewModalOpen}
                        onOpenChange={setViewReviewModalOpen}
                    />
                </Suspense>
            )}

            {/* Edit Review Modal */}
            {editReviewModalOpen && selectedReview && (
                <Suspense fallback={<CenterSpinner />}>
                    <EditReviewModal
                        review={selectedReview}
                        open={editReviewModalOpen}
                        onOpenChange={setEditReviewModalOpen}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}
            {deleteDialogOpen && selectedReview && (
                <Suspense fallback={<CenterSpinner />}>
                    <DeleteConfirmDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        title="Delete Review?"
                        description="Are you sure you want to permanently delete this review? This action cannot be undone."
                        onConfirm={async () => handleDelete()}
                    />
                </Suspense>
            )}

        </div>
    );
}
