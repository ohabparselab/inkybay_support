import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { addFeatureRequestSchema, type AddFeatureRequestInput } from "~/lib/validations";
import { Textarea } from "~/components/ui/textarea";
import { ListRestart, Plus, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "../ui/spinner";


interface AddFeatureRequestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    refreshPage?: () => void;
}

export function AddFeatureRequestModal({ open, onOpenChange, refreshPage }: AddFeatureRequestModalProps) {

    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<any>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AddFeatureRequestInput>({
        resolver: zodResolver(addFeatureRequestSchema),
        defaultValues: {
            shopUrl: "",
            shopName: "",
            email: "",
            featureDetails: "",
        },
    });

    const fetchProjects = async () => {
        try {
            setLoadingProjects(true);
            const res = await fetch("/api/settings/projects");
            const data = await res.json();
            setProjects(data.projects);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
        } finally {
            setLoadingProjects(false);
        }
    }

    useEffect(() => {
        fetchProjects();
    }, []);

    const onSubmit = async (data: AddFeatureRequestInput) => {
        try {
            setLoading(true);

            const res = await fetch("/api/features", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to add feature request");

            toast.success("Feature request added successfully!");
            reset();
            onOpenChange(false);
            if (refreshPage) refreshPage();
        } catch (err: any) {
            toast.error(err.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Feature Request</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-3">
                    {/* Shop URL & Shop Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Shop URL</Label>
                            <Input {...register("shopUrl")} placeholder="store.myshopify.com" />
                            {errors.shopUrl && <p className="text-sm text-red-500">{errors.shopUrl.message}</p>}
                        </div>
                        <div>
                            <Label className="mb-2">Shop Name</Label>
                            <Input {...register("shopName")} placeholder="My Shopify Store" />
                            {errors.shopName && <p className="text-sm text-red-500">{errors.shopName.message}</p>}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Email</Label>
                            <Input {...register("email")} placeholder="example@email.com" />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>
                        <div>
                            <Label className="mb-2">Project</Label>
                            <Controller
                                control={control}
                                name="projectId"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={loadingProjects}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={loadingProjects ? "Loading..." : "Select Project"} />
                                        </SelectTrigger>
                                        <SelectContent className="w-full">
                                            {loadingProjects ? (
                                                <div className="p-2 text-center text-sm text-muted-foreground">Loading...</div>
                                            ) : projects.length === 0 ? (
                                                <div className="p-2 text-center text-sm text-muted-foreground">No user found</div>
                                            ) : (
                                                projects.map((project: any) => (
                                                    <SelectItem key={project.id} value={String(project.id)}>
                                                        {project.projectName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.projectId && (
                                <p className="text-sm text-red-500">{errors.projectId.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Feature Details */}
                    <div>
                        <Label className="mb-2">Feature Details</Label>
                        <Textarea {...register("featureDetails")} placeholder="Describe the feature request..." className="h-[15vh]" />
                        {errors.featureDetails && <p className="text-sm text-red-500">{errors.featureDetails.message}</p>}
                    </div>

                    {/* Footer Buttons */}
                    <DialogFooter className="flex !justify-center gap-3 mt-6">
                        <Button variant="destructive" onClick={() => { onOpenChange(false); reset(); }}>
                            <X /> Cancel
                        </Button>
                        <Button variant="outline" onClick={() => reset()}>
                            <ListRestart /> Reset
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : <Plus />} Add Feature Request
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
