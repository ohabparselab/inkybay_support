import { useForm, Controller, useFieldArray } from "react-hook-form";
import { CalendarIcon, Save, X, ListRestart } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addMeetingSchema, type AddMeetingInput } from "~/lib/validations";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Spinner } from "../ui/spinner";
import { DatePickerWithClear } from "../ui/date-picker";

interface EditMeetingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    refreshPage?: () => void;
    meeting: any;
}

export function EditMeetingModal({ open, onOpenChange, meeting, refreshPage }: EditMeetingModalProps) {

    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [formSubmitLoading, setFormSubmitLoading] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AddMeetingInput>({
        resolver: zodResolver(addMeetingSchema),
        defaultValues: {
            agentId: "",
            emails: [],
            reviewAsked: false,
            reviewGiven: false,
            joiningStatus: false,
        },
    });

    const { fields, append, remove } = useFieldArray<any>({
        control,
        name: "emails",
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
        fetchUsers();
        fetchProjects();
    }, []);

    useEffect(() => {
        if (meeting) {
            reset({
                agentId: meeting.agentId ? String(meeting.agentId) : "",
                projectId: meeting.projectId ? String(meeting.projectId) : "",
                storeUrl: meeting.storeUrl || "",
                meetingDetails: meeting.meetingDetails || "",
                meetingDateTime: meeting.meetingDateTime ? new Date(meeting.meetingDateTime) : undefined,
                reviewAsked: meeting.review?.reviewAsked || false,
                reviewGiven: meeting.review?.reviewStatus || false,
                reviewDate: meeting.review?.reviewDate ? new Date(meeting.review?.reviewDate) : undefined,
                joiningStatus: meeting.joiningStatus || false,
                recordedVideo: meeting.recordedVideo || undefined,
                reviewsInfo: meeting.review?.reviewText || "",
                meetingNotes: meeting.meetingNotes || "",
                isExternalMeeting: meeting.isExternalMeeting || false,
                emails: meeting.emails?.map((e: any) => e.email) || [],
            });
        }
    }, [meeting, reset]);

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

    const onSubmit = async (data: AddMeetingInput) => {
        if (!meeting?.id) return;
        try {
            setFormSubmitLoading(true);
            const formData = new FormData();

            Object.entries(data).forEach(([key, value]) => {
                if (value instanceof Date) {
                    formData.append(key, value.toISOString());
                } else if (Array.isArray(value)) {
                    value.forEach((v) => formData.append(`${key}[]`, v));
                } else if (value !== undefined && value !== null) {
                    formData.append(key, value as any);
                }
            });

            const res = await fetch(`/api/meetings/${meeting.id}`, {
                method: "PUT",
                body: formData,
            });

            const result = await res.json();
            if (res.ok) {
                toast.success("Meeting updated successfully.");
                setFormSubmitLoading(false);
                onOpenChange(false);
                if (refreshPage) refreshPage();
            } else {
                setFormSubmitLoading(false);
                toast.error(result.message || "Failed to update meeting.");
            }
        } catch (err) {
            console.error(err);
            setFormSubmitLoading(false);
            toast.error("Something went wrong while updating meeting.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Edit Meeting
                        {
                            meeting.storeUrl && (
                                <>
                                    (
                                    <a
                                        href={`https://${meeting.storeUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {meeting.storeUrl}
                                    </a>
                                    )
                                </>
                            )
                        }
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-3">
                    {/* Store URL Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Store URL</Label>
                            <Input {...register("storeUrl")} placeholder="https://store.myshopify.com" />
                            {errors.storeUrl && <p className="text-sm text-red-500">{errors.storeUrl.message}</p>}
                        </div>
                        <div className="flex items-center gap-2 pt-5">
                            <Label>External Meeting?</Label>
                            <Controller
                                control={control}
                                name="isExternalMeeting"
                                render={({ field }) => (
                                    <Checkbox
                                        checked={field.value || false}
                                        onCheckedChange={(checked) => field.onChange(checked)}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Meeting Details */}
                    <div>
                        <Label className="mb-2">Meeting Details</Label>
                        <Textarea className="h-[10vh]" {...register("meetingDetails")} placeholder="Describe the meeting..." />
                        {errors.meetingDetails && <p className="text-sm text-red-500">{errors.meetingDetails.message}</p>}
                    </div>

                    {/* Agent + Meeting Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        <div>
                            <Label className="mb-2">Agent (Handled By)</Label>
                            <Controller
                                control={control}
                                name="agentId"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Agent" />
                                        </SelectTrigger>
                                        <SelectContent className="w-full">
                                            {loadingUsers ? (
                                                <div className="p-2 text-center text-muted-foreground">Loading...</div>
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
                            {errors.agentId && <p className="text-sm text-red-500">{errors.agentId.message}</p>}
                        </div>
                        <div>
                            <Label className="mb-2">Meeting Date & Time</Label>

                            <Controller
                                control={control}
                                name="meetingDateTime"
                                render={({ field }) => {
                                    let value = field.value ? new Date(field.value) : undefined;
                                    const [open, setOpen] = useState(false);

                                    return (
                                        <Popover open={open} onOpenChange={setOpen}>
                                            <PopoverTrigger asChild>
                                                <div className="relative w-full">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="w-full justify-between text-left"
                                                    >
                                                        {value ? format(value, "PPP p") : "Pick date & time"}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>

                                                    {/* CLEAR BUTTON (X) */}
                                                    {value && (
                                                        <X
                                                            className="absolute hover:bg-accent rounded-2xl right-9 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer opacity-70 hover:opacity-100"
                                                            onClick={(e) => {
                                                                field.onChange(null);
                                                                e.stopPropagation();
                                                                setOpen(false);
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </PopoverTrigger>

                                            <PopoverContent align="start" className="p-4 w-auto">
                                                {/* CALENDAR SECTION */}
                                                <Calendar
                                                    mode="single"
                                                    selected={value}
                                                    onSelect={(date) => {
                                                        if (!date) return;

                                                        const current = value ?? new Date();
                                                        date.setHours(current.getHours(), current.getMinutes());

                                                        field.onChange(date);
                                                    }}
                                                    initialFocus
                                                />

                                                {/* TIME PICKER */}
                                                <div className="flex gap-2 mt-4 items-center">
                                                    {/* HOURS */}
                                                    <select
                                                        className="border rounded px-2 py-1 text-sm"
                                                        value={value ? value.getHours() : ""}
                                                        onChange={(e) => {
                                                            const hours = parseInt(e.target.value, 10);
                                                            const updated = value ? new Date(value) : new Date();
                                                            updated.setHours(hours);
                                                            field.onChange(updated);
                                                        }}
                                                    >
                                                        <option value="">HH</option>
                                                        {[...Array(24)].map((_, i) => (
                                                            <option key={i} value={i}>
                                                                {i.toString().padStart(2, "0")}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <span className="text-gray-500">:</span>

                                                    {/* MINUTES */}
                                                    <select
                                                        className="border rounded px-2 py-1 text-sm"
                                                        value={value ? value.getMinutes() : ""}
                                                        onChange={(e) => {
                                                            const minutes = parseInt(e.target.value, 10);
                                                            const updated = value ? new Date(value) : new Date();
                                                            updated.setMinutes(minutes);
                                                            field.onChange(updated);
                                                        }}
                                                    >
                                                        <option value="">MM</option>
                                                        {[...Array(60)].map((_, i) => (
                                                            <option key={i} value={i}>
                                                                {i.toString().padStart(2, "0")}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    );
                                }}
                            />

                            {errors.meetingDateTime && (
                                <p className="text-sm text-red-500">
                                    {errors.meetingDateTime.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Review flags + Review Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <Label>Review Asked?</Label>
                                <Controller
                                    control={control}
                                    name="reviewAsked"
                                    render={({ field }) => (
                                        <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                                    )}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label>Review Given?</Label>
                                <Controller
                                    control={control}
                                    name="reviewGiven"
                                    render={({ field }) => (
                                        <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                                    )}
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="mb-2">Review Date</Label>
                            <Controller
                                control={control}
                                name="reviewDate"
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

                    {/* Emails + Joining Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        <div>
                            <Label>Emails</Label>
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 mt-2">
                                    <Input {...register(`emails.${index}`)} placeholder="user@example.com" />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => append("")}>
                                <Save /> Add Email
                            </Button>
                        </div>
                        <div className="flex items-center gap-3 mt-4 sm:mt-0">
                            <Label>Joining Status</Label>
                            <Controller
                                control={control}
                                name="joiningStatus"
                                render={({ field }) => (
                                    <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                                )}
                            />
                        </div>
                    </div>

                    {/* Recorded Video + Notes */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Recorded Video</Label>
                            <Input {...register("recordedVideo")} placeholder="Enter video link..." />
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

                    <div>
                        <Label className="mb-2">Reviews Info</Label>
                        <Textarea {...register("reviewsInfo")} placeholder="Reviews info..." />
                    </div>

                    <div>
                        <Label className="mb-2">Meeting Notes</Label>
                        <Textarea {...register("meetingNotes")} placeholder="Notes from meeting..." />
                    </div>

                    <DialogFooter className="flex !justify-center w-full mt-6">
                        <Button variant="destructive" onClick={() => { onOpenChange(false); reset(); }}>
                            <X /> Cancel
                        </Button>
                        <Button variant="outline" onClick={() => reset(meeting)}>
                            <ListRestart /> Reset
                        </Button>
                        <Button type="submit">
                            {formSubmitLoading ? <Spinner /> : <Save />} Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
