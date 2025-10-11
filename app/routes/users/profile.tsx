import { updateProfileSchema, type ProfileUpdateInput } from "~/lib/validations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { getUser, type User } from "@/lib/user.server";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";

export async function loader({ request }: LoaderFunctionArgs) {

    const currentUser = await getUser(request);

    if (!currentUser) {
        throw new Response("Unauthorized", { status: 401 });
    }

    return Response.json({ currentUser });
}

type ProfileFormValues = {
    fullName: string;
    email: string;
    avatar?: FileList;
};

export default function ProfilePage() {
    const { currentUser } = useLoaderData<{ currentUser: User }>();
    const [preview, setPreview] = useState(`/${currentUser.avatar}` || "/avatar-default.svg");
    const { register, handleSubmit, formState: { errors } } = useForm<ProfileUpdateInput>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            fullName: currentUser.fullName,
            email: currentUser.email,
            avatar: ''
        },
    });

    const onSubmit = async (data: ProfileUpdateInput) => {
        try {
            const formData = new FormData();
            formData.append("fullName", data.fullName);
            formData.append("email", data.email);
            if (data.avatar?.[0]) {
                formData.append("avatar", data.avatar[0]);
            }
            console.log("=======>>", data);
            const res: any = await fetch("/api/users", {
                method: "PUT",
                body: formData,
            });

            if (res.ok) {
                const updated = await res.json();
                toast.success("Profile updated successfully!");
                if (updated.avatar) setPreview(updated.avatar);
            } else {
                toast.error(`Failed to update profile.`);
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred.");
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    console.log(errors);

    // fallback initials
    const initials =
        currentUser.fullName
            ?.split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase() || "?";

    return (
        <div className="max-w-2xl mx-auto py-10">
            <Card className="shadow-md">
                <CardHeader className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                        {preview ? (
                            <AvatarImage src={preview} alt={currentUser.fullName || "User"} />
                        ) : (
                            <AvatarFallback>{initials}</AvatarFallback>
                        )}
                    </Avatar>
                    <CardTitle>Edit Profile</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <Label className="pb-2">Full Name</Label>
                            <Input {...register("fullName", { required: true })} />
                            {errors.fullName && <span className="text-destructive text-sm">{errors.fullName.message}</span>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label className="pb-2">Email</Label>
                            <Input type="email" {...register("email", { required: true })} />
                            {errors.email && <span className="text-destructive text-sm">{errors.email.message}</span>}

                        </div>

                        <div className="flex flex-col gap-1">
                            <Label className="pb-2">Profile Picture</Label>
                            <Input type="file" accept="image/*" {...register("avatar")} onChange={handleAvatarChange} />
                        </div>

                        <Button type="submit">Update Profile</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
