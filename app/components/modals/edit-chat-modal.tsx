import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addChatSchema, type AddChatFormInput } from "~/lib/validations";
import { CalendarIcon, ListRestart, Plus, Save, Star, X } from "lucide-react";
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
import { CommentList } from "@/components/comments/CommentList";
import { Spinner } from "@/components/ui/spinner";
import { TagsInput } from "@/components/ui/tags";
import { DatePickerWithClear } from "../ui/date-picker";
import { localDateToUtcIso } from "~/lib/helper.sever";

interface EditChatModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    refreshPage?: () => void;
    chat: any;
}

export function EditChatModal({ open, onOpenChange, chat, refreshPage }: EditChatModalProps) {

    const [projects, setProjects] = useState<any>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [currentUserId, setCurrentUserId] = useState<any>();
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AddChatFormInput>({
        resolver: zodResolver(addChatSchema),
        defaultValues: {
            clientQuery: chat?.clientQuery || "",
            clientEmails: chat?.client?.clientEmail?.map((e: any) => e.email) || [],
            tags: chat?.chatTags?.map((t: any) => t.tag.name) || [],
            reviewAsked: chat?.review?.reviewAsked || false,
            reviewStatus: chat?.review?.reviewStatus || false,
            handleBy: chat?.handleBy?.toString() || "",
            agentRating: chat?.review?.agentRating || 0,
            reviewText: chat?.review?.reviewText || "",
            clientFeedback: chat?.clientFeedback || "",
            storeDetails: chat?.storeDetails || "",
            featureRequest: chat?.featureRequest?.featureDetails || "",
            otherStoresUrl: chat?.otherStoresUrl || "",
            changesMadeByAgent: chat?.changesMadeByAgent || "",
            chatDate: chat?.chatDate ? new Date(chat.chatDate) : undefined,
            lastReviewApproach: chat?.review?.lastReviewApproach
                ? new Date(chat.review?.lastReviewApproach)
                : undefined,
            externalChat: chat.externalChat

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
            setCurrentUserId(data.currentUserId);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoadingUsers(false);
        }
    };

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
        fetchUsers();
        fetchProjects();
    }, []);

    // Reset form when chat changes
    useEffect(() => {
        if (chat) {
            reset({
                clientQuery: chat?.clientQuery || "",
                clientEmails: chat?.client?.clientEmail?.map((e: any) => e.email) || [],
                tags: chat.chatTags?.map((t: any) => t.tag.name) || [],
                reviewAsked: chat.review?.reviewAsked || false,
                reviewStatus: chat.review?.reviewStatus || false,
                handleBy: chat.handleBy?.toString() || "",
                agentRating: chat?.agentRating || 0,
                reviewText: chat.review?.reviewText || "",
                clientFeedback: chat.clientFeedback || "",
                storeDetails: chat.storeDetails || "",
                featureRequest: chat.featureRequest?.featureDetails || "",
                otherStoresUrl: chat.otherStoresUrl || "",
                changesMadeByAgent: chat.changesMadeByAgent || "",
                chatDate: chat.chatDate ? new Date(chat.chatDate) : undefined,
                lastReviewApproach: chat.review?.lastReviewApproach
                    ? new Date(chat.review?.lastReviewApproach)
                    : undefined,
                shopUrl: chat.shopUrl || "",
                shopName: chat.shopName || "",
                shopEmail: chat.shopEmail || "",
                projectId: chat.projectId?.toString() || "",
                storefrontPassword: chat.storefrontPassword || "",
                reviewNotAskReason: chat.review?.reviewNotAskReason || "",
                reviewSubmittedAt: chat.review?.reviewSubmittedAt
                    ? new Date(chat.review?.reviewSubmittedAt)
                    : undefined,
                reviewApproachBy: chat.review?.reviewApproachBy?.toString() || "",
                ratingMood: chat.review?.ratingMood?.toString() || "",
                rating: chat.review?.rating || 0,
                externalChat: chat.externalChat,
            });
        }
    }, [chat, reset]);

    const onSubmit = async (data: AddChatFormInput) => {

        const formData = new FormData();

        const appendFormData = (key: string, value: any) => {
            if (value === undefined || value === null) return;
            // Handle arrays
            if (Array.isArray(value)) {
                value.forEach((v) => appendFormData(`${key}[]`, v));
                return;
            }
            
            // Handle Date
            if (value instanceof Date) {
                formData.append(key, value.toISOString());
                return;
            }
            // Handle FileList
            if (value instanceof FileList) {
                if (value.length > 0) formData.append(key, value[0]);
                return;
            }
            // Handle object (recursive)
            if (typeof value === "object" && !(value instanceof File)) {
                Object.entries(value).forEach(([subKey, subVal]) =>
                    appendFormData(`${key}[${subKey}]`, subVal)
                );
                return;
            }
            // Handle boolean
            if (typeof value === "boolean") {
                formData.append(key, value ? "true" : "false");
                return;
            }
            // Default primitive (string, number)
            formData.append(key, String(value));
        };

        // Always append clientId (if exists)
        if (chat?.clientId) appendFormData("clientId", chat?.clientId);

        // Dynamically append all form fields
        Object.entries(data).forEach(([key, value]) => appendFormData(key, value));

        const res = await fetch(`/api/chats/${chat.id}`, {
            method: "PUT",
            body: formData,
        });

        if (res.ok) {
            toast.success("Chat updated successfully.");
            onOpenChange(false);
            if (refreshPage) refreshPage();
        } else {
            toast.error("Failed to update chat.");
        }
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Edit Chat
                        {
                            chat?.client?.shopDomain && (
                                <>
                                    (
                                    <span className="font-semibold text-foreground">{chat.client.shopName}</span>, {" "}
                                    < a
                                        href={`https://${chat.client.shopDomain}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {chat.client.shopDomain}
                                    </a>
                                    )
                                </>
                            )
                        }
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-3">
                    {/* Client Query */}

                    {
                        chat.externalChat && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Label>External chat </Label>
                                        <Controller
                                            name="externalChat"
                                            control={control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    checked={chat.externalChat}
                                                    onCheckedChange={(checked) => field.onChange(checked)}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <Label className="mb-2">Shop URL</Label>
                                        <Input {...register("shopUrl")} placeholder="Enter shop url..." />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2">Shop Name</Label>
                                        <Input type="text" {...register("shopName")} placeholder="Enter shop name..." />
                                    </div>
                                    <div>
                                        <Label className="mb-2">Shop Email</Label>
                                        <Input type="email" {...register("shopEmail")} placeholder="Enter shop email..." />
                                    </div>
                                </div>
                            </>
                        )
                    }
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

                    {/* project + store password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <div>
                            <Label className="mb-2">Storefront Password</Label>
                            <Input {...register("storefrontPassword")} placeholder="Enter store password..." />
                        </div>
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
                            <div>
                                <Label className="mb-2">Review Rating</Label>
                                <div className="flex gap-1 mt-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-6 w-6 cursor-pointer ${i < (watch("rating") ?? 0)
                                                ? "text-yellow-500 fill-yellow-500"
                                                : "text-gray-300"
                                                }`}
                                            onClick={() => setValue("rating", i + 1)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="mb-2">Review Approach Date</Label>
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
                                <Label className="mb-2">Review Approach By</Label>
                                <Controller
                                    control={control}
                                    name="reviewApproachBy"
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={loadingUsers}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={loadingUsers ? "Loading..." : "Select approacher"} />
                                            </SelectTrigger>
                                            <SelectContent>
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
                            </div>
                        </div>
                    </div>

                    {/* Last Review Approach Date + Client Feedback */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Reason Behind not Asking for Review</Label>
                            <Textarea {...register("reviewNotAskReason")} placeholder="Enter reason details..." />
                        </div>
                        <div>
                            <Label className="mb-2">Review submitted at</Label>
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
                                    <DatePickerWithClear
                                        value={field.onChange == undefined ? undefined : field.value}
                                        onChange={field.onChange}
                                        placeholder="Pick a date"
                                    />
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
                    <div>
                        <Label className="mb-2">Feature Request</Label>
                        <Textarea {...register("featureRequest")} placeholder="Enter feature request details..." />
                    </div>
                    {/* Agent Comments */}
                    <div>
                        <Label className="mb-2">Comments</Label>
                        <CommentList contextId={chat.id} currentUserId={currentUserId} contextType="chat" users={users} />
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
                            disabled={isSubmitting}
                        >
                            {
                                isSubmitting ? (<Spinner />) : (<Save className="h-4 w-4" />)
                            }
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
