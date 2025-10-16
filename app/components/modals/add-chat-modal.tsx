
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addChatSchema, type AddChatFormInput } from "~/lib/validations";
import { CalendarIcon, ListRestart, Plus, Star, X } from "lucide-react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { TagsInput } from "../ui/tags";

interface AddChatModalProps {
    clientId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddChatModal({ clientId, open, onOpenChange }: AddChatModalProps) {

    const [users, setUsers] = useState<any>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<AddChatFormInput>({
        resolver: zodResolver(addChatSchema),
        defaultValues: {
            clientEmails: [],
            tags: [],
            reviewAsked: false,
            reviewStatus: false,
            handleBy: "",
            agentRating: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "clientEmails",
    });

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const res = await fetch("/api/users");
            const data = await res.json();
            setUsers(data.users);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoadingUsers(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const onSubmit = async (data: AddChatFormInput) => {

        const formData = new FormData();
        // Append all primitive fields
        formData.append("clientId", clientId ? String(clientId) : "");
        formData.append("clientQuery", data.clientQuery ? String(data.clientQuery) : "");
        formData.append("handleBy", data.handleBy ? String(data.handleBy) : "");
        formData.append("chatDate", data.chatDate ? data.chatDate.toISOString() : "");
        formData.append("lastReviewApproach", data.lastReviewApproach ? data.lastReviewApproach.toISOString() : "");
        formData.append("reviewAsked", data.reviewAsked ? "true" : "false");
        formData.append("reviewStatus", data.reviewStatus ? "true" : "false");
        formData.append("reviewText", data.reviewText || "");
        formData.append("clientFeedback", data.clientFeedback || "");
        formData.append("storeDetails", data.storeDetails || "");
        formData.append("featureRequest", data.featureRequest || "");
        formData.append("agentRating", data.agentRating ? String(data.agentRating) : "");
        formData.append("agentComments", data.agentComments || "");
        formData.append("otherStoresUrl", data.otherStoresUrl || "");
        formData.append("changesMadeByAgent", data.changesMadeByAgent || "");

        // Append file
        if (data.chatTranscript[0]) {
            formData.append("chatTranscript", data.chatTranscript[0]);
        }

        // Append clientEmails array
        data.clientEmails?.forEach((email: string) => {
            formData.append("clientEmails[]", email);
        });

        data.tags?.forEach((tag: string) => {
            formData.append("tags[]", tag);
        });

        // Send the request
        const res = await fetch("/api/chats", {
            method: "POST",
            body: formData,
        });

        const result = await res.json();
        if (res.ok) {
            toast.success('New chat added successfully.');
            onOpenChange(false);
            reset();
        } else {
            toast.error('Something is wrong, please again.');
        }

    };

    console.log("Errors========>>:", errors);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Add New Chat</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-3">
                    {/* Client Query */}
                    <div>
                        <Label className="mb-2">Client Query</Label>
                        <Textarea
                            {...register("clientQuery")}
                            placeholder="Enter detailed client query..."
                            className="min-h-[100px]"
                        />
                        {errors.clientQuery && (
                            <p className="text-sm text-red-500">{errors.clientQuery.message}</p>
                        )}
                    </div>

                    {/* Client Emails + Chat Transcript */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Client Emails</Label>
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 mt-2">
                                    <Input
                                        {...register(`clientEmails.${index}`)}
                                        placeholder="client@example.com"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => remove(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="mt-2"
                                onClick={() => append("")}
                            >
                                <Plus /> Add Email
                            </Button>
                        </div>
                        <div>
                            <Label className="mb-2">Chat Transcript</Label>
                            <Input type="file" {...register("chatTranscript")} />
                        </div>
                    </div>

                    {/* Review Asked + Status + Text */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <Label>Review Asked ?</Label>
                                <Controller
                                    name="reviewAsked"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            checked={field.value || false}
                                            onCheckedChange={(checked) => field.onChange(checked)}
                                        />
                                    )}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label>Review Status ?</Label>
                                <Controller
                                    name="reviewStatus"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            checked={field.value || false}
                                            onCheckedChange={(checked) => field.onChange(checked)}
                                        />
                                    )}
                                />
                            </div>

                        </div>
                        <div>
                            <Label className="mb-2">Last Review Approach Date</Label>
                            <Controller
                                control={control}
                                name="lastReviewApproach"
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                {field.value ? format(field.value, "PPP") : "Pick a date"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start" className="p-0">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                        </div>

                    </div>

                    {/* Last Review Approach Date + Client Feedback */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Review Text</Label>
                            <Textarea {...register("reviewText")} placeholder="Enter review note..." />
                        </div>
                        <div>
                            <Label className="mb-2">Client Feedback</Label>
                            <Textarea {...register("clientFeedback")} placeholder="Feedback text..." />
                        </div>
                    </div>

                    {/* Product Details + Feature Request */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Store Products Details / Category</Label>
                            <Input {...register("storeDetails")} placeholder="Store category..." />
                        </div>
                        <div>
                            <Label className="mb-2">Other Stores URL (If any)</Label>
                            <Input {...register("otherStoresUrl")} placeholder="https://example.com" />
                        </div>
                    </div>

                    {/* Agent Rating + Other Store URL */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        <div>
                            <Label className="mb-2">Rating</Label>
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
                            <Label className="mb-2">Feature Request</Label>
                            <Textarea {...register("featureRequest")} placeholder="Feature request..." />
                        </div>
                    </div>

                    {/* Handled By + Chat Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Handled By</Label>
                            <Controller
                                control={control}
                                name="handleBy"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={loadingUsers}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={loadingUsers ? "Loading..." : "Select Agent"} />
                                        </SelectTrigger>
                                        <SelectContent className="w-full">
                                            {loadingUsers ? (
                                                <div className="p-2 text-center text-sm text-muted-foreground">Loading...</div>
                                            ) : users.length === 0 ? (
                                                <div className="p-2 text-center text-sm text-muted-foreground">No user found</div>
                                            ) : (
                                                users.map((user: any) => (
                                                    <SelectItem key={user.id} value={String(user.id)}>
                                                        {user.fullName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.handleBy && (
                                <p className="text-sm text-red-500">{errors.handleBy.message}</p>
                            )}
                        </div>
                        <div>
                            <Label className="mb-2">Chat Date</Label>
                            <Controller
                                control={control}
                                name="chatDate"
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                {field.value ? format(field.value, "PPP") : "Pick a date"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start" className="p-0">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.chatDate && (
                                <p className="text-sm text-red-500">{errors.chatDate.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Tags</Label>
                            <TagsInput control={control} name="tags" />
                            <p className="text-sm">Press Enter</p>
                        </div>
                        <div>
                            <Label className="mb-2">Changes Made by Agent</Label>
                            <Textarea {...register("changesMadeByAgent")} placeholder="Write changes..." />
                        </div>
                    </div>
                    {/* Agent Comments */}
                    <div>
                        <Label className="mb-2">Comments</Label>
                        <Textarea {...register("agentComments")} placeholder="Write comments..." />
                    </div>

                    <DialogFooter className="!justify-center flex w-full">
                        <Button onClick={() => {
                            onOpenChange(false);
                            reset();
                        }} variant="destructive">
                            <X />
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            reset();
                        }} variant="outline">
                            <ListRestart />
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            disabled={loadingUsers}
                        >
                            <Plus className="h-4 w-4" />
                            Add New Chat
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}