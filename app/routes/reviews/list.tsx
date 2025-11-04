import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "~/components/ui/dropdown-menu"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui/table";
import { DateAndDateRangeFilter } from "~/components/ui/date-range-filter";
import { Eye, PenBox, Trash2, Search, AlertTriangle, Plus } from "lucide-react";
import { DynamicSelectFilter } from "~/components/dynamic-select-filter"
import { Suspense, lazy, useEffect, useState } from "react";
import { PaginationBar } from "~/components/pagination-bar";
import { useLoaderData, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { prisma } from "~/lib/prisma.server";
import { toast } from "sonner"
import { CenterSpinner } from "~/components/ui/center-spinner";

const AddReviewModal = lazy(() =>
    import("~/components/modals/add-review-modal").then((m) => ({ default: m.AddReviewModal }))
);

export const meta = () => [{ title: "Reviews | InkyBay" }];

export async function loader({ request }: any) {

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);
    const search = url.searchParams.get("search") || "";
    const skip = (page - 1) * limit;
    const searchLower = search.toLowerCase();

    const date = url.searchParams.get("date");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
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

    if (date) {
        where.reviewDate = {
            gte: new Date(`${date}T00:00:00.000Z`),
            lt: new Date(`${date}T23:59:59.999Z`)
        }
    } else if (startDate && endDate) {
        where.reviewDate = {
            gte: new Date(`${startDate}T00:00:00.000Z`),
            lt: new Date(`${endDate}T23:59:59.999Z`)
        }
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
            date,
            startDate,
            endDate,
            ratingMood
        }
    }
}

export default function ReviewListPage() {

    const { reviews, meta } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [search, setSearch] = useState(meta.search ?? "");

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
                            <TableHead>Review Date</TableHead>
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
                                    {rev.chat?.client?.shopDomain ??
                                        rev.meeting?.storeUrl ??
                                        "—"}
                                </TableCell>
                                <TableCell className="capitalize">{rev.ratingMood ?? "—"}</TableCell>
                                <TableCell>{rev.agentRating ?? "—"}</TableCell>
                                <TableCell>{rev.reviewDate ? new Date(rev.reviewDate).toLocaleDateString() : "—"}</TableCell>
                                <TableCell>{rev.agentRating ?? "—"}</TableCell>

                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon"><Eye /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem><Eye /> View</DropdownMenuItem>
                                            <DropdownMenuItem><PenBox /> Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600">
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

        </div>
    );
}
