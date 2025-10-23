import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { ButtonGroup } from "~/components/ui/button-group";
import { Button } from "~/components/ui/button";
import { PenBox, Trash2 } from "lucide-react";
import { prisma } from "~/lib/prisma.server";
import { useLoaderData } from "react-router";
import { useState } from "react";

// const EditModuleModal = lazy(() =>
//     import("~/components/modals/edit-module-modal").then((m) => ({
//         default: m.EditModuleModal,
//     }))
// ));

export async function loader() {
    const platforms = await prisma.platform.findMany({
        include: {
            project: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return { platforms };
}

export const meta = () => [{ title: "Settings | InkyBay" }];

export default function ModuleListPage() {

    const { platforms } = useLoaderData<typeof loader>();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

    return (
        <div className="px-6 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Platforms</h1>

            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Platform</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Updated At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {platforms.length > 0 ? (
                            platforms.map((platform, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>{platform.project.name}</TableCell>
                                    <TableCell>{platform.name}</TableCell>
                                    <TableCell>{platform.slug}</TableCell>
                                    <TableCell>{new Date(platform.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(platform.updatedAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <ButtonGroup>
                                            <Button variant="outline">
                                                <PenBox/>
                                            </Button>
                                             <Button variant="destructive">
                                                <Trash2/>
                                            </Button>
                                        </ButtonGroup>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                    No platforms found.
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
