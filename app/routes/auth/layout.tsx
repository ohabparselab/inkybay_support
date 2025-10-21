import { Outlet, redirect } from "react-router";
import { getUserId } from "@/session.server";
import type { LoaderFunctionArgs } from "react-router";

export const meta = () => [{ title: "Login | InkyBay" }];

export async function loader({ request }: LoaderFunctionArgs) {
    const userId = await getUserId(request);
    if (userId) {
        throw redirect("/dashboard");
    }
    return null;
}

export default function AuthLayout() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Outlet />
            </div>
        </div>
    );
}
