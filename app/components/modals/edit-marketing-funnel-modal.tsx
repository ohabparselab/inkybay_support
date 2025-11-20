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
    const [projects, setProjects] = useState<any>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);

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
            emails: [],
            followUps: [],
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
        fetchProjects();
    }, []);

    useEffect(() => {

        reset({
            followUps: funnel.followUpStep == null ? [] : [{
                installPhase: funnel.installPhase,
                followUpStep: funnel.followUpStep,
                followUpDate: funnel.followUpDate ? new Date(funnel.followUpDate) : undefined,
                clientSuccessStatus: funnel.clientSuccessStatus || "no",
                initialFeedback: funnel.initialFeedback || "",
                otherAppsInstalled: funnel.otherAppsInstalled || "",
                isNew: true
            }],
            typeOfProducts: funnel.typeOfProducts,
            customizationType: funnel.customizationType,
            emails: funnel.client?.clientEmail?.map((e: any) => e.email) || [],
            clientId: funnel.clientId,
            projectId: String(funnel.projectId) || "",
            installPhase: funnel.installPhase,

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
                if (refreshPage) refreshPage();
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
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>
                        Edit Marketing Funnel
                        {
                            funnel?.client?.shopName && (
                                <>
                                    (
                                    <span className="font-semibold text-foreground">{funnel?.client?.shopName}</span>,{" "}
                                    <a
                                        href={`https://${funnel?.client?.shopDomain}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {funnel?.client?.shopDomain}
                                    </a>
                                    )
                                </>
                            )
                        }
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-3">
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
                        {/* Install Phase */}
                        <div>
                            <Label className="mb-2">Install Phase</Label>
                            <Input value={funnel.installPhase} readOnly className="bg-muted dark:bg-muted" />
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

                    {/* Product Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Type of Products</Label>
                            <Input {...register("typeOfProducts")} placeholder="Enter product type" />
                        </div>
                        <div>
                            <Label className="mb-2">Customization Type</Label>
                            <Input {...register("customizationType")} placeholder="Enter customization type" />
                        </div>
                    </div>
                    <div>
                        <Label className="mb-2">Follow-ups</Label>

                        <div className="border rounded-md p-3">
                            {

                                followUpFields.length === 0 ? (
                                    <div className="flex justify-center items-center bordered py-10">
                                        No funnels found
                                    </div>
                                ) : (
                                    followUpFields.map((f: any, index) => (
                                        <div
                                            key={f.id}
                                            // className="grid grid-cols-10 gap-3 items-center mb-3 border-b pb-2 last:border-0 last:pb-0"
                                            className={`grid grid-cols-10 gap-3 items-center mb-3 border rounded-md p-3 
                                                    ${!f.isNew ? "bg-muted/60 pointer-events-none opacity-70" : ""}`}
                                        >
                                            {/* Follow Step */}
                                            <div>
                                                <Input
                                                    {...register(`followUps.${index}.funnelId`)}
                                                    className="bg-muted dark:bg-muted hidden"
                                                />
                                                <Label className="text-sm">Install Phase</Label>
                                                <Input
                                                    {...register(`followUps.${index}.installPhase`)}
                                                    readOnly className="bg-muted dark:bg-muted"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm">Follow Step</Label>
                                                <Input
                                                    {...register(`followUps.${index}.followUpStep`)}
                                                    readOnly
                                                    className="bg-muted dark:bg-muted"
                                                />
                                            </div>

                                            {/* Follow-up Date */}
                                            <div className="col-span-2">
                                                <Label className="text-sm">Follow-up Date</Label>
                                                <Controller
                                                    control={control}
                                                    name={`followUps.${index}.followUpDate`}
                                                    render={({ field }) => (
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button disabled={!f.isNew} variant="outline" className="justify-start w-full">
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
                                                {errors.followUps?.[index]?.followUpDate && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.followUps[index]?.followUpDate?.message as string}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Client Success */}
                                            <div className="col-span-2">
                                                <Label className="text-sm">Client Success</Label>
                                                <Controller
                                                    control={control}
                                                    name={`followUps.${index}.clientSuccessStatus`}
                                                    render={({ field }) => (
                                                        <Select disabled={!f.isNew} onValueChange={field.onChange} value={field.value || ""}>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="yes">Yes</SelectItem>
                                                                <SelectItem value="no">No</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.followUps?.[index]?.clientSuccessStatus && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.followUps[index]?.clientSuccessStatus?.message as string}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Feedback */}
                                            <div className="col-span-2">
                                                <Label className="text-sm">Initial Feedback</Label>
                                                <Input
                                                    disabled={!f.isNew}
                                                    {...register(`followUps.${index}.initialFeedback`)}
                                                    placeholder="Feedback..."
                                                />
                                            </div>

                                            {/* Other Apps + Delete */}
                                            <div className="col-span-2 flex items-center gap-2">
                                                <div>
                                                    <Label className="text-sm">Other App Installed</Label>
                                                    <Input
                                                        disabled={!f.isNew}
                                                        {...register(`followUps.${index}.otherAppsInstalled`)}
                                                        placeholder="Other apps.."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )
                            }
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
