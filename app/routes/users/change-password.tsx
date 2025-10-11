import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { changePasswordSchema, type ChangePasswordInput } from "~/lib/validations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChangePasswordPage() {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordInput>({
        resolver: zodResolver(changePasswordSchema),
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

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
                        {/* Current Password */}
                        <div className="flex flex-col gap-1">
                            <Label className="pb-2">Current Password</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword.current ? "text" : "password"}
                                    {...register("currentPassword")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.currentPassword && (
                                <p className="text-destructive text-sm">{errors.currentPassword.message}</p>
                            )}
                        </div>

                        {/* New Password */}
                        <div className="flex flex-col gap-1">
                            <Label className="pb-2">New Password</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword.new ? "text" : "password"}
                                    {...register("newPassword")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="text-destructive text-sm">{errors.newPassword.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-1">
                            <Label className="pb-2">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword.confirm ? "text" : "password"}
                                    {...register("confirmPassword")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
                            )}
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
