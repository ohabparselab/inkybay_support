import { Outlet, redirect } from "react-router";
import { getUserId } from "@/session.server";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect("/dashboard");
  }
  return null;
}

export default function AuthLayout() {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="/" className="flex items-center gap-2 self-center font-medium">
                    <img
                        src="/inkybay-logo.svg"
                        alt="InkyBay Support"
                        className="h-20 w-auto"
                    />
                </a>
                <Outlet />
            </div>
        </div>
    );
}
