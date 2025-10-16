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
import { Ellipsis, Edit } from "lucide-react";
import { Button } from "~/components/ui/button";
import { prisma } from "~/lib/prisma.server";
import { useState, lazy, Suspense } from "react";
import { useLoaderData } from "react-router";

// const EditModuleModal = lazy(() =>
//     import("~/components/modals/edit-module-modal").then((m) => ({
//         default: m.EditModuleModal,
//     }))
// ));

export async function loader() {
    const modules = await prisma.module.findMany({
        orderBy: { createdAt: "desc" },
    });

    return { modules };
}

export default function ModuleListPage() {

    const { modules } = useLoaderData<typeof loader>();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

    return (
        <div className="px-6 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Modules</h1>

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
                        {modules.length > 0 ? (
                            modules.map((mod, idx) => (
                                <TableRow key={mod.id}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>{mod.name}</TableCell>
                                    <TableCell>{mod.slug}</TableCell>
                                    <TableCell>{new Date(mod.createdAt).toLocaleDateString()}</TableCell>
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
                                                        setSelectedModuleId(mod.id);
                                                        setEditModalOpen(true);
                                                    }}
                                                >
                                                    <Edit /> Edit
                                                </DropdownMenuItem>
                                                {/* Add Delete/View if needed */}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    No modules found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Modal */}
            {/* {editModalOpen && selectedModuleId && (
                <Suspense fallback={<div className="py-4 text-center">Loading...</div>}>
                    <EditModuleModal
                        moduleId={selectedModuleId}
                        open={editModalOpen}
                        onOpenChange={setEditModalOpen}
                    />
                </Suspense>
            )} */}
        </div>
    );
}
