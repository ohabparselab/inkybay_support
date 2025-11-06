import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AddCommunitySchema, type AddCommunityInput } from "~/lib/validations";
import { useForm, Controller } from "react-hook-form";
import { Plus, X, Save, CalendarIcon } from "lucide-react";
import { CenterSpinner } from "@/components/ui/center-spinner";
import { RichTextEditor } from "../ui/rich-text-editor";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense, useEffect, useState } from "react";
import { AddOptionModal } from "./add-option-modal";
import { Calendar } from "@/components/ui/calendar";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { toast } from "sonner";
import { CommentInput } from "../comments/CommentInput";
import { CommentList } from "../comments/CommentList";

interface EditCommunityModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    community: any | null;
    refreshPage?: () => void;
}

export function EditCommunityModal({
    open,
    onOpenChange,
    community,
    refreshPage,
}: EditCommunityModalProps) {
    console.log("===community=== ", community);
    const [statusOptions, setStatusOptions] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [addStatusModalOpen, setAddStatusModalOpen] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AddCommunityInput>({
        resolver: zodResolver(AddCommunitySchema),
        // defaultValues: {
        //     question: "",
        //     questionUrl: "",
        //     reply: "",
        //     listedDate: undefined,
        //     projectId: "",
        //     addedById: "",
        //     statusId: "",
        //     comments: "",
        // },
    });

    // Load dropdown options
    const fetchData = async () => {
        const [projectsRes, usersRes, statusRes] = await Promise.all([
            fetch("/api/settings/projects").then((res) => res.json()),
            fetch("/api/users").then((res) => res.json()),
            fetch("/api/communities-statuses").then((res) => res.json()),
        ]);
        setProjects(projectsRes.projects || []);
        setUsers(usersRes.users || []);
        setStatusOptions(statusRes.statuses || []);
    };

    // Populate data on open
    useEffect(() => {
        if (open && community) {
            fetchData();
            reset({
                question: community.question || "",
                questionUrl: community.questionUrl || "",
                reply: community.reply || "",
                listedDate: community.listedDate ? new Date(community.listedDate) : undefined,
                projectId: community.projectId ? String(community.projectId) : "",
                addedById: community.addedById ? String(community.addedById) : "",
                statusId: community.statusId ? String(community.statusId) : "",
                comments: "",
            });
        }
    }, [open, community, reset]);

    const onSubmit = async (data: AddCommunityInput) => {
        try {
            const res = await fetch(`/api/communities/${community.id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update question.");
            toast.success("Question updated successfully.");
            onOpenChange(false);
            refreshPage?.();
        } catch (err: any) {
            toast.error(err.message || "Something went wrong.");
        }
    };

    if (!community) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Edit Question</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Question & URL */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Question</Label>
                            <Input {...register("question")} placeholder="Enter your question..." />
                            {errors.question && (
                                <p className="text-sm text-red-500">{errors.question.message}</p>
                            )}
                        </div>

                        <div>
                            <Label className="mb-2">Question URL</Label>
                            <Input {...register("questionUrl")} placeholder="https://..." />
                            {errors.questionUrl && (
                                <p className="text-sm text-red-500">{errors.questionUrl.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Project & Added By */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Project</Label>
                            <Controller
                                control={control}
                                name="projectId"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects.length === 0 ? (
                                                <div className="p-2 text-center text-sm text-muted-foreground">
                                                    No projects found
                                                </div>
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
                        </div>

                        <div>
                            <Label className="mb-2">Added By</Label>
                            <Controller
                                control={control}
                                name="addedById"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select User" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.length === 0 ? (
                                                <div className="p-2 text-center text-sm text-muted-foreground">
                                                    No users found
                                                </div>
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

                    {/* Status & Listed Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Status</Label>
                            <div className="flex gap-2 items-center">
                                <Controller
                                    control={control}
                                    name="statusId"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.length === 0 ? (
                                                    <div className="p-2 text-center text-sm text-muted-foreground">
                                                        No status found
                                                    </div>
                                                ) : (
                                                    statusOptions.map((status: any) => (
                                                        <SelectItem key={status.id} value={String(status.id)}>
                                                            {status.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => setAddStatusModalOpen(true)}
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Label className="mb-2">Listed Date</Label>
                            <Controller
                                control={control}
                                name="listedDate"
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
                                        <PopoverContent className="p-0">
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

                    {/* Reply */}
                    <div>
                        <RichTextEditor
                            control={control}
                            name="reply"
                            label="Reply"
                            placeholder="Enter reply details..."
                            error={errors.reply?.message}
                        />
                    </div>

                    {/* Comments */}
                    <div>
                        <Label className="mb-2">Comments</Label>
                        <CommentList contextId={community.id} contextType="community" users={users} />
                    </div>

                    {/* Footer */}
                    <DialogFooter className="!justify-center flex gap-2">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                onOpenChange(false);
                                reset();
                            }}
                        >
                            <X /> Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner /> : <Save className="w-4 h-4 mr-1" />} Update Question
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            {/* Add Status Modal */}
            {addStatusModalOpen && (
                <Suspense fallback={<CenterSpinner />}>
                    <AddOptionModal
                        open={addStatusModalOpen}
                        onOpenChange={setAddStatusModalOpen}
                        setItems={setStatusOptions}
                        endpoint="/api/communities-statuses"
                        title="Add New Status"
                        label="Status Name"
                        successMessage="Status added successfully."
                    />
                </Suspense>
            )}
        </Dialog>
    );
}
