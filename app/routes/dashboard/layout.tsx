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
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";
import { Search } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
    const userId = await getUserId(request);
    if (!userId) {
        throw redirect("/");
    }
    return null;
}

export default function DashboardLayout() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch search results
    useEffect(() => {
        if (!searchQuery) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                setResults(data.results || []);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(fetchResults, 300); // debounce 300ms
        return () => clearTimeout(timeout);
    }, [searchQuery]);
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
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full cursor-pointer max-w-md rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                readOnly
                                onClick={() => setSearchOpen(true)}
                            />
                        </div>
                    </header>

                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        <Outlet />
                    </div>
                </SidebarInset>
            </SidebarProvider>
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                <DialogContent className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white py-5 border-b border-gray-200">
                        <div className="relative w-full max-w-md mx-auto">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </span>
                            <Input
                                type="text"
                                placeholder="Search..."
                                className="h-14 pl-10 pr-4 text-base"
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-4 max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Spinner />
                            </div>
                        ) : results.length > 0 ? (
                            results.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
                                >
                                    {item.name}
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-10">No results found</div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
