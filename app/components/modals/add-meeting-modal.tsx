import { useForm, Controller, useFieldArray } from "react-hook-form";
import { CalendarIcon, Plus, X, ListRestart } from "lucide-react";
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


interface AddMeetingModalProps {
    clientId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddMeetingModal({ clientId, open, onOpenChange }: AddMeetingModalProps) {

    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [formSubmitLoading, setFormSubmitLoading] = useState(false);

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

    useEffect(() => {
        fetchUsers();
    }, []);

    const onSubmit = async (data: AddMeetingInput) => {
        try {
            setFormSubmitLoading(true);
            const formData = new FormData();

            // Append all fields
            Object.entries(data).forEach(([key, value]) => {
                if (value instanceof Date) {
                    formData.append(key, value.toISOString());
                } else if (Array.isArray(value)) {
                    value.forEach((v) => formData.append(`${key}[]`, v));
                } else if (value !== undefined && value !== null) {
                    formData.append(key, value as any);
                }
            });

            const res = await fetch("/api/meetings", {
                method: "POST",
                body: formData,
            });

            const result = await res.json();
            if (res.ok) {
                toast.success("Meeting added successfully.");
                setFormSubmitLoading(false);
                onOpenChange(false);
                reset();
            } else {
                setFormSubmitLoading(false);
                toast.error(result.message || "Failed to add meeting.");
            }
        } catch (err) {
            setFormSubmitLoading(false);
            console.error(err);
            toast.error("Something went wrong while adding meeting.");
        }
    };
    
    console.log("=======>>", formSubmitLoading);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Add New Meeting</DialogTitle>
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
                                    const value = field.value ? new Date(field.value) : undefined;
                                    return (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start">
                                                    {value ? format(value, "PPP p") : "Pick date & time"}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>

                                            <PopoverContent align="start" className="p-4 w-auto">
                                                <Calendar
                                                    mode="single"
                                                    selected={value}
                                                    onSelect={(date) => {
                                                        if (!date) return;
                                                        const current = value ?? new Date();
                                                        // Preserve existing time when changing date
                                                        date.setHours(current.getHours(), current.getMinutes());
                                                        field.onChange(date);
                                                    }}
                                                />

                                                {/* Full hour & minute dropdowns */}
                                                <div className="flex gap-2 mt-4 items-center">
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
                            {errors.meetingDateTime && <p className="text-sm text-red-500">{errors.meetingDateTime.message}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <Label>Review Asked?</Label>
                                <Controller
                                    control={control}
                                    name="reviewAsked"
                                    render={({ field }) => (
                                        <Checkbox
                                            checked={field.value || false}
                                            onCheckedChange={(checked) => field.onChange(checked)}
                                        />
                                    )}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label>Review Given?</Label>
                                <Controller
                                    control={control}
                                    name="reviewGiven"
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
                            <Label className="mb-2">Review Date</Label>
                            <Controller
                                control={control}
                                name="reviewDate"
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

                    {/* Email + Joining Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        <div>
                            <Label>Emails</Label>
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
                            <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => append("")}>
                                <Plus /> Add Email
                            </Button>
                        </div>
                        <div className="flex items-center gap-3 mt-4 sm:mt-0">
                            <Label>Joining Status</Label>
                            <Controller
                                control={control}
                                name="joiningStatus"
                                render={({ field }) => (
                                    <Checkbox
                                        checked={field.value || false}
                                        onCheckedChange={(checked) => field.onChange(checked)}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Recorded Video + Notes */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Recorded Video (Upload)</Label>
                            <Controller
                                control={control}
                                name="recordedVideo"
                                render={({ field }) => (
                                    <Input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => field.onChange(e.target.files?.[0])}
                                    />
                                )}
                            />
                            {/* {errors.recordedVideo && (
                                <p className="text-sm text-red-500">{errors.recordedVideo.message}</p>
                            )} */}
                        </div>
                        <div>
                            <Label className="mb-2">Reviews Info</Label>
                            <Textarea {...register("reviewsInfo")} placeholder="Reviews info..." />
                        </div>
                    </div>
                    <div>
                        <Label className="mb-2">Meeting Notes</Label>
                        <Textarea {...register("meetingNotes")} placeholder="Notes from meeting..." />
                    </div>

                    <DialogFooter className="flex !justify-center w-full mt-6">
                        <Button variant="destructive" onClick={() => { onOpenChange(false); reset(); }}>
                            <X /> Cancel
                        </Button>
                        <Button variant="outline" onClick={() => reset()}>
                            <ListRestart /> Reset
                        </Button>
                        <Button type="submit">
                            {formSubmitLoading ? <Spinner/> : <Plus />} Add Meeting
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
