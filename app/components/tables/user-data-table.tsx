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
import { ChevronLeft, ChevronRight, Search, SquarePen } from "lucide-react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Link } from "react-router";

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
    createdAt: string;
}

interface Role {
    name: string;
    slug: string;
}

interface DataTableProps {
    data: User[];
    meta: Meta;
    onPageChange: (page: number) => void;
    onSearch: (term: string) => void;
}

export function DataTable({ data, meta, onPageChange, onSearch }: DataTableProps) {
    const [search, setSearch] = React.useState(meta.search ?? "");

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        const delay = 500;
        clearTimeout((window as any)._searchTimeout);
        (window as any)._searchTimeout = setTimeout(() => onSearch(value), delay);
    };

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
                            <TableHead>Created At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((user, index) => (
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
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Link to={`/users/edit/${user.id}`}><SquarePen /></Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 🔢 Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Page {meta.page} of {meta.totalPages}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(meta.page - 1)}
                        disabled={meta.page <= 1}
                    >
                        <ChevronLeft className="size-4 mr-1" /> Prev
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(meta.page + 1)}
                        disabled={meta.page >= meta.totalPages}
                    >
                        Next <ChevronRight className="size-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
