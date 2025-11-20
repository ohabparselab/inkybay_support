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
        route("reviews", "./routes/reviews/list.tsx"),
        route("features", "./routes/features/list.tsx"),
        route("collaborations", "./routes/collaborations/list.tsx"),
        route("communities", "./routes/communities/list.tsx"),
        // reports routes
        // settings routes
        route("settings/permissions", "./routes/settings/permission.list.tsx"),
        route("settings/modules", "./routes/settings/modules.list.tsx"),
        route("settings/projects", "./routes/settings/projects.list.tsx"),
        route("settings/platforms", "./routes/settings/platforms.list.tsx"),
        
        route("activity-logs", "./routes/activity-logs/list.tsx"),
    ]),
    
    route("/api/clients/emails/:clientId", "./api/clients/$clientId.emails.ts"),

    route("reports/marketing-funnel", "./routes/reports/marketing-funnel.tsx"),
    // api routes
    route("api/auth/login", "./api/auth/login.ts"),
    route("api/users", "./api/users/index.ts"),
    route("api/users/:id", "./api/users/$id.ts"),
    route("api/statuses", "./api/statuses.ts"),

    // chats api routes
    route("api/chats", "./api/chats/index.ts"),
    route("api/chats/get-chats-by-client-id", "./api/chats/get-chats-by-client-id.ts"),
    route("api/chats/:chatId", "./api/chats/$chatId.ts"),
    route("api/chats/client-chat/:clientId", "./api/chats/$clientId.ts"),

    route("api/clients", "./api/clients/index.ts"),

    // tasks api routes
    route("api/tasks", "./api/tasks/index.ts"),
    route("api/tasks/get-tasks-by-client-id", "./api/tasks/get-tasks-by-client-id.ts"),
    route("api/tasks/:taskId", "./api/tasks/$taskId.ts"),
    route("api/tasks/latest-task/:clientId", "./api/tasks/$clientId.latest-task.ts"),

    // meeting routes
    route("api/meetings", "./api/meetings/index.ts"),
    route("api/meetings/get-meetings-by-shop", "./api/meetings/get-meetings-by-shop.ts"),
    route("api/meetings/:meetingId", "./api/meetings/$meetingId.ts"),

    // marketing funnels routes
    route("api/marketing-funnels", "./api/marketing-funnels/index.ts"),
    route("api/marketing-funnels/get-marketing-funnels-by-client-id", "./api/marketing-funnels/get-marketing-funnels-by-client-id.ts"),
    route("api/marketing-funnels/:mfId", "./api/marketing-funnels/$mfId.ts"),

    // review api routes
    route("api/reviews", "./api/reviews/index.ts"),
    route("api/reviews/:reviewId", "./api/reviews/$reviewId.ts"),
    // review api routes
    route("api/features", "./api/features/index.ts"),
    route("api/features/:featureId", "./api/features/$featureId.ts"),
    
    // collaborations api routes
    route("api/collaborations", "./api/collaborations/index.ts"),
    route("api/collaborations/:collaborationId", "./api/collaborations/$collaborationId.ts"),
    route("api/collaboration-areas", "./api/collaborations/areas.ts"),
    route("api/collaboration-statuses", "./api/collaborations/statues.ts"),
    
    // communities api routes
    route("api/communities", "./api/communities/index.ts"),
    route("api/communities/:communityId", "./api/communities/$communityId.ts"),
    route("api/communities-statuses", "./api/communities/statues.ts"),
    
    // notifications api routes
    route("api/notifications", "./api/notifications/index.ts"),
    route("api/notifications/:notificationId", "./api/notifications/$notificationId.ts"),
    route("api/notifications/mark-all-read", "./api/notifications/mark-all-read.ts"),

    // settings api
    route("api/settings/projects", "./api/settings/projects/index.ts"),
    route("api/settings/projects/:projectId", "./api/settings/projects/$projectId.ts"),
    route("api/settings/platforms", "./api/settings/platforms/index.ts"),
    route("api/settings/platforms/:platformId", "./api/settings/platforms/$platformId.ts"),

    //inkybay search api
    route("api/inkybay/:kind", "./api/api.inkybay.$kind.tsx"),
    
    // comments api routes
    route("api/comments", "./api/comments/index.ts"),
    route("api/comments/:commentId", "./api/comments/$commentId.ts"),

    // dashboard api
    route("api/dashboard", "./api/dashboard/index.ts"),
    route("action/set-theme", "./routes/action.set-theme.ts"),


    // 404 route
    route("*", "./routes/404.tsx"),
] satisfies RouteConfig;
