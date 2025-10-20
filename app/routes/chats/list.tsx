import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
    PenBox,
    Plus,
    Search,
    Trash2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router";
import { CenterSpinner } from "~/components/ui/center-spinner";
import { lazy, Suspense, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { prisma } from "~/lib/prisma.server";
import { toast } from "sonner";
import { ChatsTable } from "~/components/tables/chats-table";

const AddChatModal = lazy(() =>
    import("~/components/modals/add-chat-modal").then((m) => ({
        default: m.AddChatModal,
    }))
);

const ViewChatDetailsModal = lazy(() =>
    import("~/components/modals/view-chat-modal").then((m) => ({
        default: m.ViewChatDetailsModal,
    }))
);

const EditChatModal = lazy(() =>
    import("~/components/modals/edit-chat-modal").then((m) => ({
        default: m.EditChatModal,
    }))
);

const DeleteConfirmDialog = lazy(() =>
    import("~/components/ui/confirm-dialog").then((m) => ({
        default: m.DeleteConfirmDialog,
    }))
);

export async function loader({ request }: LoaderFunctionArgs) {

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);
    const search = (url.searchParams.get("search") || "").trim();

    const skip = (page - 1) * limit;

    const searchLower = search.toLowerCase();

    const where = search
        ? {
            OR: [
                { client: { shopDomain: { contains: searchLower } } },
                { client: { shopName: { contains: searchLower } } },
                { client: { email: { contains: searchLower } } },
                { clientQuery: { contains: searchLower } },
                { handleByUser: { fullName: { contains: searchLower } } },
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
                client: {
                    select: {
                        id: true, shopDomain: true, shopName: true,
                        clientEmail: {
                            select: { id: true, email: true },
                        },
                    },
                },
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
    const [viewChatModal, setViewChatModal] = useState(false);
    const [editChatModal, setEditChatModal] = useState(false);
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState<any>(null);

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

    const handleChatDelete = async () => {
        if (!chatToDelete) return;

        try {
            const res = await fetch(`/api/chats/${chatToDelete.id}`, {
                method: "DELETE",
            });
            if (!res.ok) toast.error("Failed to delete chat");
            toast.success("Chat deleted successfully.");
            navigate(0);
        } catch (err: any) {
            toast.error(err.message || "Failed to delete chat.");
        }
    }

    const refreshPage = () => {
        navigate(window.location.pathname + window.location.search, { replace: true });
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
                <ChatsTable
                    chats={chats}
                    onView={(chat) => {
                        setSelectedChat(chat);
                        setViewChatModal(true);
                    }}
                    onAdd={(chat) => {
                        setClientId(chat.clientId);
                        setChatModalOpen(true);
                    }}
                    onEdit={(chat) => {
                        setSelectedChat(chat);
                        setEditChatModal(true);
                    }}
                    onDelete={(chat) => {
                        setChatToDelete(chat);
                        setDeleteDialogOpen(true);
                    }}
                />

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
                <Suspense fallback={<CenterSpinner />}>
                    <AddChatModal
                        clientId={clientId}
                        open={chatModalOpen}
                        onOpenChange={setChatModalOpen}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}
            {viewChatModal && selectedChat && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewChatDetailsModal chat={selectedChat} open={viewChatModal} onOpenChange={setViewChatModal} />
                </Suspense>
            )}
            {editChatModal && selectedChat && (
                <Suspense fallback={<CenterSpinner />}>
                    <EditChatModal
                        chat={selectedChat}
                        open={editChatModal}
                        onOpenChange={setEditChatModal}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}

            {deleteDialogOpen && selectedChat && (
                <Suspense fallback={<CenterSpinner />}>
                    <DeleteConfirmDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        title="Delete Chat?"
                        description="Are you sure you want to permanently delete this chat? This action cannot be undone."
                        onConfirm={async () => handleChatDelete()}
                    />
                </Suspense>
            )}
        </div>
    );
}
