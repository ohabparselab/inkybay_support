import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addProjectSchema, type AddProjectForm } from "~/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Label } from "../ui/label";
import { useEffect } from "react";
import { toast } from "sonner";

interface AddProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    refreshPage?: () => void;
}

export function AddProjectModal({ open, onOpenChange, refreshPage }: AddProjectModalProps) {

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<AddProjectForm>({
        resolver: zodResolver(addProjectSchema),
        defaultValues: { name: "", slug: "" },
    });

    // Auto-generate slug from name
    const projectName = watch("name");
    useEffect(() => {
        if (projectName) {
            const slug = projectName
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]+/g, "");
            setValue("slug", slug);
        }
    }, [projectName, setValue]);

    const onSubmit = async (data: AddProjectForm) => {
        try {
            const res = await fetch("/api/settings/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) toast.error("Failed to add projects.");
            toast.success("Project added successfully.");

            if (refreshPage) refreshPage();
            reset();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || "Failed to add project.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Project</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div>
                        <Label className="pb-2">Name</Label>
                        <Input placeholder="Enter project Name" {...register("name")} />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <Label className="pb-2">Slug</Label>
                        <Input placeholder="Enter slug..." {...register("slug")} />
                        {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug.message}</p>}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Project"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
