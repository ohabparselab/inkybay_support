import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { CenterSpinner } from "~/components/ui/center-spinner";
import { PenBox, Plus, Trash2, Check, X } from "lucide-react";
import { ButtonGroup } from "~/components/ui/button-group";
import { useLoaderData, useNavigate } from "react-router";
import { lazy, Suspense, useState } from "react";
import { Button } from "~/components/ui/button";
import { prisma } from "~/lib/prisma.server";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "~/components/ui/confirm-dialog";

const AddProjectModal = lazy(() =>
    import("~/components/modals/add-project-modal").then((m) => ({ default: m.AddProjectModal }))
);

export async function loader() {
    const projects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
    });
    return { projects };
}

export const meta = () => [{ title: "Settings | InkyBay" }];

export default function ProjectListPage() {

    const navigate = useNavigate();
    const { projects } = useLoaderData<typeof loader>();
    const [editingRow, setEditingRow] = useState<number | null>(null);
    const [editedData, setEditedData] = useState<{ name: string; slug: string }>({ name: "", slug: "" });
    const [addProjectModalOpen, setAddProjectModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);

    const startEdit = (idx: number, project: any) => {
        setEditingRow(idx);
        setEditedData({ name: project.name, slug: project.slug });
    };

    const cancelEdit = () => {
        setEditingRow(null);
    };

    const saveEdit = async (projectId: number) => {
        const res = await fetch(`/api/settings/projects/${projectId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editedData),
        });
        console.log("======res.ok====>>", res);
        if (res.ok) {
            toast.success("Project updated successfully.");
            setEditingRow(null);
            refreshPage();

        } else {
            toast.error("Failed to add projects.");
        }
    };

    const handleDelete = async () => {
        if (!selectedProject) return;

        try {
            const res = await fetch(`/api/settings/projects/${selectedProject.id}`, {
                method: "DELETE",
            });
            if (!res.ok) toast.error("Failed to delete project.");
            toast.success("Project deleted successfully.");
            refreshPage();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete project.");
        }
    }

    const refreshPage = () => {
        navigate(window.location.pathname + window.location.search);
    };

    return (
        <div className="px-6 space-y-2">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
                <Button onClick={() => setAddProjectModalOpen(true)}>
                    <Plus /> Add Project
                </Button>
            </div>

            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Updated At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {projects.length > 0 ? (
                            projects.map((project, idx) => (
                                <TableRow key={project.id}>
                                    <TableCell>{idx + 1}</TableCell>

                                    {/* Editable Name */}
                                    <TableCell>
                                        {editingRow === idx ? (
                                            <input
                                                type="text"
                                                className="w-full border rounded px-2 py-1"
                                                value={editedData.name}
                                                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                                            />
                                        ) : (
                                            project.name
                                        )}
                                    </TableCell>

                                    {/* Editable Slug */}
                                    <TableCell>
                                        {editingRow === idx ? (
                                            <input
                                                type="text"
                                                className="w-full border rounded px-2 py-1"
                                                value={editedData.slug}
                                                onChange={(e) => setEditedData({ ...editedData, slug: e.target.value })}
                                            />
                                        ) : (
                                            project.slug
                                        )}
                                    </TableCell>

                                    <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(project.updatedAt).toLocaleDateString()}</TableCell>

                                    {/* Actions */}
                                    <TableCell>
                                        {editingRow === idx ? (
                                            <ButtonGroup>
                                                <Button variant="outline" onClick={() => saveEdit(project.id)}>
                                                    <Check /> Save
                                                </Button>
                                                <Button variant="destructive" onClick={cancelEdit}>
                                                    <X /> Cancel
                                                </Button>
                                            </ButtonGroup>
                                        ) : (
                                            <ButtonGroup>
                                                <Button variant="outline" onClick={() => startEdit(idx, project)}>
                                                    <PenBox />
                                                </Button>
                                                <Button variant="destructive" onClick={() => {
                                                    setDeleteDialogOpen(true);
                                                    setSelectedProject(project);
                                                }}>
                                                    <Trash2 />
                                                </Button>
                                            </ButtonGroup>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                    No projects found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* add project modal  */}
            {addProjectModalOpen && (
                <Suspense fallback={<CenterSpinner />}>
                    <AddProjectModal
                        open={addProjectModalOpen}
                        onOpenChange={setAddProjectModalOpen}
                        refreshPage={refreshPage}
                    />
                </Suspense>
            )}
            {deleteDialogOpen && (
                <Suspense fallback={<CenterSpinner />}>
                    <DeleteConfirmDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        title="Delete Project?"
                        description="Are you sure you want to permanently delete this chat? This action cannot be undone."
                        onConfirm={async () => handleDelete()}
                    />
                </Suspense>
            )}
        </div>
    );
}
