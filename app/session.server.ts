import { createCookieSessionStorage, redirect } from "react-router";

const sessionSecret = process.env.PARSETRACK_SESSION_SECRET || "Deui54DWqrtasd!Ol#f5D";
const env = process.env.PARSETRACK_NODE_ENV || "development";

const storage = createCookieSessionStorage({
    cookie: {
        name: "inkybay_session",
        secure: ["beta", "production"].includes(env),
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        httpOnly: true,
    },
});

export async function createUserSession(userId: string, redirectTo: string) {
    const session = await storage.getSession();
    session.set("userId", userId);
    return redirect(redirectTo, {
        headers: { "Set-Cookie": await storage.commitSession(session) },
    });
}

export async function getUserSession(request: Request) {
    return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
    const session = await getUserSession(request);
    return session.get("userId");
}

export async function logout(request: Request) {
    const session = await getUserSession(request);
    return redirect("/", {
        headers: { "Set-Cookie": await storage.destroySession(session) },
    });
}
