import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addPlatformSchema, type AddPlatformForm } from "~/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AddPlatformModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    refreshPage?: () => void;
    projects: { id: number; name: string }[];
}

export function AddPlatformModal({ open, onOpenChange, refreshPage, projects }: AddPlatformModalProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<AddPlatformForm>({
        resolver: zodResolver(addPlatformSchema),
        defaultValues: {
            name: "",
            slug: "",
        },
    });

    const [selectedProjectName, setSelectedProjectName] = useState<string>("");

    const platformName = watch("name");

    // Auto-generate slug dynamically
    useEffect(() => {
        if (!selectedProjectName && !platformName) return;

        const normalize = (str: string) =>
            str
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]+/g, "");

        const slugParts = [selectedProjectName, platformName].filter(Boolean);
        const slug = slugParts.map(normalize).join("-");
        setValue("slug", slug);
    }, [selectedProjectName, platformName, setValue]);

    const onSubmit = async (data: AddPlatformForm) => {
        try {
            const res = await fetch("/api/settings/platforms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                toast.error("Failed to add platform.");
                return;
            }

            toast.success("Platform added successfully.");
            if (refreshPage) refreshPage();
            reset();
            setSelectedProjectName("");
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || "Something went wrong.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Platform</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    {/* Project Select */}
                    <div>
                        <Label className="pb-2">Select Project</Label>
                        <Select
                            onValueChange={(val) => {
                                const project = projects.find((p) => p.id === Number(val));
                                setValue("projectId", Number(val));
                                setSelectedProjectName(project?.name || "");
                            }}
                            defaultValue={watch("projectId") ? String(watch("projectId")) : undefined}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.projectId && (
                            <p className="text-sm text-red-500 mt-1">{errors.projectId.message}</p>
                        )}
                    </div>

                    {/* Platform Name */}
                    <div>
                        <Label className="pb-2">Platform Name</Label>
                        <Input placeholder="Enter platform name" {...register("name")} />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Slug */}
                    <div>
                        <Label className="pb-2">Slug</Label>
                        <Input placeholder="Slug will be auto-generated" {...register("slug")} readOnly />
                        {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug.message}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Platform"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
