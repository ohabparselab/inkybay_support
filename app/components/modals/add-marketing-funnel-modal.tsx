import { useForm, Controller, useFieldArray } from "react-hook-form";
import { CalendarIcon, Plus, X, ListRestart, Save } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { addMarketingFunnelSchema, type AddMarketingFunnelInput } from "~/lib/validations";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

interface AddMarketingFunnelModalProps {
    clientId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    refreshPage?: () => void;
    funnel: any;
    isAppInstall: boolean;
}

export function AddMarketingFunnelModal({
    clientId,
    open,
    onOpenChange,
    refreshPage,
    isAppInstall
}: AddMarketingFunnelModalProps) {

    const funnelsFetcher = useFetcher<{ status: number; data: any }>();
    const [funnel, setFunnel] = useState<any | null>(null);
    const [funnels, setFunnels] = useState<any | null>([]);

    const currentInstallPhase = isAppInstall ? "install" : "uninstall";
    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
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

    const { fields: followUpFields, append: appendFollowUp, prepend: prependFollowUp, remove: removeFollowUp } =
        useFieldArray<any>({
            control,
            name: "followUps",
        });

    // 🔹 Fetch funnels by clientId
    useEffect(() => {
        if (clientId) {
            const cf = new FormData();
            cf.set("clientId", String(clientId));
            funnelsFetcher.submit(cf, {
                method: "post",
                action: "/api/marketing-funnels/get-marketing-funnels-by-client-id",
            });
        }
    }, [clientId]);

    // 🔹 Update state when fetcher gets new data
    useEffect(() => {
        if (funnelsFetcher.data?.data) {
            setFunnels(funnelsFetcher.data.data);
        }
    }, [funnelsFetcher.data]);

    const loadingFunnels = funnelsFetcher.state !== "idle";

    const getFollowUpStepLabel = (step: number) => {
        const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
        const remainder = step % 10;
        return `${step}${suffixes[remainder] || "th"}`;
    };

    const updateFollowUpSteps = (updatedFollowUps: any[]) => {
        return updatedFollowUps.map((fu, i) => ({
            ...fu,
            followUpStep: `${i + 1}${['st', 'nd', 'rd'][((i + 1) % 10) - 1] || 'th'}`, // 1st, 2nd, 3rd, etc.
        }));
    };

    useEffect(() => {
        if (funnels.length > 0) {
            const formattedFollowUps = funnels.map((f: any, i: number) => ({
                funnelId: String(f.id) || undefined,
                installPhase: f.installPhase || currentInstallPhase,
                followUpStep: f.followUpStep,
                followUpDate: f.followUpDate ? new Date(f.followUpDate) : undefined,
                clientSuccessStatus: f.clientSuccessStatus || "no",
                initialFeedback: f.initialFeedback || "",
                otherAppsInstalled: f.otherAppsInstalled || "",
                isNew: false
            }));

            reset({
                clientId,
                typeOfProducts: funnels[0].typeOfProducts,
                customizationType: funnels[0].customizationType,
                emails: funnels[0].client?.clientEmail?.map((e: any) => e.email) || [],
                followUps: formattedFollowUps,
            });

            setFunnel({
                client: {
                    shopName: funnels[0]?.client?.shopName,
                    shopDomain: funnels[0]?.client?.shopDomain,
                },
            });
        }
    }, [funnels, reset]);


    const onSubmit = async (data: AddMarketingFunnelInput) => {
        try {
            const res = await fetch("/api/marketing-funnels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, clientId }),
            });

            const result = await res.json();
            if (res.ok) {
                toast.success("Marketing Funnel added successfully.");
                onOpenChange(false);
                reset();
                if (refreshPage) refreshPage();
            } else {
                toast.error(result.message || "Failed to add marketing funnel.");
            }
        } catch (error) {
            toast.error("Something went wrong.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>
                        Add Marketing Funnel
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
                    {/* Install Phase & Emails */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Current Install Phase</Label>
                            <Input value={currentInstallPhase} readOnly className="bg-muted dark:bg-muted" />
                        </div>

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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Type of Products</Label>
                            <Input {...register("typeOfProducts")} placeholder="Enter product type" />
                            {errors.typeOfProducts && <p className="text-sm text-red-500">{errors.typeOfProducts.message}</p>}
                        </div>
                        <div>
                            <Label className="mb-2">Customization Type</Label>
                            <Input {...register("customizationType")} placeholder="Enter customization type" />
                        </div>
                    </div>

                    {/* Follow-ups Table */}
                    <div className="col-span-2">
                        <Label className="mb-2">Follow-ups</Label>

                        <div className="border rounded-md p-3">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="mb-2"
                                onClick={() => {
                                    const phaseCount = followUpFields.filter(
                                        (f: any) => f.installPhase === currentInstallPhase
                                    ).length;

                                    const nextStep = phaseCount + 1;

                                    prependFollowUp({
                                        funnelId: "",
                                        installPhase: currentInstallPhase,
                                        followUpStep: getFollowUpStepLabel(nextStep),
                                        followUpDate: "",
                                        clientSuccessStatus: "",
                                        initialFeedback: "",
                                        otherAppsInstalled: "",
                                        isNew: true,
                                    });
                                }}
                            >
                                <Plus /> Add Follow Up
                            </Button>
                            {
                                loadingFunnels ? (
                                    <div className="flex justify-center py-10">
                                        <Spinner />
                                    </div>
                                ) : (
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
                                                    {f.isNew && (
                                                        <Button
                                                            className="mt-5"
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => {
                                                                removeFollowUp(index)
                                                            }}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                </div>
                                            </div>
                                        ))
                                    )
                                )
                            }
                        </div>
                    </div>

                    {/* Footer */}
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
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner /> : <Save />} Save Funnel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
