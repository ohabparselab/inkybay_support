import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface AddOptionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    setItems: (updater: (prev: any[]) => any[]) => void;
    endpoint: string; // e.g. "/api/task-statuses" or "/api/collaboration-areas"
    title?: string; // e.g. "Add New Status"
    label?: string; // e.g. "Status Name"
    successMessage?: string; // custom toast message
}

export function AddOptionModal({
    open,
    onOpenChange,
    setItems,
    endpoint,
    title = "Add New Item",
    label = "Name",
    successMessage = "Item added successfully.",
}: AddOptionModalProps) {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");

    const handleAdd = async () => {
        if (!value.trim()) {
            setError(`${label} is required`);
            return;
        }

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: value.trim() }),
            });

            if (res.ok) {
                const data = await res.json();
                const addedItem =
                    data?.item || data?.status || data?.area || data?.data || data;

                setItems((prev: any[]) => [
                    ...prev,
                    { id: addedItem.id, name: addedItem.name },
                ]);

                setValue("");
                setError("");
                onOpenChange(false);
                toast.success(successMessage);
            } else {
                toast.error("Failed to add new item");
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Try again.");
            toast.error("Something went wrong. Try again.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="py-2">
                    <Input
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            if (e.target.value.trim()) setError("");
                        }}
                        placeholder={`Enter ${label.toLowerCase()}`}
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>

                <DialogFooter className="justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleAdd}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
