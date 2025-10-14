import { Outlet, redirect } from "react-router";
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

import type { LoaderFunctionArgs } from "react-router";
import { getUserId } from "@/session.server";
import { lazy, Suspense, useEffect, useState } from "react";
import { Search } from "lucide-react";

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
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="sticky mb-5 top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 h-6 data-[orientation=vertical]:h-6"
                            />
                            {/* You can add additional header content here */}
                        </div>
                        {/* Centered search input */}
                        <div className="flex flex-1 justify-center px-4">
                            <div className="relative w-full max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 px-4 pr-10 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    readOnly
                                    onClick={() => setSearchModalOpen(true)}
                                />
                                <Search
                                    className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none"
                                />
                            </div>
                        </div>
                    </header>

                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        <Outlet />
                    </div>
                </SidebarInset>
            </SidebarProvider>
            {
                searchModalOpen && (
                    <Suspense fallback={<div className="py-4 text-center">Loading...</div>}>
                        <SearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
                    </Suspense>
                )
            }
        </>
    );
}
