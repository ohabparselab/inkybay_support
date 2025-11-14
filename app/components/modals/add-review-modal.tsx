import { CalendarIcon, Plus, X, ListRestart, Star } from "lucide-react";
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

interface AddReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    refreshPage?: () => void;
}

export function AddReviewModal({ open, onOpenChange, refreshPage }: AddReviewModalProps) {

    const [users, setUsers] = useState<any[]>([]);
    const [formSubmitLoading, setFormSubmitLoading] = useState(false);
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
        resolver: zodResolver(addReviewSchema),
        defaultValues: {
            agentRating: 0
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
        // Simulate fetch for agents or user list
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => setUsers(data.users || []))
            .catch(() => setUsers([]));
        fetchProjects();
    }, []);

    const onSubmit = async (data: AddReviewInput) => {
        try {
            setFormSubmitLoading(true);
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                toast.success("Review added successfully!");
                onOpenChange(false);
                reset();
                if (refreshPage) refreshPage();
            } else {
                toast.error("Failed to add review");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong!");
        } finally {
            setFormSubmitLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Add New Review</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-3">
                    {/* Store URL & Shop Name */}
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

                    {/* Rating & Mood */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Agent Rating</Label>
                            <div className="flex gap-1 mt-2">
                                {[...Array(10)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-6 w-6 cursor-pointer ${i < (watch("agentRating") ?? 0)
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-gray-300"
                                            }`}
                                        onClick={() => setValue("agentRating", i + 1)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label className="mb-2">Rating mood</Label>
                            <Controller
                                name="ratingMood"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select rating mood" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="positive">Positive</SelectItem>
                                            <SelectItem value="neutral">Neutral</SelectItem>
                                            <SelectItem value="negative">Negative</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    {/* Review Text */}
                    <div>
                        <Label className="mb-2">Review Text</Label>
                        <Textarea {...register("reviewText")} placeholder="Write your review..." className="h-[10vh]" />
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

                    {/* Approached By & Dates */}
                    <div className="grid grid-cols-2  gap-4">
                        <div>
                            <Label className="mb-2">Approached Date</Label>
                            <Controller
                                control={control}
                                name="lastReviewApproach"
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start">
                                                {field.value ? format(field.value, "PPP") : "Pick date"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start" className="p-0">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                        </div>

                        <div>
                            <Label className="mb-2">Review Submitted At</Label>
                            <Controller
                                control={control}
                                name="reviewSubmittedAt"
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start">
                                                {field.value ? format(field.value, "PPP") : "Pick date"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start" className="p-0">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <DialogFooter className="flex !justify-center gap-3 mt-6">
                        <Button variant="destructive" onClick={() => { onOpenChange(false); reset(); }}>
                            <X /> Cancel
                        </Button>
                        <Button variant="outline" onClick={() => reset()}>
                            <ListRestart /> Reset
                        </Button>
                        <Button type="submit" disabled={formSubmitLoading}>
                            {formSubmitLoading ? <Spinner /> : <Plus />} Add Review
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
