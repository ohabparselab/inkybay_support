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
import {
    ChevronLeft,
    ChevronRight,
    Ellipsis,
    Eye,
    Plus,
    Search,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Link, useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router";
import { prisma } from "~/lib/prisma.server";
import { lazy, Suspense, useState } from "react";

const AddChatModal = lazy(() =>
    import("~/components/modals/add-chat-modal").then((m) => ({
        default: m.AddChatModal,
    }))
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
                { client: { shopDomain: { contains: search } } },
                { clientQuery: { contains: search } },
                { handleByUser: { fullName: { contains: search } } },
            ],
        }
        : {};

    const [chats, total] = await Promise.all([
        prisma.chat.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                client: { select: { id: true, shopDomain: true, shopName: true } },
                handleByUser: { select: { id: true, fullName: true, email: true } },
                chatTags: {
                    include: { tag: { select: { name: true } } },
                },
            },
        }),
        prisma.chat.count({ where }),
    ]);

    return {
        chats,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            search,
        },
    };
}

export default function ChatsListPage() {

    const { chats, meta } = useLoaderData<typeof loader>();
    const [search, setSearch] = useState(meta.search ?? "");
    const [clientId, setClientId] = useState(0);
    const navigate = useNavigate();

    const [chatModalOpen, setChatModalOpen] = useState(false);
    const [viewModal, setViewModal] = useState<{
        open: boolean;
        chatId?: number;
    }>({ open: false });

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", newPage.toString());
        navigate(`?${params.toString()}`);
    };

    const handleSearch = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set("search", value);
        params.set("page", "1");
        navigate(`?${params.toString()}`);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        clearTimeout((window as any)._searchTimeout);
        (window as any)._searchTimeout = setTimeout(() => handleSearch(value), 400);
    };

    return (
        <div className="px-6 space-y-2">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Chats</h1>
            </div>
            <div className="w-full space-y-4">
                <div className="flex items-center justify-between">
                    <div className="relative w-full sm:w-64">
                        <Input
                            placeholder="Search chats..."
                            className="pr-10"
                            value={search}
                            onChange={handleSearchChange}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4 pointer-events-none" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Total: {meta.total}
                    </div>
                </div>

                {/* 🧱 Table */}
                <div className="rounded-md border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Client Query</TableHead>
                                <TableHead>Agent</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead>Review Asked?</TableHead>
                                <TableHead>Client Feedback</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {chats.length > 0 ? (
                                chats.map((chat, index) => (
                                    <TableRow key={chat.id}>
                                        <TableCell>{index + 1}</TableCell>

                                        <TableCell className="max-w-xs truncate">
                                            {chat.clientQuery}
                                        </TableCell>
                                        <TableCell>{chat.handleByUser?.fullName ?? "—"}</TableCell>
                                        <TableCell className="flex flex-wrap gap-1">
                                            {chat.chatTags.map((ct) => (
                                                <span
                                                    key={ct.tag.name}
                                                    className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs"
                                                >
                                                    {ct.tag.name}
                                                </span>
                                            ))}
                                        </TableCell>
                                        <TableCell>{chat.reviewAsked == true ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>{chat.clientFeedback ? chat.clientFeedback : 'N/A'}</TableCell>
                                        <TableCell>
                                            {new Date(chat.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                                                        size="icon"
                                                    >
                                                        <Ellipsis />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setViewModal({ open: true, chatId: chat.id })
                                                        }
                                                    >
                                                        <Eye /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setClientId(chat.clientId)
                                                            setChatModalOpen(true)
                                                        }
                                                        }
                                                    >
                                                        <Plus /> Add Chat
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-6 text-muted-foreground"
                                    >
                                        No chats found.
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

            {/* Modals */}
            {chatModalOpen && (
                <Suspense fallback={<div className="py-4 text-center">Loading...</div>}>
                    <AddChatModal clientId={clientId} open={chatModalOpen} onOpenChange={setChatModalOpen} />
                </Suspense>
            )}
        </div>
    );
}
