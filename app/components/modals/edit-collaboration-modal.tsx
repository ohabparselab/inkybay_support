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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AddCollaborationSchema, type AddCollaborationInput } from "~/lib/validations";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ListRestart, Plus, Save, X } from "lucide-react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { DatePickerWithClear } from "@/components/ui/date-picker";
import { CenterSpinner } from "@/components/ui/center-spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, Suspense } from "react";
import { Calendar } from "@/components/ui/calendar";
import { AddOptionModal } from "./add-option-modal";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { format } from "date-fns";

interface EditCollaborationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    refreshPage?: () => void;
    collaborationId: number | null;
}

export function EditCollaborationModal({
    open,
    onOpenChange,
    refreshPage,
    collaborationId,
}: EditCollaborationModalProps) {

    const [areaOptions, setAreaOptions] = useState<any[]>([]);
    const [statusOptions, setStatusOptions] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [addStatusModalOpen, setAddStatusModalOpen] = useState(false);
    const [addColAreaModalOpen, setAddColAreaModalOpen] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<AddCollaborationInput>({
        resolver: zodResolver(AddCollaborationSchema),
        defaultValues: {
            emails: [],
            collaborationAreas: [],
        },
    });

    const { fields, append, remove } = useFieldArray<any>({
        control,
        name: "emails",
    });

    // Fetch options (areas, statuses, users, projects)
    useEffect(() => {
        if (!open) return;
        fetch("/api/collaboration-areas")
            .then((res) => res.json())
            .then((data) => setAreaOptions(data.areas || []));
        fetch("/api/collaboration-statuses")
            .then((res) => res.json())
            .then((data) => setStatusOptions(data.statuses || []));
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => setUsers(data.users || []));
        fetch("/api/settings/projects")
            .then((res) => res.json())
            .then((data) => setProjects(data.projects || []));
    }, [open]);

    // Fetch existing data to edit
    useEffect(() => {
        if (!collaborationId || !open) return;
        setLoading(true);
        fetch(`/api/collaborations/${collaborationId}`)
            .then((res) => res.json())
            .then((data) => {
                const c = data.collaboration;
                reset({
                    appName: c.appName,
                    appUrl: c.appUrl || "",
                    companyName: c.companyName || "",
                    companyUrl: c.companyUrl || "",
                    appDetails: c.appDetails || "",
                    emails: c.emails?.map((e: any) => e.email) || [],
                    projectId: c.projectId ? String(c.projectId) : undefined,
                    appAddedDate: c.appAddedDate ? new Date(c.appAddedDate) : undefined,
                    completedDate: c.completedDate ? new Date(c.completedDate) : undefined,
                    collaborationAreas:
                        c.collaborationAreas?.map((a: any) => a.areaOptionId) || [],
                    statusId: c.statusId ? String(c.statusId) : undefined,
                    sendById: c.sendById ? String(c.sendById) : undefined,
                    comments: c.comments || "",
                    meetingDetails: c.meetingDetails || "",
                    requestType: c.requestType || undefined,
                });
            })
            .catch(() => toast.error("Failed to fetch collaboration data"))
            .finally(() => setLoading(false));
    }, [collaborationId, open, reset]);

    // Submit Update
    const onSubmit = async (data: AddCollaborationInput) => {
        if (!collaborationId) return;
        const res = await fetch(`/api/collaborations/${collaborationId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });

        if (res.ok) {
            toast.success("Collaboration updated successfully.");
            onOpenChange(false);
            if (refreshPage) refreshPage();
        } else {
            toast.error("Failed to update collaboration.");
        }
    };

    if (loading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <CenterSpinner />
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Edit Collaboration</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* App Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">App Name</Label>
                            <Input {...register("appName")} placeholder="e.g. Cool App" />
                            {errors?.appName && (
                                <p className="text-red-500 text-sm">{errors.appName.message}</p>
                            )}
                        </div>
                        <div>
                            <Label className="mb-2">App URL</Label>
                            <Input {...register("appUrl")} placeholder="https://..." />
                        </div>
                    </div>


                    {/* URLs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Company Name</Label>
                            <Input {...register("companyName")} placeholder="Enter company name" />
                        </div>
                        <div>
                            <Label className="mb-2">Company URL</Label>
                            <Input {...register("companyUrl")} placeholder="https://..." />
                        </div>
                    </div>
                    {/* Details */}
                    <div>
                        <Label className="mb-2">App Details</Label>
                        <Textarea {...register("appDetails")} placeholder="Enter app details..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Project</Label>
                            <Controller
                                control={control}
                                name="projectId"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={"Select Project"} />
                                        </SelectTrigger>
                                        <SelectContent className="w-full">
                                            {projects.length === 0 ? (
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
                            <Label>Emails</Label>
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 mt-2">
                                    <Input
                                        {...register(`emails.${index}`)}
                                        placeholder="email@example.com"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => remove(index)}
                                    >
                                        X
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                className="mt-2"
                                variant="outline"
                                onClick={() => append("")}
                            >
                                + Add Email
                            </Button>
                            {errors?.emails && (
                                <p className="text-red-500 text-xs">{errors.emails.message as string}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Collaboration Areas */}
                        <div>
                            <Label className="mb-2">Collaboration Areas</Label>
                            <div className="grid grid-cols-2 m-4 gap-2">
                                {areaOptions.length === 0 && (
                                    <div className="p-2 text-center text-sm text-muted-foreground">
                                        No Collaboration Areas Found
                                    </div>
                                )}

                                {areaOptions.map((area) => (
                                    <div key={area.id} className="flex items-start space-x-2">
                                        <Controller
                                            name="collaborationAreas"
                                            control={control}
                                            render={({ field: { value = [], onChange } }) => {
                                                const isChecked = value.includes(area.id);
                                                return (
                                                    <>
                                                        <Checkbox
                                                            checked={isChecked}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    onChange([...value, area.id]);
                                                                } else {
                                                                    onChange(value.filter((id: number) => id !== area.id));
                                                                }
                                                            }}
                                                        />
                                                        <Label>{area.name}</Label>
                                                    </>
                                                );
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setAddColAreaModalOpen(true);
                                }}
                            >
                                <Plus className="h-4 w-4 mr-1" /> Add Area
                            </Button>
                        </div>

                        {/* Status Drop-down */}
                        <div>
                            <Label className="mb-2">Status</Label>
                            <div className="flex items-center justify-between gap-2">
                                <Controller
                                    control={control}
                                    name="statusId"
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={"Select status"} />
                                            </SelectTrigger>
                                            <SelectContent className="w-full">
                                                {statusOptions.length === 0 ? (
                                                    <div className="p-2 text-center text-sm text-muted-foreground">No status found</div>
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
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setAddStatusModalOpen(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Add Status
                                </Button>
                            </div>
                            {errors.statusId && (
                                <p className="text-sm text-red-500">{errors.statusId.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">App Added Date</Label>
                            <Controller
                                control={control}
                                name="appAddedDate"
                                render={({ field }) => (
                                    <DatePickerWithClear
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Pick a date"
                                    />
                                )}
                            />
                            {errors.appAddedDate && (
                                <p className="text-sm text-red-500">{errors.appAddedDate.message}</p>
                            )}
                        </div>
                        <div>
                            <Label className="mb-2">Complete Date</Label>
                            <Controller
                                control={control}
                                name="completedDate"
                                render={({ field }) => (
                                    <DatePickerWithClear
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Pick a date"
                                    />
                                )}
                            />
                            {errors.completedDate && (
                                <p className="text-sm text-red-500">{errors.completedDate.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Request Type */}
                        <div>
                            <Label className="mb-2">Request Type</Label>
                            <Controller
                                control={control}
                                name="requestType"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={"Select request type"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Sent">Sent</SelectItem>
                                            <SelectItem value="Received">Received</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div>
                            <Label className="mb-2">Send By</Label>
                            <Controller
                                control={control}
                                name="sendById"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={"Select sent by"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.length === 0 ? (
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
                            {errors.sendById && (
                                <p className="text-sm text-red-500">{errors.sendById.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Comments */}
                    <div>
                        <Label className="mb-2">Comments</Label>
                        <Textarea {...register("comments")} placeholder="Enter comments details..." />
                    </div>

                    {/* Meeting */}
                    <div>
                        <Label className="mb-2">Meeting Details</Label>
                        <Textarea {...register("meetingDetails")} placeholder="Enter comments details..." />
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

            {/* Nested Add Option Modals */}
            {addColAreaModalOpen && (
                <Suspense fallback={<CenterSpinner />}>
                    <AddOptionModal
                        open={addColAreaModalOpen}
                        onOpenChange={setAddColAreaModalOpen}
                        setItems={setAreaOptions}
                        endpoint="/api/collaboration-areas"
                        title="Add New Area"
                        label="Area Name"
                        successMessage="Collaboration area added successfully."
                    />
                </Suspense>
            )}

            {addStatusModalOpen && (
                <Suspense fallback={<CenterSpinner />}>
                    <AddOptionModal
                        open={addStatusModalOpen}
                        onOpenChange={setAddStatusModalOpen}
                        setItems={setStatusOptions}
                        endpoint="/api/collaboration-statuses"
                        title="Add New Status"
                        label="Status Name"
                        successMessage="Collaboration status added successfully."
                    />
                </Suspense>
            )}
        </Dialog>
    );
}
