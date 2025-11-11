"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useState } from "react";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "~/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";

interface GenerateReportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GenerateReportModal({ open, onOpenChange }: GenerateReportModalProps) {
    const [installPhase, setInstallPhase] = useState("");
    const [followUpStatus, setFollowUpStatus] = useState("");
    const [clientSuccess, setClientSuccess] = useState("no");
    const [followUpDateStart, setFollowUpDateStart] = useState<Date | undefined>();
    const [followUpDateEnd, setFollowUpDateEnd] = useState<Date | undefined>();

    const generateFollowUpOptions = (count = 10) => {
        const suffix = (n: number) => {
            if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
            if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
            if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
            return `${n}th`;
        };
        return Array.from({ length: count }, (_, i) => suffix(i + 1));
    };

    const handleGetReports = () => {
        const params = new URLSearchParams();
        if (installPhase) params.set("installPhase", installPhase);
        if (followUpStatus) params.set("followUpStatus", followUpStatus);
        if (clientSuccess) params.set("clientSuccessStatus", clientSuccess);
        if (followUpDateStart) params.set("followUpDateStart", followUpDateStart.toISOString());
        if (followUpDateEnd) params.set("followUpDateEnd", followUpDateEnd.toISOString());

        const reportUrl = `/reports/marketing-funnel?${params.toString()}`;
        window.open(reportUrl, "_blank");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Generate Report</DialogTitle>
                </DialogHeader>

                <div className="space-y-8 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2">Install Phase</Label>
                            <Select value={installPhase} onValueChange={setInstallPhase}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Install Phase" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="install">Install</SelectItem>
                                    <SelectItem value="uninstall">Uninstall</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="mb-2">Follow-up Status</Label>
                            <Select value={followUpStatus} onValueChange={setFollowUpStatus}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Follow-up Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {generateFollowUpOptions(10).map((status) => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label className="mb-2">Client Success</Label>
                        <Select value={clientSuccess} onValueChange={setClientSuccess}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Follow-up Date</Label>
                        <div className="flex items-center gap-2">
                            {/* FROM */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "flex-1 justify-start text-left font-normal",
                                            !followUpDateStart && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {followUpDateStart ? format(followUpDateStart, "LLL dd, y") : "From"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="p-0">
                                    <Calendar
                                        mode="single"
                                        selected={followUpDateStart}
                                        onSelect={setFollowUpDateStart}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            <span className="text-muted-foreground">to</span>

                            {/* TO */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "flex-1 justify-start text-left font-normal",
                                            !followUpDateEnd && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {followUpDateEnd ? format(followUpDateEnd, "LLL dd, y") : "To"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="p-0">
                                    <Calendar
                                        mode="single"
                                        selected={followUpDateEnd}
                                        onSelect={setFollowUpDateEnd}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
                <DialogFooter className="mt-4">
                    <Button onClick={handleGetReports}>Get Reports</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
