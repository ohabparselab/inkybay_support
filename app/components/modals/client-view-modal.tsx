"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Eye } from "lucide-react";

type Client = {
    id: string;
    shopDomain: string;
    email?: string;
    shopName: string;
    accessToken: string;
    planName?: string;
    country?: string;
    currency?: string;
    timezone?: string;
    installedAt: string;
    uninstalledAt?: string;
    status: string;
    createdAt: string;
};

interface ClientViewModalProps {
    client: Client;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ClientViewModal({client, open, onOpenChange }: ClientViewModalProps) {
    // const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Client Details</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-2">
                    <div><strong>Shop Name:</strong> {client.shopName}</div>
                    <div><strong>Shop Domain:</strong> {client.shopDomain}</div>
                    <div><strong>Email:</strong> {client.email || "N/A"}</div>
                    <div><strong>Plan:</strong> {client.planName || "N/A"}</div>
                    <div><strong>Country:</strong> {client.country || "N/A"}</div>
                    <div><strong>Currency:</strong> {client.currency || "N/A"}</div>
                    <div><strong>Timezone:</strong> {client.timezone || "N/A"}</div>
                    <div><strong>Status:</strong> {client.status}</div>
                    <div><strong>Installed At:</strong> {new Date(client.installedAt).toLocaleString()}</div>
                    {client.uninstalledAt && (
                        <div><strong>Uninstalled At:</strong> {new Date(client.uninstalledAt).toLocaleString()}</div>
                    )}
                    <div><strong>Created At:</strong> {new Date(client.createdAt).toLocaleString()}</div>
                </div>
                <div className="mt-4 flex justify-end">
                    <DialogClose asChild className="cursor-pointer">
                        <Button>Close</Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
}
