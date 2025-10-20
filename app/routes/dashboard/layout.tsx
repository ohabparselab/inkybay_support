import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { lazy, Suspense, useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Outlet, redirect } from "react-router";
import { getUserId } from "@/session.server";
import { Search } from "lucide-react";
import { CenterSpinner } from "~/components/ui/center-spinner";
import { DashboardHeader } from "~/components/dashboard-header";
import { DashboardCardsSection } from "~/components/dashboard-cards-section";

const SearchModal = lazy(() =>
    import('~/components/modals/search-modal').then(module => ({ default: module.SearchModal }))
);

export async function loader({ request }: LoaderFunctionArgs) {
    const userId = await getUserId(request);
    if (!userId) {
        throw redirect("/");
    }
    return null;
}

export default function DashboardLayout() {
    
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <DashboardHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
