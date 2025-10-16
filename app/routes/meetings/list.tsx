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
import { ChevronLeft, ChevronRight, Ellipsis, Eye, Plus, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router";
import { prisma } from "~/lib/prisma.server";
import { lazy, Suspense, useState } from "react";

const AddMeetingModal = lazy(() =>
    import("~/components/modals/add-meeting-modal").then((m) => ({ default: m.AddMeetingModal }))
);

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);
    const search = url.searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where = search
        ? {
            OR: [
                { storeUrl: { contains: search, mode: "insensitive" } },
                { meetingDetails: { contains: search, mode: "insensitive" } },
                { user: { fullName: { contains: search, mode: "insensitive" } } },
            ],
        }
        : {};

    const [meetings, total] = await Promise.all([
        prisma.meeting.findMany({
            where,
            skip,
            take: limit,
            orderBy: { meetingDateTime: "desc" },
            include: {
                user: { select: { id: true, fullName: true, email: true } },
                emails: { select: { email: true } },
            },
        }),
        prisma.meeting.count({ where }),
    ]);

    return {
        meetings,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            search,
        },
    };
}

export default function MeetingListPage() {

    const { meetings, meta } = useLoaderData<typeof loader>();
    const [search, setSearch] = useState(meta.search ?? "");
    const [meetingModalOpen, setMeetingModalOpen] = useState(false);
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

    return (
        <div className="px-6 space-y-2">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Meetings</h1>
                <Button
                    onClick={() => {
                        setMeetingModalOpen(true);
                    }}
                >
                    <Plus /> Add Meeting
                </Button>
            </div>

            <div className="w-full space-y-4">
                {/* Search + total */}
                <div className="flex items-center justify-between">
                    <div className="relative w-full sm:w-64">
                        <Input
                            placeholder="Search meetings..."
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
                                <TableHead>Store URL</TableHead>
                                <TableHead>Agent</TableHead>
                                <TableHead>Joining Status</TableHead>
                                <TableHead>Meeting Date</TableHead>
                                <TableHead>External?</TableHead>
                                <TableHead>Review Asked?</TableHead>
                                <TableHead>Review Given?</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {meetings.length > 0 ? (
                                meetings.map((meeting, idx) => (
                                    <TableRow key={meeting.id}>
                                        <TableCell>{idx + 1}</TableCell>
                                        <TableCell className="max-w-xs truncate">{meeting.storeUrl}</TableCell>
                                        <TableCell>{meeting.user?.fullName ?? "—"}</TableCell>
                                        <TableCell className="flex flex-wrap gap-1">
                                            {meeting.joiningStatus ? 'Yes' : 'No'}
                                        </TableCell>
                                        <TableCell>{new Date(meeting.meetingDateTime).toLocaleString()}</TableCell>
                                        <TableCell>{meeting.isExternalMeeting ? "Yes" : "No"}</TableCell>
                                        <TableCell>{meeting.reviewAsked ? "Yes" : "No"}</TableCell>
                                        <TableCell>{meeting.reviewGiven ? "Yes" : "No"}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Ellipsis />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => { }}>
                                                        <Eye /> View Details
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                                        No meetings found.
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

            {/* Add Meeting Modal */}
            {meetingModalOpen && (
                <Suspense fallback={<div className="py-4 text-center">Loading...</div>}>
                    <AddMeetingModal
                        open={meetingModalOpen}
                        onOpenChange={setMeetingModalOpen}
                    />
                </Suspense>
            )}
        </div>
    );
}
