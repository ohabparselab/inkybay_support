import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { addTaskSchema, type AddTaskFormInput } from "~/lib/validations";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { CalendarIcon, ListRestart, Save, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { lazy, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { CenterSpinner } from "../ui/center-spinner";

const AddStatusModal = lazy(() =>
    import('~/components/modals/add-status-modal').then(module => ({ default: module.AddStatusModal }))
);

interface EditTaskModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    refreshPage?: () => void;
    task?: any;
}

export function EditTaskModal({ open, onOpenChange, task, refreshPage }: EditTaskModalProps) {

    const [users, setUsers] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<{ id: number, name: string }[]>([]);
    const [addStatusModalOpen, setAddStatusModalOpen] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const { control, register, handleSubmit, formState: { errors }, reset } = useForm<AddTaskFormInput>({
        resolver: zodResolver(addTaskSchema),
    });

    const { fields, append, remove } = useFieldArray<any>({
        control,
        name: "emails",
    });

    const fetchStatuses = async () => {
        const res = await fetch("/api/statuses");
        const data = await res.json();
        setStatuses(data.statuses);
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
    };

    const onSubmit = async (data: AddTaskFormInput) => {
        if (!task?.id) return;
        const res = await fetch(`/api/tasks/${task.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        console.log(res.ok)

        if (res.ok) {
            toast.success("Task updated successfully!");
            onOpenChange(false);
            if (refreshPage) refreshPage();
        } else {
            toast.error("Failed to update task.");
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchStatuses();
    }, []);

    useEffect(() => {
        if (task && open) {
            reset({
                taskDetails: task.taskDetails || "",
                providedBy: String(task.providedBy || ""),
                taskStatus: String(task.statusId || ""),
                taskAddedDate: task.taskAddedDate ? new Date(task.taskAddedDate) : undefined,
                storePassword: task.storePassword || "",
                storeAccess: task.storeAccess || "",
                emails: task.client.clientEmail?.map((e: any) => e.email) || [],
                solvedBy: String(task.solvedBy || ""),
                reply: task.reply || "",
                comments: task.comments || "",
            });
        }
    }, [task, open, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-3">

                    {/* Task Details */}
                    <div>
                        <Label className="mb-2">Task Details</Label>
                        <Textarea
                            {...register("taskDetails")}
                            placeholder="Enter task details..."
                            className="min-h-[80px]"
                        />
                        {errors.taskDetails && (
                            <p className="text-sm text-red-500">{errors.taskDetails.message}</p>
                        )}
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
                                        <SelectContent>
                                            {users.map((user: any) => (
                                                <SelectItem key={user.id} value={String(user.id)}>
                                                    {user.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
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
                                            <SelectContent>
                                                {statuses.length === 0 ? (
                                                    <div className="p-2 text-center text-sm text-muted-foreground">No status found</div>
                                                ) : (
                                                    statuses.map((status) => (
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
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setAddStatusModalOpen(true)}
                                >
                                    Add Status
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Store Password + Access */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Store Password</Label>
                            <Input type="password" {...register("storePassword")} />
                        </div>
                        <div>
                            <Label className="mb-2">Store Access</Label>
                            <Controller
                                control={control}
                                name="storeAccess"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Access" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="given">Given</SelectItem>
                                            <SelectItem value="notNecessary">Not Necessary</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    {/* Emails + Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Client Emails</Label>
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 mt-2">
                                    <Input {...register(`emails.${index}`)} placeholder="user@example.com" />
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
                            <Button type="button" variant="secondary" size="sm" onClick={() => append("")}>
                                + Add Email
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
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
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
                                        <SelectContent>
                                            {users.map((user: any) => (
                                                <SelectItem key={user.id} value={String(user.id)}>
                                                    {user.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div>
                            <Label className="mb-2">Reply</Label>
                            <Textarea {...register("reply")} placeholder="Enter reply..." />
                        </div>
                    </div>

                    {/* Comments */}
                    <div>
                        <Label className="mb-2">Comments</Label>
                        <Textarea {...register("comments")} placeholder="Enter comments..." />
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
                        <Button type="submit">
                            <Save className="h-4 w-4" /> Save Changes
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
