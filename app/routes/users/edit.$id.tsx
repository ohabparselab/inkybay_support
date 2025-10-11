import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { updateUserSchema, type UpdateUserInput } from "~/lib/validations"
import { Link, useLoaderData, useParams } from "react-router"
import { Card, CardContent } from "~/components/ui/card"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { prisma } from "~/lib/prisma.server"
import { List } from "lucide-react"
import { toast } from "sonner"

export async function loader({ params }: { params: { id: string } }) {
    const user = await prisma.user.findUnique({
        where: { id: Number(params.id) },
        include: {
            role: true, 
            modulePermissions: true 
        },
    })

    const modules = await prisma.module.findMany({
        include: { modulePermissions: { include: { permission: true } } },
    })

    const permissions = await prisma.permission.findMany()

    // Convert user permissions to Record<moduleId, permissionIds>
    const userPermMap: Record<number, number[]> = {}
    user?.modulePermissions.forEach(up => {
        if (!userPermMap[up.moduleId]) userPermMap[up.moduleId] = []
        userPermMap[up.moduleId].push(up.permissionId)
    })

    return { user, modules, permissions, userPermMap }
}

export default function EditUser() {
    const { user, modules, permissions, userPermMap } = useLoaderData<typeof loader>()
    const { id } = useParams()

    const { register, handleSubmit, control, formState: { errors } } = useForm<UpdateUserInput>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: {
            fullName: user?.fullName || "",
            email: user?.email || "",
            password: "",
            role: user?.role.slug || "user",
            permissions: modules.reduce((acc, mod) => {
                acc[mod.id] = userPermMap[mod.id] || []
                return acc
            }, {} as Record<number, number[]>),
        }
    })

    const onSubmit = async (data: UpdateUserInput) => {
        const res = await fetch(`/api/users/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })

        if (res.ok) {
            toast.success("User updated successfully!")
        } else {
            toast.error("Failed to update user.")
        }
    }

    return (
        <div className="px-6 pb-10 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Edit User</h1>
                <Button asChild className="gap-2">
                    <Link to="/users">
                        <List className="h-4 w-4" />
                        Users List
                    </Link>
                </Button>
            </div>
            <Card className="w-full">
            {/* <Card className="w-full max-w-3xl mx-auto"> */}
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} method="post" className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="flex flex-col gap-1">
                                <Label>Full Name</Label>
                                <Input {...register("fullName")} />
                                {errors.fullName && <span className="text-destructive">{errors.fullName.message}</span>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label>Email</Label>
                                <Input {...register("email")} />
                                {errors.email && <span className="text-destructive">{errors.email.message}</span>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label>Password</Label>
                                <Input type="password" placeholder="Leave blank to keep current password" {...register("password")} />
                                {errors.password && <span className="text-destructive">{errors.password.message}</span>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label>Role</Label>
                                <Controller
                                    control={control}
                                    name="role"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="super-admin">Super Admin</SelectItem>
                                                <SelectItem value="user">User</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.role && <span className="text-destructive">{errors.role.message}</span>}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <h2 className="text-lg font-semibold">Module Permissions</h2>
                            {modules.map(mod => (
                                <div key={mod.id} className="border rounded p-4">
                                    <h3>{mod.name}</h3>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        {permissions.map(perm => (
                                            <Controller
                                                key={perm.id}
                                                control={control}
                                                name="permissions"
                                                render={({ field }) => {
                                                    const currentPermissions: Record<number, number[]> = field.value || {}
                                                    const checked = currentPermissions[mod.id]?.includes(perm.id) || false

                                                    const handleChange = () => {
                                                        const updated = checked
                                                            ? currentPermissions[mod.id].filter(id => id !== perm.id)
                                                            : [...(currentPermissions[mod.id] || []), perm.id]
                                                        field.onChange({ ...currentPermissions, [mod.id]: updated })
                                                    }

                                                    return (
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox checked={checked} onCheckedChange={handleChange} />
                                                            <span>{perm.name}</span>
                                                        </div>
                                                    )
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button type="submit">Update User</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
