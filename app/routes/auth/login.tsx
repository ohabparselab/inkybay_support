import type { ActionFunctionArgs } from "react-router";
import { Form, useActionData } from "react-router";
import { loginSchema } from "@/lib/validations";
import { handleLogin } from "@/lib/auth.server";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"



export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate
    const result = loginSchema.safeParse(data);
    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        return { errors };
    }

    const { email, password } = result.data;
    const session = await handleLogin(formData);
    if (!session) {
        return { formError: "Invalid credentials email or password" };
    }

    return session;
}

export default function LoginPage() {
    const actionData: any = useActionData<typeof action>();
    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState<Record<string, string | null>>({
        email: actionData?.errors?.email?.[0] || null,
        password: actionData?.errors?.password?.[0] || null,
    });

    const handleChange = (field: string) => {
        setErrors((prev) => ({ ...prev, [field]: null }));
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">InkyBay Support</CardTitle>
                    <CardDescription>
                        Login with your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form method="post">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    onChange={() => handleChange("email")}
                                />
                                {(errors.email || actionData?.errors?.email) && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.email || actionData?.errors?.email?.[0]}
                                    </p>
                                )}
                            </Field>
                            <Field>
                                <div className="flex items-center justify-between">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                </div>

                                <div className="relative">
                                    <Input
                                        name="password"
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="pr-10"
                                        onChange={() => handleChange("password")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {(errors.password || actionData?.errors?.password) && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.password || actionData?.errors?.password?.[0]}
                                    </p>
                                )}
                            </Field>
                            {actionData?.formError && (
                                <p className="text-sm text-red-500 mt-1 text-center">
                                    {actionData.formError}
                                </p>
                            )}
                            <Field>
                                <Button type="submit" className="w-full mt-2">
                                    Login
                                </Button>
                            </Field>
                        </FieldGroup>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
