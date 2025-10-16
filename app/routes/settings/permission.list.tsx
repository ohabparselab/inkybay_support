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
import { Ellipsis, Eye, Edit } from "lucide-react";
import { Button } from "~/components/ui/button";
import { prisma } from "~/lib/prisma.server";
import { useState, lazy, Suspense } from "react";
import { useLoaderData } from "react-router";

// const EditPermissionModal = lazy(() =>
//   import("~/components/modals/edit-permission-modal").then((m) => ({
//     default: m.EditPermissionModal,
//   }))
// ));

export async function loader() {
    const permissions = await prisma.permission.findMany({
        orderBy: { createdAt: "desc" },
    });

    return { permissions };
}

export default function PermissionListPage() {

    const { permissions } = useLoaderData<typeof loader>();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedPermissionId, setSelectedPermissionId] = useState<number | null>(null);

    return (
        <div className="px-6 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Permissions</h1>

            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {permissions.length > 0 ? (
                            permissions.map((perm, idx) => (
                                <TableRow key={perm.id}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>{perm.name}</TableCell>
                                    <TableCell>{perm.slug}</TableCell>
                                    <TableCell>{new Date(perm.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Ellipsis />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedPermissionId(perm.id);
                                                        setEditModalOpen(true);
                                                    }}
                                                >
                                                    <Edit /> Edit
                                                </DropdownMenuItem>
                                                {/* Add Delete or View if needed */}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    No permissions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Modal */}
            {/* {editModalOpen && selectedPermissionId && (
                <Suspense fallback={<div className="py-4 text-center">Loading...</div>}>
                    <EditPermissionModal
                        permissionId={selectedPermissionId}
                        open={editModalOpen}
                        onOpenChange={setEditModalOpen}
                    />
                </Suspense>
            )} */}
        </div>
    );
}
