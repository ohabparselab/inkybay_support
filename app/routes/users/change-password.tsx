import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";

import { changePasswordSchema, type ChangePasswordInput } from "~/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChangePasswordPage() {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordInput>({
        resolver: zodResolver(changePasswordSchema),
    });

    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: ChangePasswordInput) => {
        try {
            setLoading(true);
            const res = await fetch("/api/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                toast.success("Password updated successfully!");
                reset();
            } else {
                const err = await res.json();
                toast.error(err.message || "Failed to update password.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto py-10 space-y-6 px-4">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <Label className="pb-2">Current Password</Label>
                            <Input type="password" {...register("currentPassword")} />
                            {errors.currentPassword && <p className="text-destructive text-sm">{errors.currentPassword.message}</p>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label className="pb-2">New Password</Label>
                            <Input type="password" {...register("newPassword")} />
                            {errors.newPassword && <p className="text-destructive text-sm">{errors.newPassword.message}</p>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label className="pb-2">Confirm New Password</Label>
                            <Input type="password" {...register("confirmPassword")} />
                            {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>}
                        </div>

                        <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Password"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
