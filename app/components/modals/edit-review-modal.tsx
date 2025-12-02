import { CalendarIcon, Save, X, ListRestart, Star } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addReviewSchema, type AddReviewInput } from "~/lib/validations";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerWithClear } from "../ui/date-picker";

interface EditReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    review: any;
    refreshPage?: () => void;
}

export function EditReviewModal({ open, onOpenChange, review, refreshPage }: EditReviewModalProps) {

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<any>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<AddReviewInput>({
        resolver: zodResolver(addReviewSchema)
    });

    // Refill when modal opens
    useEffect(() => {
        if (review) {
            const projectId = review.projectId || review.chat?.projectId || review.meeting?.projectId;

            reset({
                shopUrl: review.shopUrl || review.chat?.shopUrl || review.chat?.client?.shopDomain || review.meeting?.storeUrl || "",
                shopName: review.shopName || review.chat?.shopName || review.chat?.client?.shopName || "",
                rating: review.rating || 0,
                reviewText: review.reviewText || "",
                reviewApproachBy: review.approachByUser?.id ? String(review.approachByUser.id) : "",
                projectId: String(projectId),
                lastReviewApproach: review.lastReviewApproach ? new Date(review.lastReviewApproach) : undefined,
                reviewSubmittedAt: review.reviewSubmittedAt ? new Date(review.reviewSubmittedAt) : undefined,
            });
        }
    }, [review, reset]);

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
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => setUsers(data.users || []))
            .catch(() => setUsers([]));
        fetchProjects();
    }, []);

    const onSubmit = async (data: AddReviewInput) => {
        try {
            setLoading(true);

            const res = await fetch(`/api/reviews/${review.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                toast.success("Review updated successfully!");
                onOpenChange(false);
                if (refreshPage) refreshPage();
            } else {
                toast.error("Failed to update review.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Edit Review</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-3">
                    {/* Shop info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Store URL</Label>
                            <Input {...register("shopUrl")} placeholder="store.myshopify.com" />
                            {errors.shopUrl && <p className="text-sm text-red-500">{errors.shopUrl.message}</p>}
                        </div>
                        <div>
                            <Label className="mb-2">Shop Name</Label>
                            <Input {...register("shopName")} placeholder="My Shopify Store" />
                            {errors.shopName && <p className="text-sm text-red-500">{errors.shopName.message}</p>}
                        </div>
                    </div>

                    {/* Rating + mood */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Review Rating</Label>
                            <div className="flex gap-1 mt-2">
                                {[...Array(5)].map((_, i) => {
                                    const current = watch("rating") ?? 0;
                                    return (
                                        <Star
                                            key={i}
                                            className={`h-6 w-6 cursor-pointer ${i < current ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                                }`}
                                            onClick={() => {
                                                setValue("rating", current === i + 1 ? 0 : i + 1);
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Review Text */}
                    <div>
                        <Label className="mb-2">Review Text</Label>
                        <Textarea {...register("reviewText")} className="h-[10vh]" />
                        {errors.reviewText && <p className="text-sm text-red-500">{errors.reviewText.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Approached By</Label>
                            <Controller
                                control={control}
                                name="reviewApproachBy"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select approacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                users.length == 0 ? (
                                                    <div className="p-2 text-center text-sm text-muted-foreground">No user found</div>
                                                ) : (
                                                    users.map((u) => (
                                                        <SelectItem key={u.id} value={String(u.id)}>
                                                            {u.fullName}
                                                        </SelectItem>
                                                    ))
                                                )
                                            }
                                        </SelectContent>
                                    </Select>
                                )}
                            />
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

                    {/* Approach + Dates */}
                    <div className="grid grid-cols-2 gap-4 ">
                        <div>
                            <Label className="mb-2">Approached Date</Label>
                            <Controller
                                control={control}
                                name="lastReviewApproach"
                                render={({ field }) => (
                                    <DatePickerWithClear
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Pick a date"
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Label className="mb-2">Review Submitted At</Label>
                            <Controller
                                control={control}
                                name="reviewSubmittedAt"
                                render={({ field }) => (
                                    <DatePickerWithClear
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Pick a date"
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <DialogFooter className="flex !justify-center gap-3 mt-6">
                        <Button type="button" variant="destructive" onClick={() => { onOpenChange(false); reset(); }}>
                            <X /> Cancel
                        </Button>
                        <Button type="button" variant="outline" onClick={() => reset()}>
                            <ListRestart /> Reset
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : <Save />} Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
