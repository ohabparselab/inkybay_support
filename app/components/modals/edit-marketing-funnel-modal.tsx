import { useForm, Controller, useFieldArray } from "react-hook-form";
import { CalendarIcon, X, ListRestart, Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { addMarketingFunnelSchema, type AddMarketingFunnelInput } from "~/lib/validations";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditMarketingFunnelModalProps {
    funnel: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    refreshPage?: () => void;
}

export function EditMarketingFunnelModal({ funnel, open, onOpenChange, refreshPage }: EditMarketingFunnelModalProps) {

    const [formSubmitLoading, setFormSubmitLoading] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<AddMarketingFunnelInput>({
        resolver: zodResolver(addMarketingFunnelSchema),
        defaultValues: {
            installPhase: funnel.installPhase,
            typeOfProducts: funnel.typeOfProducts,
            otherAppsInstalled: funnel.otherAppsInstalled,
            customizationType: funnel.customizationType,
            initialFeedback: funnel.initialFeedback,
            clientSuccessStatus: funnel.clientSuccessStatus,
            emails: funnel.client?.clientEmail?.map((e: any) => e.email) || [],
            followUps: funnel.followUps?.map((f: any) => new Date(f.followUpDate)) || [],
        },
    });

    const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray<any>({
        control,
        name: "emails",
    });

    const { fields: followUpFields, append: appendFollowUp, remove: removeFollowUp } = useFieldArray<any>({
        control,
        name: "followUps",
    });

    const installPhase = watch("installPhase");

    useEffect(() => {
        reset({
            installPhase: funnel.installPhase,
            typeOfProducts: funnel.typeOfProducts,
            otherAppsInstalled: funnel.otherAppsInstalled,
            customizationType: funnel.customizationType,
            initialFeedback: funnel.initialFeedback,
            clientSuccessStatus: funnel.clientSuccessStatus,
            emails: funnel.client?.clientEmail?.map((e: any) => e.email) || [],
            followUps: funnel.followUps?.map((f: any) => new Date(f.followUpDate)) || [],
        });
    }, [funnel, reset]);

    const onSubmit = async (data: AddMarketingFunnelInput) => {
        try {
            setFormSubmitLoading(true);
            const res = await fetch(`/api/marketing-funnels/${funnel.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (res.ok) {
                toast.success("Marketing Funnel updated successfully.");
                onOpenChange(false);
                if(refreshPage) refreshPage();
            } else {
                toast.error(result.message || "Failed to update marketing funnel.");
            }
        } catch (error) {
            toast.error("Something went wrong.");
        } finally {
            setFormSubmitLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Edit Marketing Funnel</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-3">
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                        {/* Install Phase */}
                        <div>
                            <Label className="mb-2">Install Phase</Label>
                            <Controller
                                control={control}
                                name="installPhase"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Phase" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="install">Install</SelectItem>
                                            <SelectItem value="uninstall">Uninstall</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.installPhase && (
                                <p className="text-sm text-red-500">{errors.installPhase.message}</p>
                            )}
                        </div>

                        {/* Emails */}
                        <div>
                            <Label>Client Emails</Label>
                            {emailFields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 mt-2">
                                    <Input {...register(`emails.${index}`)} placeholder="user@example.com" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => removeEmail(index)}
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
                                onClick={() => appendEmail("")}
                            >
                                <Plus /> Add Email
                            </Button>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Type of Products</Label>
                            <Input {...register("typeOfProducts")} placeholder="Enter product type" />
                        </div>
                        <div>
                            <Label className="mb-2">Other Apps Installed</Label>
                            <Input {...register("otherAppsInstalled")} placeholder="Enter apps" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Customization Type</Label>
                            <Input {...register("customizationType")} placeholder="Enter customization type" />
                        </div>
                        <div>
                            <Label className="mb-2">Initial Feedback</Label>
                            <Textarea {...register("initialFeedback")} placeholder="Enter feedback" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Client Success Status</Label>
                            <Controller
                                control={control}
                                name="clientSuccessStatus"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div>
                            <Label className="mb-2">
                                Follow-ups after {installPhase === "install" ? "installation" : "uninstallation"}
                            </Label>
                            {followUpFields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 mt-2 items-center">
                                    <Controller
                                        control={control}
                                        name={`followUps.${index}`}
                                        render={({ field }) => (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="justify-start">
                                                        {field.value ? format(field.value, "PPP") : "Pick date"}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => removeFollowUp(index)}
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
                                onClick={() => appendFollowUp(new Date())}
                            >
                                <Plus /> Add Follow-up
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className="flex !justify-center gap-3 mt-6">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                onOpenChange(false);
                                reset();
                            }}
                        >
                            <X /> Cancel
                        </Button>
                        <Button variant="outline" onClick={() => reset()}>
                            <ListRestart /> Reset
                        </Button>
                        <Button type="submit">
                            {formSubmitLoading ? <Spinner /> : <Plus />} Update Funnel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
