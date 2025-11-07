import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon, Eye, EyeOff, ListRestart, Plus, X } from "lucide-react";
import { addTaskSchema, type AddTaskFormInput } from "~/lib/validations";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { lazy, Suspense, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CenterSpinner } from "../ui/center-spinner";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toast } from "sonner";
import { CommentInput } from "../comments/CommentInput";

const AddStatusModal = lazy(() =>
    import('~/components/modals/add-status-modal').then(module => ({ default: module.AddStatusModal }))
);

interface AddTaskModalProps {
    clientId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    refreshPage: () => void;
    task: any
}

export function AddTaskModal({ clientId, open, onOpenChange, task, refreshPage }: AddTaskModalProps) {

    const [users, setUsers] = useState<any>([]);
    const [projects, setProjects] = useState<any>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { control, register, watch, setValue, handleSubmit, formState: { errors }, reset } = useForm<AddTaskFormInput>({
        resolver: zodResolver(addTaskSchema),
        defaultValues: {
            providedBy: "",
            taskStatus: "",
            taskAddedDate: undefined,
            storePassword: "",
            storeAccess: "",
            emails: [],
            solvedBy: "",
            notes: "",
            comments: "",
            mentions: [],
        },
    });

    const [statuses, setStatuses] = useState<{ id: number, name: string }[]>([]);
    const [addStatusModalOpen, setAddStatusModalOpen] = useState(false);

    const fetchStatuses = async () => {
        const res = await fetch("/api/statuses");
        const data = await res.json();
        setStatuses(data.statuses);
    };

    const { fields, append, remove } = useFieldArray<any>({
        control,
        name: "emails",
    });

    const onSubmit = async (data: AddTaskFormInput) => {
        const formatData = {
            ...data,
            clientId
        }

        const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formatData),
        })

        if (res.ok) {
            toast.success("Task created successfully!")
            onOpenChange(false);
            reset()
            if (refreshPage) refreshPage();
        } else {
            toast.error("Failed to create task.")
        }
    };

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

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/settings/projects");
            const data = await res.json();
            setProjects(data.projects);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
        } finally {
        }
    }

    useEffect(() => {
        fetchUsers();
        fetchStatuses();
        fetchProjects();
    }, []);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Add New Task
                        (
                        <span className="font-semibold text-foreground">{task.client.shopName}</span>,{" "}
                        <a
                            href={`https://${task.client.shopDomain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            {task.client.shopDomain}
                        </a>
                        )
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-3">

                    {/* Task Details */}
                    <div>
                        <RichTextEditor
                            control={control}
                            name="taskDetails"
                            label="Task Details"
                            placeholder="Enter task details..."
                            error={errors.taskDetails?.message} />
                    </div>

                    {/* Provided By + Task Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Provided By</Label>
                            <Controller
                                control={control}
                                name="providedBy"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Provider" />
                                        </SelectTrigger>
                                        <SelectContent className="w-full">
                                            {users.map((user: any) => (
                                                <SelectItem key={user.id} value={String(user.id)}>
                                                    {user.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.providedBy && (
                                <p className="text-sm text-red-500">{errors.providedBy.message}</p>
                            )}
                        </div>
                        <div>
                            <Label className="mb-2">Task Status</Label>
                            <div className="flex items-center justify-between">
                                <Controller
                                    control={control}
                                    name="taskStatus"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent className="w-full">
                                                {statuses.length === 0 ? (
                                                    <div className="p-2 text-center text-sm text-muted-foreground">No status found</div>
                                                ) : (
                                                    statuses.map((status, i) => (
                                                        <SelectItem key={i} value={String(status.id)}>
                                                            {status.name}
                                                        </SelectItem>
                                                    ))
                                                )
                                                }

                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <Button
                                    type="button"
                                    // size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setAddStatusModalOpen(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Add Status
                                </Button>
                            </div>
                            {errors.taskStatus && (
                                <p className="text-sm text-red-500">{errors.taskStatus.message}</p>
                            )}

                        </div>
                    </div>

                    {/* Store Password + Access */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col w-full relative">
                            <Label className="mb-2">Store Password</Label>
                            <div className="relative w-full">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    {...register("storePassword")}
                                    placeholder="Enter store password"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <Label className="mb-2">Store Access</Label>
                            <Controller
                                control={control}
                                name="storeAccess"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Access Type" />
                                        </SelectTrigger>
                                        <SelectContent className="w-full">
                                            <SelectItem value="given">Given</SelectItem>
                                            <SelectItem value="notNecessary">Not Necessary</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    {/* Email + Task Added Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Emails</Label>
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 mt-2">
                                    <Input
                                        {...register(`emails.${index}`)}
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
                            <Label className="mb-2">Task Added Date</Label>
                            <Controller
                                control={control}
                                name="taskAddedDate"
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

                    {/* Solved By + Reply */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Solved By</Label>
                            <Controller
                                control={control}
                                name="solvedBy"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select User" />
                                        </SelectTrigger>
                                        <SelectContent className="w-full">
                                            {users.map((user: any) => (
                                                <SelectItem key={user.id} value={String(user.id)}>
                                                    {user.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.solvedBy && (
                                <p className="text-sm text-red-500">{errors.solvedBy.message}</p>
                            )}
                        </div>
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
                                        <SelectContent className="w-full">
                                            {projects.map((project: any) => (
                                                <SelectItem key={project.id} value={String(project.id)}>
                                                    {project.projectName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.projectId && (
                                <p className="text-sm text-red-500">{errors.projectId.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label className="mb-2">Notes</Label>
                        <Textarea {...register("notes")} placeholder="Enter notes details..." />
                    </div>

                    {/* Comments */}
                    <div>
                        <Label className="mb-2">Comments</Label>
                        <CommentInput
                            value={watch("comments")}
                            onChange={(value: any, mentions: any) => {
                                setValue("comments", value);
                                setValue("mentions", mentions);
                            }}
                            onSubmit={async () => { }}
                            users={users}
                            sendButtonShow={false}
                        />
                    </div>

                    {/* Footer */}
                    <DialogFooter className="!justify-center flex w-full">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                onOpenChange(false);
                                reset();
                            }}
                        >
                            <X /> Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => reset()}
                        >
                            <ListRestart />
                            Reset
                        </Button>
                        <Button type="submit">
                            <Plus className="h-4 w-4" /> Add Task
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            {addStatusModalOpen && (
                <Suspense fallback={<CenterSpinner />}>
                    <AddStatusModal setStatuses={setStatuses} open={addStatusModalOpen} onOpenChange={setAddStatusModalOpen} />
                </Suspense>
            )}
        </Dialog>

    );
}
