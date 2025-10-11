import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { createUserSchema, type CreateUserInput } from "~/lib/validations"
import { Card, CardContent } from "~/components/ui/card"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Checkbox } from "@/components/ui/checkbox"
import { Link, useLoaderData } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { prisma } from "~/lib/prisma.server"
import { List } from "lucide-react"
import { toast } from "sonner"

export async function loader() {
    const modules = await prisma.module.findMany({
        include: {
            modulePermissions: { include: { permission: true } },
        },
    })
    const permissions = await prisma.permission.findMany()
    return { modules, permissions }
}

export default function CreateUser() {
    const { modules, permissions } = useLoaderData<typeof loader>()

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<CreateUserInput>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            role: "user",
            permissions: modules.reduce((acc, mod) => {
                acc[mod.id] = []
                return acc
            }, {} as Record<number, number[]>),
        },
    })

    const onSubmit = async (data:CreateUserInput) => { 
        const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })

        if (res.ok) {
            toast.success("User created successfully!")
            reset()
        } else {
            toast.error("Failed to create user.")
        }
    }

    return (
        <div className="px-6 pb-10 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Create User</h1>

                <Button asChild className="gap-2">
                    <Link to="/users">
                        <List className="h-4 w-4" />
                        Users List
                    </Link>
                </Button>
            </div>
            <Card className="w-full">
                <CardContent>
                    <form method="post" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="flex flex-col gap-1">
                                <Label className="pb-2">Full Name</Label>
                                <Input placeholder="Enter full name" {...register("fullName")} />
                                {errors.fullName && <span className="text-destructive text-sm">{errors.fullName.message}</span>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label className="pb-2">Email</Label>
                                <Input placeholder="Enter email" {...register("email")} />
                                {errors.email && <span className="text-destructive text-sm">{errors.email.message}</span>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label className="pb-2">Password</Label>
                                <Input type="password" placeholder="Enter password" {...register("password")} />
                                {errors.password && <span className="text-destructive text-sm">{errors.password.message}</span>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label className="pb-2">Role</Label>
                                <Controller
                                    control={control}
                                    name="role"
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="super-admin">Super Admin</SelectItem>
                                                <SelectItem value="user">User</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.role && <span className="text-destructive text-sm">{errors.role.message}</span>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <h2 className="text-lg font-semibold">Module Permissions</h2>
                            {modules.map((module: any) => (
                                <div key={module.id} className="border rounded p-4">
                                    <h3 className="font-medium">{module.name}</h3>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        {permissions.map((perm: any) => (
                                            <Controller
                                                key={perm.id}
                                                control={control}
                                                name="permissions"
                                                render={({ field }) => {
                                                    // Ensure we have an object to avoid 'undefined'
                                                    const currentPermissions: Record<number, number[]> = field.value || {}
                                                    const currentModulePermissions = currentPermissions[module.id] || []
                                                    const checked = currentModulePermissions.includes(perm.id)

                                                    const handleChange = () => {
                                                        const updated = currentModulePermissions.includes(perm.id)
                                                            ? currentModulePermissions.filter((id) => id !== perm.id)
                                                            : [...currentModulePermissions, perm.id]

                                                        field.onChange({ ...currentPermissions, [module.id]: updated })
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
                        <Button type="submit">Create User</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
