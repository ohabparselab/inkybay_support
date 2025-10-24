import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { DeleteConfirmDialog } from "~/components/ui/confirm-dialog";
import { CenterSpinner } from "~/components/ui/center-spinner";
import { ButtonGroup } from "~/components/ui/button-group";
import { useLoaderData, useNavigate } from "react-router";
import { PenBox, Plus, Trash2 } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { Button } from "~/components/ui/button";
import { prisma } from "~/lib/prisma.server";
import { toast } from "sonner";

const AddPlatformModal = lazy(() =>
    import("~/components/modals/add-platform-modal").then((m) => ({ default: m.AddPlatformModal }))
);

const EditPlatformModal = lazy(() =>
    import("~/components/modals/edit-platform-modal").then((m) => ({ default: m.EditPlatformModal }))
);

export async function loader() {
    const platforms = await prisma.platform.findMany({
        include: {
            project: true,
        },
        orderBy: {
            project: {
                name: "asc",
            },
        },
    });

    const projects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
    });

    return { platforms, projects };
}

export const meta = () => [{ title: "Settings | InkyBay" }];

export default function PlatformListPage() {

    const navigate = useNavigate();
    const { platforms, projects } = useLoaderData<typeof loader>();
    const [addPlatformModalOpen, setAddPlatformModalOpen] = useState(false);
    const [editPlatformModalOpen, setEditPlatformModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<any>(null);

    const handleDelete = async () => {
        if (!selectedPlatform) return;

        try {
            const res = await fetch(`/api/settings/platforms/${selectedPlatform.id}`, {
                method: "DELETE",
            });
            if (!res.ok) toast.error("Failed to delete platform.");
            toast.success("Platform deleted successfully.");
            refreshPage();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete platform.");
        }
    }

    const refreshPage = () => {
        navigate(window.location.pathname + window.location.search);
    };

    return (
        <div className="px-6 space-y-2">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Platforms</h1>
                <Button
                    onClick={() => {
                        setAddPlatformModalOpen(true);
                    }}
                >
                    <Plus /> Add Platform
                </Button>
            </div>

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
                                            <Button variant="outline"
                                                onClick={() => {
                                                    setEditPlatformModalOpen(true);
                                                    setSelectedPlatform(platform);
                                                }}
                                            >
                                                <PenBox />
                                            </Button>
                                            <Button variant="destructive"
                                                onClick={() => {
                                                    setDeleteDialogOpen(true);
                                                    setSelectedPlatform(platform);
                                                }}
                                            >
                                                <Trash2 />
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

            {/* add project modal  */}
            {addPlatformModalOpen && (
                <Suspense fallback={<CenterSpinner />}>
                    <AddPlatformModal
                        open={addPlatformModalOpen}
                        onOpenChange={setAddPlatformModalOpen}
                        refreshPage={refreshPage}
                        projects={projects}
                    />
                </Suspense>
            )}

            {/* add project modal  */}
            {editPlatformModalOpen && selectedPlatform && (
                <Suspense fallback={<CenterSpinner />}>
                    <EditPlatformModal
                        open={editPlatformModalOpen}
                        onOpenChange={setEditPlatformModalOpen}
                        refreshPage={refreshPage}
                        projects={projects}
                        platform={selectedPlatform}
                    />
                </Suspense>
            )}

            {deleteDialogOpen && selectedPlatform && (
                <Suspense fallback={<CenterSpinner />}>
                    <DeleteConfirmDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        title="Delete Platform?"
                        description="Are you sure you want to permanently delete this chat? This action cannot be undone."
                        onConfirm={async () => handleDelete()}
                    />
                </Suspense>
            )}
        </div>
    );
}
