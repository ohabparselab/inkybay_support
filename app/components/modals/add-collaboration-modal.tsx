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

import { useState, useEffect, Suspense } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, ListRestart, Plus, X } from "lucide-react";
import { Spinner } from "../ui/spinner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { CenterSpinner } from "../ui/center-spinner";
import { AddOptionModal } from "./add-option-modal";

// Validation Schema
const CollaborationSchema = z.object({
    appName: z.string().min(2, "Required"),
    appUrl: z.string().optional(),
    companyName: z.string().optional(),
    companyUrl: z.string().optional(),
    appDetails: z.string().optional(),
    emails: z
        .array(z.string().email("Invalid Email"))
        .optional(),
    projectId: z.string().optional(),
    appAddedDate: z.date().optional(),
    completedDate: z.date().optional(),
    collaborationAreas: z.array(z.number()).optional(),
    statusId: z.string().optional(),
    sendById: z.string().optional(),
    comments: z.string().optional(),
    meetingDetails: z.string().optional(),
    requestType: z.string().optional(),
});

type FormValues = z.infer<typeof CollaborationSchema>;

interface collaborationModalProps {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    refreshPage?: () => void
}

export function AddCollaborationModal({
    open,
    onOpenChange,
    refreshPage
}: collaborationModalProps) {

    const [areaOptions, setAreaOptions] = useState<any[]>([]);
    const [statusOptions, setStatusOptions] = useState<any[]>([]);
    const [users, setUsers] = useState<any>([]);
    const [projects, setProjects] = useState<any>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [addStatusModalOpen, setAddStatusModalOpen] = useState(false);
    const [addColAreaModalOpen, setAddColAreaModalOpen] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(CollaborationSchema),
        defaultValues: {
            emails: [""],
            collaborationAreas: [],
        },
    });

    const { fields, append, remove } = useFieldArray<any>({
        control,
        name: "emails",
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

    // Fetch Areas & Status Options on open
    useEffect(() => {
        if (!open) return;

        fetch("/api/collaboration-areas")
            .then(res => res.json())
            .then(data => setAreaOptions(data.areas || []));

        fetch("/api/collaboration-statuses")
            .then(res => res.json())
            .then(data => setStatusOptions(data.statuses || []));
        fetchUsers();
        fetchProjects();
    }, [open]);

    const onSubmit = async (data: FormValues) => {
        const res = await fetch("/api/collaborations", {
            method: "POST",
            body: JSON.stringify(data),
        });

        if (res.ok) {
            reset();
            onOpenChange(false);
        } else {
            console.error("Failed to save");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Add Collaboration</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* App Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">App Name</Label>
                            <Input {...register("appName")} placeholder="e.g. Cool App" />
                            {errors?.appName && (
                                <p className="text-red-500 text-xs">{errors.appName.message}</p>
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
                                {
                                    areaOptions.length === 0 && (
                                        <div className="p-2 text-center text-sm text-muted-foreground">No Collaboration Areas Found</div>
                                    )
                                }
                                {areaOptions.map((area) => (
                                    <div key={area.id} className="flex items-start space-x-2">

                                        <Checkbox
                                            value={area.id}
                                            onCheckedChange={(checked) => {
                                                const current = control._formValues.collaborationAreas || [];
                                                if (checked) {
                                                    setValue("collaborationAreas", [...current, area.id]);
                                                } else {
                                                    setValue(
                                                        "collaborationAreas",
                                                        current.filter((id: number) => id !== area.id)
                                                    );
                                                }
                                            }}
                                        />
                                        <Label>{area.name}</Label>
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
                            {errors.completedDate && (
                                <p className="text-sm text-red-500">{errors.completedDate.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Request Type */}
                        <div>
                            <Label className="mb-2">Request Type</Label>
                            <Select onValueChange={(v) => setValue("requestType", v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select request type." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sent">Sent</SelectItem>
                                    <SelectItem value="Received">Received</SelectItem>
                                </SelectContent>
                            </Select>
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
                                        disabled={loadingUsers}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={loadingUsers ? "Loading..." : "Select sent by"} />
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

                    {/* Footer */}
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
                                isSubmitting ? (<Spinner />) : (<Plus className="h-4 w-4" />)
                            }
                            Add Collaboration
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
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
