import { createCookieSessionStorage } from "react-router"
import { createThemeSessionResolver } from "remix-themes"

const env = process.env.PARSETRACK_NODE_ENV || "development";

const isSecure = ["beta", "production"].includes(env);

const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "theme",
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secrets: ["s3cr3t"],
        ...(isSecure ? { domain: "parsetrack.com", secure: true } : {}),
    },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage)