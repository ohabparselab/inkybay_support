import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Ellipsis, Eye, PenBox, Plus, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

interface ChatsTableProps {
    chats: any[];
    onView: (chat: any) => void;
    onAdd: (chat: any) => void;
    onEdit: (chat: any) => void;
    onDelete: (chat: any) => void;
}

export function ChatsTable({
    chats,
    onView,
    onAdd,
    onEdit,
    onDelete,
}: ChatsTableProps) {
    return (
        <div className="rounded-md border bg-card shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Shop Name</TableHead>
                        <TableHead>Client Query</TableHead>
                        <TableHead>Handle By</TableHead>
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
                                <TableCell>{chat.client.shopName}</TableCell>
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
                                        <span className="text-gray-500">N/A</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {chat.reviewAsked == true ? "Yes" : "No"}
                                </TableCell>
                                <TableCell className="max-w-[20px] truncate">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="block truncate cursor-pointer">
                                                    {chat.clientFeedback || "N/A"}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-sm break-words">
                                                    {chat.clientFeedback}
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                                <TableCell>
                                    {new Date(chat.createdAt).toLocaleDateString()}
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
                                            <DropdownMenuItem onClick={() => onView(chat)}>
                                                <Eye /> View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onAdd(chat)}>
                                                <Plus /> Add Chat
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(chat)}>
                                                <PenBox /> Edit Chat
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                variant="destructive"
                                                onClick={() => onDelete(chat)}
                                            >
                                                <Trash2 /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={9}
                                className="text-center py-6 text-muted-foreground"
                            >
                                No chats found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
