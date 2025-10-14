import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";

export function AddStatusModal({ open, onOpenChange, setStatuses }: any) {

    const [newStatus, setNewStatus] = useState("");
    const [error, setError] = useState("");

    const handleAddStatus = async () => {
        if (!newStatus.trim()) {
            setError("Status name is required");
            return;
        }

        try {
            const res = await fetch("/api/statuses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newStatus.trim() }),
            });

            if (res.ok) {
                const data = await res.json();
                console.log("====data==>>", data)
                setStatuses((prev: any) => [...prev, { id: data.status.id, name: data.status.name }]);
                setNewStatus("");
                setError("");
                onOpenChange(false);
                toast.success('New status added successfully.');
            } else {
                toast.error('Failed to add status');
            }
        } catch (err) {
            setError("Something went wrong. Try again.");
            toast.error('Something went wrong. Try again.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Status</DialogTitle>
                </DialogHeader>

                <div className="py-2">
                    <Input
                        value={newStatus}
                        onChange={(e) => {
                            setNewStatus(e.target.value);
                            if (e.target.value.trim()) setError("");
                        }}
                        placeholder="Enter status name"
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>

                <DialogFooter className="justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddStatus}>
                        Add Status
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
