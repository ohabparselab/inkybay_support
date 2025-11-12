"use client";

import * as React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CircleCheck, CircleX, Eye, Search, SquarePen, Trash2 } from "lucide-react";
import {
    Avatar,
    AvatarImage,
} from "@/components/ui/avatar"
import { Link, useNavigate } from "react-router";
import { PaginationBar } from "../pagination-bar";
import { ButtonGroup } from "../ui/button-group";
import { lazy, Suspense, useState } from "react";
import { CenterSpinner } from "../ui/center-spinner";
import { DeleteConfirmDialog } from "../ui/confirm-dialog";
import { toast } from "sonner";

const ViewUserModal = lazy(() =>
    import("~/components/modals/view-user-modal").then((m) => ({ default: m.UserInfoModal }))
);

interface Meta {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
    search?: string;
}

interface User {
    id: string | number;
    avatar: string;
    fullName: string;
    email: string;
    role: Role;
    isActive: boolean;
    createdAt: string;
}

interface Role {
    name: string;
    slug: string;
}

interface DataTableProps {
    users: User[];
    meta: Meta;
    onPageChange: (page: number) => void;
    onSearch: (term: string) => void;
    handleLimitChange: (limit: number) => void;
    loading: boolean;
}

export function DataTable({ users, meta, onPageChange, onSearch, handleLimitChange, loading }: DataTableProps) {

    const [search, setSearch] = useState(meta.search ?? "");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [viewUserModalOpen, setViewUserModalOpen] = useState(false);

    const navigate = useNavigate();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        const delay = 500;
        clearTimeout((window as any)._searchTimeout);
        (window as any)._searchTimeout = setTimeout(() => onSearch(value), delay);
    };

    const handleDelete = async () => {
        if (!selectedUser) return;

        try {
            const res = await fetch(`/api/users/${selectedUser.id}`, {
                method: "DELETE",
            });
            if (!res.ok) toast.error("Failed to delete users");
            toast.success("Users deleted successfully.");
            navigate(0);
        } catch (err: any) {
            toast.error(err.message || "Failed to delete user.");
        }
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-full sm:w-64">
                    <Input
                        placeholder="Search users..."
                        className="pr-10" // add right padding so text doesn’t overlap the icon
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
                            <TableHead>Image</TableHead>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>isActive?</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={8} className="py-4">
                                            <div className="animate-pulse h-5 bg-accent rounded" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                users.length > 0 ? (
                                    users.map((user, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                <Avatar className="h-8 w-8 rounded-lg">
                                                    <AvatarImage src={user.avatar || '/avatar-default.svg'} alt={user.fullName} />
                                                </Avatar>
                                            </TableCell>
                                            <TableCell>{user.fullName}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.role.name}</TableCell>
                                            <TableCell>{user.isActive ? <CircleCheck className="text-green-700" /> : <CircleX className="text-red-700" />}</TableCell>
                                            <TableCell>
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <ButtonGroup>
                                                    <Link to={`/users/edit/${user.id}`}><Button variant="outline"><SquarePen /></Button></Link>
                                                    <Button variant="outline"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setViewUserModalOpen(true);
                                                        }}
                                                    ><Eye /> </Button>
                                                    {
                                                        user.role.slug === 'user' && (
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setDeleteDialogOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 />
                                                            </Button>
                                                        )
                                                    }
                                                </ButtonGroup>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-50 text-muted-foreground">
                                            No users result found.
                                        </TableCell>
                                    </TableRow>
                                )
                            )
                        }
                    </TableBody>
                </Table>
                {/* 🔢 Pagination */}
                <PaginationBar
                    meta={meta}
                    onPageChange={onPageChange}
                    onLimitChange={handleLimitChange}
                />
            </div>

            {viewUserModalOpen && selectedUser && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewUserModal
                        open={viewUserModalOpen}
                        onOpenChange={setViewUserModalOpen}
                        user={selectedUser}
                    />
                </Suspense>
            )}

            {deleteDialogOpen && selectedUser && (
                <Suspense fallback={<CenterSpinner />}>
                    <DeleteConfirmDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        title="Delete User?"
                        description="Are you sure you want to permanently delete this chat? This action cannot be undone."
                        onConfirm={async () => handleDelete()}
                    />
                </Suspense>
            )}
        </div>
    );
}
