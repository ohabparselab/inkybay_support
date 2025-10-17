import {
    type RouteConfig,
    route,
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
        // Clients module routes
        route("clients", "./routes/clients/list.tsx"),
        // user module routes
        route("users", "./routes/users/list.tsx"),
        route("users/create", "./routes/users/create.tsx"),
        route("users/edit/:id", "./routes/users/edit.$id.tsx"),
        route("users/profile", "./routes/users/profile.tsx"),
        route("users/change-password", "./routes/users/change-password.tsx"),
        route("shop-details", "./routes/shop/details.tsx"),
        route("chats", "./routes/chats/list.tsx"),
        route("tasks", "./routes/tasks/list.tsx"),
        route("meetings", "./routes/meetings/list.tsx"),
        route("marketing-funnels", "./routes/marketing-funnels/list.tsx"),
        
        // settings routes
        route("settings/permissions", "./routes/settings/permission.list.tsx"),
        route("settings/modules", "./routes/settings/modules.list.tsx"),

    ]),
    // api routes
    route("api/users", "./api/users/index.ts"),
    route("api/users/:id", "./api/users/$id.ts"),
    route("api/statuses", "./api/statuses.ts"),
    
    // chats api routes
    route("api/chats", "./api/chats/index.ts"),
    route("api/chats/get-chats-by-shop", "./api/chats/get-chats-by-shop.ts"),

    // tasks api routes
    route("api/tasks", "./api/tasks/index.ts"),

    // meeting routes
    route("api/meetings", "./api/meetings/index.ts"),

    // marketing funnels routes
    route("api/marketing-funnels", "./api/marketing-funnels/index.ts"),
    
    //inkybay search api
    route("/api/inkybay/:kind", "./api/api.inkybay.$kind.tsx"),

    
    // 404 route
    route("*", "./routes/404.tsx"),
] satisfies RouteConfig;
