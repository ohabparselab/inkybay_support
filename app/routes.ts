import {
    type RouteConfig,
    route,
    index,
    layout,
} from "@react-router/dev/routes";

export default [
    // auth layout routes
    layout("./routes/auth/layout.tsx", [
        route("/", "./routes/auth/login.tsx"),
        route("/logout", "./routes/auth/logout.tsx"),
    ]),
    // dashboard layout routes
    layout("./routes/dashboard/layout.tsx", [
        route("dashboard", "./routes/dashboard/dashboard.tsx"),
        route("users", "./routes/users/list.tsx"),
        route("users/create", "./routes/users/create.tsx"),
        route("users/edit/:id", "./routes/users/edit.$id.tsx"),
        route("users/profile", "./routes/users/profile.tsx"),
    ]),
    // api routes
    route("api/users", "./api/users/index.ts"),
    route("api/users/:id", "./api/users/$id.ts"),
    // 404 route
    route("*", "./routes/404.tsx"),
] satisfies RouteConfig;
