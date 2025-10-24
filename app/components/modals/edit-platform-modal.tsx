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

interface EditPlatformModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    refreshPage?: () => void;
    projects: { id: number; name: string }[];
    platform: {
        id: number;
        name: string;
        slug: string;
        projectId: number;
    };
}

export function EditPlatformModal({
    open,
    onOpenChange,
    refreshPage,
    projects,
    platform,
}: EditPlatformModalProps) {
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
            name: platform?.name || "",
            slug: platform?.slug || "",
            projectId: platform?.projectId || undefined,
        },
    });

    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    const name = watch("name");
    const slug = watch("slug");

    // Auto-generate slug from name (only if user hasn't manually edited slug)
    useEffect(() => {
        if (name && !slugManuallyEdited) {
            const generated = name
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]+/g, "");
            setValue("slug", generated);
        }
    }, [name, slugManuallyEdited, setValue]);

    // Reset form when modal opens with new platform data
    useEffect(() => {
        if (platform) {
            reset({
                name: platform.name,
                slug: platform.slug,
                projectId: platform.projectId,
            });
            setSlugManuallyEdited(false);
        }
    }, [platform, reset]);

    const onSubmit = async (data: AddPlatformForm) => {
        try {
            const res = await fetch(`/api/settings/platforms/${platform.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                toast.error("Failed to update platform.");
                return;
            }

            toast.success("Platform updated successfully.");
            if (refreshPage) refreshPage();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || "Something went wrong.");
        }


    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Platform</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    {/* Project Select */}
                    <div>
                        <Label className="pb-2">Select Project</Label>
                        <Select
                            onValueChange={(val) => setValue("projectId", Number(val))}
                            defaultValue={platform?.projectId ? String(platform.projectId) : undefined}
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

                    {/* Name */}
                    <div>
                        <Label className="pb-2">Platform Name</Label>
                        <Input placeholder="Enter platform name" {...register("name")} />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Slug */}
                    <div>
                        <Label className="pb-2">Slug</Label>
                        <Input
                            placeholder="Enter slug"
                            {...register("slug")}
                            onChange={(e) => {
                                setValue("slug", e.target.value);
                                setSlugManuallyEdited(true);
                            }}
                            value={slug}
                        />
                        {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug.message}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}