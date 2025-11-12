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

interface EditReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    review: any;
    refreshPage?: () => void;
}

export function EditReviewModal({ open, onOpenChange, review, refreshPage }: EditReviewModalProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

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
            reset({
                shopUrl: review.shopUrl || review.chat?.shopUrl || review.chat?.client?.shopDomain || review.meeting?.storeUrl || "",
                shopName: review.shopName || review.chat?.shopName || review.chat?.client?.shopName || "",
                agentRating: review.agentRating || 0,
                ratingMood: review.ratingMood || "",
                reviewText: review.reviewText || "",
                reviewApproachBy: review.approachByUser?.id ? String(review.approachByUser.id) : "",
                lastReviewApproach: review.lastReviewApproach ? new Date(review.lastReviewApproach) : undefined,
                reviewSubmittedAt: review.reviewSubmittedAt ? new Date(review.reviewSubmittedAt) : undefined,
            });
        }
    }, [review, reset]);

    useEffect(() => {
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => setUsers(data.users || []))
            .catch(() => setUsers([]));
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
                            <Label>Agent Rating</Label>
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
                            <Label className="mb-2">Rating Mood</Label>
                            <Controller
                                name="ratingMood"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select mood" />
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
                        <Textarea {...register("reviewText")} className="h-[10vh]" />
                        {errors.reviewText && <p className="text-sm text-red-500">{errors.reviewText.message}</p>}
                    </div>

                    {/* Approach + Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
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
                                            {users.map((u) => (
                                                <SelectItem key={u.id} value={String(u.id)}>
                                                    {u.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

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

                    {/* Footer */}
                    <DialogFooter className="flex !justify-center gap-3 mt-6">
                        <Button variant="destructive" onClick={() => { onOpenChange(false); reset(); }}>
                            <X /> Cancel
                        </Button>
                        <Button variant="outline" onClick={() => reset()}>
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
