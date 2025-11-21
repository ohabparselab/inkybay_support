
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { useLoaderData, useNavigate, useRouteLoaderData, type LoaderFunctionArgs } from "react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { AlertTriangle, Ellipsis, Eye, Filter, PenBox, Plus, Search, Trash2 } from "lucide-react";
import { DateAndDateRangeFilter } from "~/components/ui/date-range-filter";
import { CenterSpinner } from "~/components/ui/center-spinner";
import { PaginationBar } from "~/components/pagination-bar";
import { lazy, Suspense, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { prisma } from "~/lib/prisma.server";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

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
    const tagParams = url.searchParams.get("tags");
    const selectedTags = tagParams ? tagParams.split(",").map((t) => t.trim()) : [];

    const skip = (page - 1) * limit;
    const searchLower = search.toLowerCase();

    const date = url.searchParams.get("date");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const where: any = {
        ...(search
            ? {
                OR: [
                    { client: { shopDomain: { contains: searchLower } } },
                    { client: { shopName: { contains: searchLower } } },
                    { client: { email: { contains: searchLower } } },
                    { clientQuery: { contains: searchLower } },
                    { handleByUser: { fullName: { contains: searchLower } } },
                ],
            }
            : {}),
        ...(selectedTags.length
            ? {
                chatTags: {
                    some: {
                        tag: {
                            name: {
                                in: selectedTags,
                            },
                        },
                    },
                },
            }
            : {}),
    };

    if (date) {
        const d = new Date(date); // ISO "2025-11-20"

        const start = new Date(Date.UTC(
            d.getUTCFullYear(),
            d.getUTCMonth(),
            d.getUTCDate(),
            0, 0, 0, 0
        ));

        const end = new Date(Date.UTC(
            d.getUTCFullYear(),
            d.getUTCMonth(),
            d.getUTCDate(),
            23, 59, 59, 999
        ));

        where.chatDate = {
            gte: start,
            lt: end,
        };
    } else if (startDate && endDate) {
        const s = new Date(startDate);
        const e = new Date(endDate);

        const start = new Date(Date.UTC(
            s.getUTCFullYear(),
            s.getUTCMonth(),
            s.getUTCDate(),
            0, 0, 0, 0
        ));

        const end = new Date(Date.UTC(
            e.getUTCFullYear(),
            e.getUTCMonth(),
            e.getUTCDate(),
            23, 59, 59, 999
        ));

        where.chatDate = {
            gte: start,
            lt: end,
        };
    }

    const [chats, total, tags] = await Promise.all([
        prisma.chat.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                client: {
                    select: {
                        id: true,
                        shopDomain: true,
                        shopName: true,
                        clientEmail: { select: { id: true, email: true } },
                    },
                },
                handleByUser: { select: { id: true, fullName: true, email: true } },
                createdByUser: { select: { id: true, fullName: true } },
                updatedByUser: { select: { id: true, fullName: true } },
                chatTags: { include: { tag: { select: { name: true } } } },
                review: { include: { approachByUser: true } },
                project: { select: { name: true } },
                featureRequest: true,
            },
        }),
        prisma.chat.count({ where }),
        prisma.tag.findMany({ select: { id: true, name: true } }),
    ]);

    return {
        chats,
        tags,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            search,
            selectedTags,
            date,
            startDate,
            endDate,
        },
    };
}



export const meta = () => [{ title: "Chats | InkyBay" }];

export default function ChatsListPage() {

    const [loading, setLoading] = useState(true);
    const [externalChat, setExternalChat] = useState(false);
    const navigate = useNavigate();
    const { chats, meta, tags } = useLoaderData<typeof loader>();
    const [search, setSearch] = useState(meta.search ?? "");

    const [clientId, setClientId] = useState<number | null>(null);

    const [chatModalOpen, setChatModalOpen] = useState(false);
    const [viewChatModal, setViewChatModal] = useState(false);
    const [editChatModal, setEditChatModal] = useState(false);
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const rootData = useRouteLoaderData("root") as any;
    const permissions = rootData?.permissions ?? [];
    const canView = permissions.includes("chats.view");
    const canEdit = permissions.includes("chats.edit");
    const canDelete = permissions.includes("chats.delete");
    const canCreate = permissions.includes("chats.create");

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
        params.set("page", "1");
        navigateWithLoading(`?${params.toString()}`);
    };

    const handleSearch = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set("search", value);
        params.set("page", "1");
        navigateWithLoading(`?${params.toString()}`);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        clearTimeout((window as any)._searchTimeout);
        (window as any)._searchTimeout = setTimeout(() => handleSearch(value), 400);
    };

    const handleChatDelete = async () => {
        if (!selectedChat) return;

        try {
            const res = await fetch(`/api/chats/${selectedChat.id}`, {
                method: "DELETE",
            });
            if (!res.ok) toast.error("Failed to delete chat");
            toast.success("Chat deleted successfully.");
            refreshPage();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete chat.");
        }
    }

    const refreshPage = () => {
        navigateWithLoading(window.location.pathname + window.location.search);
    };

    const handleTagToggle = (tagName: string, checked: boolean) => {
        const params = new URLSearchParams(window.location.search);
        const currentTags = params.get("tags")
            ? params.get("tags")!.split(",").filter(Boolean)
            : [];

        let newTags: string[];
        if (checked) newTags = [...new Set([...currentTags, tagName])];
        else newTags = currentTags.filter((t) => t !== tagName);

        if (newTags.length) params.set("tags", newTags.join(","));
        else params.delete("tags");

        params.set("page", "1");
        navigateWithLoading(`?${params.toString()}`);
    };

    useEffect(() => {
        if (loading) setLoading(false);
    }, [chats]);

    return (
        <div className="px-6 space-y-2">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Chats</h1>
                {
                    canCreate && (
                        <Button onClick={() => {
                            setSelectedChat(null);
                            setExternalChat(true);
                            setChatModalOpen(true);
                        }}>
                            <Plus /> Add External Chat
                        </Button>
                    )
                }

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
                                <TableHead>Shop URL</TableHead>
                                <TableHead>Client Query</TableHead>
                                <TableHead>Handle By</TableHead>
                                <TableHead>
                                    <div className="flex items-center gap-2">
                                        <span>Tags</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer">
                                                    <Filter
                                                        className={cn(
                                                            "size-4 transition-colors",
                                                            meta.selectedTags.length > 0 ? "text-blue-600" : "text-muted-foreground"
                                                        )}
                                                    />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="max-h-64 overflow-auto w-48">
                                                {
                                                    tags.length === 0 ? (
                                                        <div className="p-2 text-center text-sm text-muted-foreground">No tags found</div>
                                                    ) : (
                                                        tags.map((t: any) => (
                                                            <DropdownMenuCheckboxItem
                                                                key={t.id}
                                                                checked={meta.selectedTags.includes(t.name)}
                                                                onCheckedChange={(checked) => handleTagToggle(t.name, checked)}
                                                            >
                                                                {t.name}
                                                            </DropdownMenuCheckboxItem>
                                                        ))
                                                    )

                                                }
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableHead>
                                <TableHead>Review Asked?</TableHead>
                                <TableHead>Review Given?</TableHead>
                                <TableHead>
                                    <div className="flex items-center gap-2">
                                        <span>Chat Date</span>
                                        <DateAndDateRangeFilter meta={meta} navigateWithLoading={navigateWithLoading} />
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
                                        chats.length > 0 ? (
                                            chats.map((chat, index) => (
                                                <TableRow key={chat.id} >
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell
                                                        className="hover:underline text-blue-700 cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedChat(chat);
                                                            setViewChatModal(true);
                                                        }}
                                                    >
                                                        {
                                                            chat.externalChat
                                                                ? chat.shopUrl?.split('.')[0] || ''
                                                                : chat?.client?.shopDomain?.split('.')[0] || ''
                                                        }
                                                    </TableCell>
                                                    <TableCell className="max-w-[20px] truncate">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="block truncate cursor-pointer">
                                                                        {chat.clientQuery || "-"}
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="max-w-sm break-words">
                                                                        {chat.clientQuery}
                                                                    </p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </TableCell>
                                                    <TableCell>{chat.handleByUser?.fullName ?? "—"}</TableCell>
                                                    <TableCell className="flex flex-wrap gap-1">
                                                        {chat.chatTags && chat.chatTags.length > 0 ? (
                                                            chat.chatTags.map((ct: any) => (
                                                                <span
                                                                    key={ct.tag.name}
                                                                    className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs"
                                                                >
                                                                    {ct.tag.name}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span>N/A</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {chat?.review?.reviewAsked == true ? "Yes" : "No"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {chat?.review?.reviewStatus == true ? "Yes" : "No"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {chat.chatDate ? format(new Date(chat.chatDate), "yyyy-MM-dd") : "N/A"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    className="data-[state=open]:bg-muted text-muted-foreground flex size-8 cursor-pointer"
                                                                    size="icon"
                                                                >
                                                                    <Ellipsis />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => {
                                                                    setSelectedChat(chat);
                                                                    setViewChatModal(true);
                                                                }}>
                                                                    <Eye /> View Details
                                                                </DropdownMenuItem>
                                                                {
                                                                    canCreate && (
                                                                        <DropdownMenuItem onClick={() => {
                                                                            setExternalChat(false);
                                                                            setClientId(chat.clientId);
                                                                            setSelectedChat(chat);
                                                                            setChatModalOpen(true);
                                                                        }}>
                                                                            <Plus /> Add Chat
                                                                        </DropdownMenuItem>
                                                                    )
                                                                }
                                                                {
                                                                    canEdit && (
                                                                        <DropdownMenuItem onClick={() => {
                                                                            setSelectedChat(chat);
                                                                            setEditChatModal(true);
                                                                        }}>
                                                                            <PenBox /> Edit Chat
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
                                                                                    setSelectedChat(chat);
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
                                                <TableCell
                                                    colSpan={9}
                                                    className="text-center py-50 text-muted-foreground"
                                                >
                                                    No chats found.
                                                </TableCell>
                                            </TableRow>
                                        )
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={9}>
                                                <div className="flex flex-col items-center justify-center py-50 text-yellow-600">
                                                    <div className="flex items-center gap-2">
                                                        <AlertTriangle className="w-5 h-5" />
                                                        <span>You don't have permission view chats data.</span>
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

            {/* Modals */}
            {chatModalOpen && (
                <Suspense fallback={<CenterSpinner />}>
                    <AddChatModal
                        clientId={clientId}
                        open={chatModalOpen}
                        onOpenChange={setChatModalOpen}
                        refreshPage={refreshPage}
                        chat={selectedChat}
                        externalChat={externalChat}
                    />
                </Suspense>
            )}
            {viewChatModal && selectedChat && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewChatDetailsModal chatId={selectedChat.id} open={viewChatModal} onOpenChange={setViewChatModal} />
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
