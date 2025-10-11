import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Link, useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router";
import { ChevronLeft, ChevronRight, Ellipsis, Eye, Plus, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { prisma } from "~/lib/prisma.server";
import { Suspense, useState } from "react";
import { ClientViewModal } from "~/components/modals/client-view-modal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";


export async function loader({ request }: LoaderFunctionArgs) {

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 5);
    const search = url.searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search
        ? {
            OR: [
                { shopDomain: { contains: search } },
                { email: { contains: search } },
                { shopName: { contains: search } },
            ],
        }
        : {};

    const [clients, total] = await Promise.all([
        prisma.client.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                shopDomain: true,
                email: true,
                shopName: true,
                accessToken: true,
                planName: true,
                country: true,
                currency: true,
                timezone: true,
                installedAt: true,
                uninstalledAt: true,
                status: true,
                createdAt: true,
            },
        }),
        prisma.client.count({ where }),
    ]);

    return {
        clients,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            search,
        },
    };
}

export default function ClientsList() {

    const { clients, meta } = useLoaderData<typeof loader>();
    const [search, setSearch] = useState(meta.search ?? "");
    const navigate = useNavigate();
    const [clientViewDetailsModalOpen, setClientViewDetailsModalOpen] = useState(false);


    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", newPage.toString());
        navigate(`?${params.toString()}`);
    }

    const handleSearch = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set("search", value);
        params.set("page", "1");
        navigate(`?${params.toString()}`);
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        const delay = 500;
        clearTimeout((window as any)._searchTimeout);
        (window as any)._searchTimeout = setTimeout(() => handleSearch(value), delay);
    };

    return (
        <div className="px-6 space-y-2">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
            </div>
            <div className="w-full space-y-4">
                <div className="flex items-center justify-between">
                    <div className="relative w-full sm:w-64">
                        <Input
                            placeholder="Search users..."
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
                                <TableHead>Store URL</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Store</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.length > 0 ? (
                                clients.map((client, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Link to={`https://${client.shopDomain}`} target="_blank" className="text-blue-600 hover:underline">
                                                {client.shopDomain}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{client.email}</TableCell>
                                        <TableCell>{client.shopName}</TableCell>
                                        <TableCell>{client.country}</TableCell>
                                        <TableCell>{client.planName}</TableCell>
                                        <TableCell>{client.status}</TableCell>
                                        <TableCell>
                                            {new Date(client.createdAt).toLocaleDateString()}
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
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setClientViewDetailsModalOpen(true)}><Eye /> View Details</DropdownMenuItem>
                                                    {/* <DropdownMenuItem onClick={() => setModalOpen(true)}><Plus /> Add Chats</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setModalOpen(true)}><Plus /> Add Tasks</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setModalOpen(true)}><Plus /> Add Marketing Funnels</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setModalOpen(true)}><Plus /> Add Meetings</DropdownMenuItem> */}
                                                    {/* <DropdownMenuSeparator />
                                                    <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem> */}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            {clientViewDetailsModalOpen && (
                                                <Suspense fallback={<div className="py-4 text-center">Loading...</div>}>
                                                    <ClientViewModal client={client} open={clientViewDetailsModalOpen} onOpenChange={setClientViewDetailsModalOpen} />
                                                </Suspense>
                                            )}
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
        </div>
    );
}
