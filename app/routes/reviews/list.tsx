import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "~/components/ui/dropdown-menu"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui/table";
import { Eye, PenBox, Trash2, Search, AlertTriangle, Plus, Ellipsis } from "lucide-react";
import { DynamicSelectFilter } from "~/components/dynamic-select-filter"
import { DynamicDateFilter } from "~/components/dynamic-date-filter";
import { CenterSpinner } from "~/components/ui/center-spinner";
import { Suspense, lazy, useEffect, useState } from "react";
import { PaginationBar } from "~/components/pagination-bar";
import { useLoaderData, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { prisma } from "~/lib/prisma.server";
import { toast } from "sonner"
import { DeleteConfirmDialog } from "~/components/ui/confirm-dialog";

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

    const reviewSubmittedAt = url.searchParams.get("reviewSubmittedAt");
    const reviewSubmittedAtStart = url.searchParams.get("reviewSubmittedAtStart");
    const reviewSubmittedAtEnd = url.searchParams.get("reviewSubmittedAtEnd");

    const ratingMood = url.searchParams.get("ratingMood");

    const where: any = search
        ? {
            OR: [
                { chat: { client: { shopDomain: { contains: searchLower } } } },
                { meeting: { storeUrl: { contains: searchLower } } },
                { reviewText: { contains: searchLower } },
            ],
        }
        : {};

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

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where,
            skip,
            take: limit,
            orderBy: { id: "desc" },
            include: {
                chat: { select: { client: { select: { shopDomain: true } } } },
                meeting: { select: { storeUrl: true } },
                approachByUser: true,
                createdByUser: true

            }
        }),
        prisma.review.count({ where })
    ]);

    return {
        reviews,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            search,
            reviewSubmittedAt,
            reviewSubmittedAtStart,
            reviewSubmittedAtEnd,
            ratingMood
        }
    }
}

export default function ReviewListPage() {

    const navigate = useNavigate();
    const { reviews, meta } = useLoaderData<typeof loader>();
    const [search, setSearch] = useState(meta.search ?? "");
    const [loading, setLoading] = useState(true);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [viewReviewModalOpen, setViewReviewModalOpen] = useState(false);
    const [editReviewModalOpen, setEditReviewModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<any | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

    return (
        <div className="px-6 space-y-3">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Reviews</h1>
                <Button
                    onClick={() => {
                        setReviewModalOpen(true);
                    }}
                >
                    <Plus /> Add Review
                </Button>
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
                            <TableHead>Rating Mood</TableHead>
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
                            <TableHead>Approached By</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {reviews.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                    No reviews found
                                </TableCell>
                            </TableRow>
                        )}

                        {reviews.map((rev: any, i: number) => (
                            <TableRow key={rev.id}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell className="text-blue-600">
                                    {rev.shopUrl ?? rev.chat?.client?.shopDomain ??
                                        rev.meeting?.storeUrl ??
                                        "—"}
                                </TableCell>
                                <TableCell className="capitalize">{rev.ratingMood ?? "—"}</TableCell>
                                <TableCell>{rev.agentRating ?? "—"}</TableCell>
                                <TableCell>{rev.reviewSubmittedAt ? new Date(rev.reviewSubmittedAt).toLocaleDateString() : "—"}</TableCell>
                                <TableCell>{rev.approachByUser?.fullName ?? "—"}</TableCell>

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
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setSelectedReview(rev);
                                                    setEditReviewModalOpen(true);
                                                }}
                                            >
                                                <PenBox /> Edit Review
                                            </DropdownMenuItem>
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
