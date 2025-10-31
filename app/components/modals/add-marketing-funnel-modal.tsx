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
    funnel,
    isAppInstall
}: AddMarketingFunnelModalProps) {

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

    const { fields: followUpFields, append: appendFollowUp, remove: removeFollowUp } =
        useFieldArray<any>({
            control,
            name: "followUps",
        });

    const onSubmit = async (data: AddMarketingFunnelInput) => {
        try {
            console.log("======data======>", data);
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
    console.log("=====error====>>", errors)
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>
                        Add Marketing Funnel (
                        <span className="font-semibold text-foreground">{funnel.client.shopName}</span>,{" "}
                        <a
                            href={`https://${funnel.client.shopDomain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            {funnel.client.shopDomain}
                        </a>
                        )
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
                            {followUpFields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="grid grid-cols-10 gap-3 items-center mb-3 border-b pb-2 last:border-0 last:pb-0"
                                >
                                    {/* Follow Step */}
                                    <div>
                                        <Label className="text-sm">Install Phase</Label>
                                        <Input
                                            {...register(`followUps.${index}.installPhase`)}
                                            value={currentInstallPhase}
                                            readOnly className="bg-muted dark:bg-muted"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm">Follow Step</Label>
                                        <Input
                                            {...register(`followUps.${index}.followUpStep`)}
                                            value={`${index + 1}${['st', 'nd', 'rd'][((index + 1) % 10) - 1] || 'th'}`}
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
                                                        <Button variant="outline" className="justify-start w-full">
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
                                                <Select onValueChange={field.onChange} value={field.value}>
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
                                            {...register(`followUps.${index}.initialFeedback`)}
                                            placeholder="Feedback..."
                                        />
                                    </div>

                                    {/* Other Apps + Delete */}
                                    <div className="col-span-2 flex items-center gap-2">
                                        <div>
                                            <Label className="text-sm">Other App Installed</Label>
                                            <Input
                                                {...register(`followUps.${index}.otherAppsInstalled`)}
                                                placeholder="Other apps.."
                                            />
                                        </div>
                                        <Button
                                            className="mt-5"
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => removeFollowUp(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="mt-2"
                                onClick={() =>
                                    appendFollowUp({
                                        followUpDate: undefined,
                                        clientSuccessStatus: undefined,
                                        initialFeedback: "",
                                        otherAppsInstalled: "",
                                    })
                                }
                            >
                                <Plus /> Add Follow Up
                            </Button>
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
