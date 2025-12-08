import { SearchModal } from "@/components/modals/search-modal";
import { CenterSpinner } from "@/components/ui/center-spinner";
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator"
import { Headset, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Suspense, useState } from "react";
import { Link } from "react-router";

export function DashboardHeader() {

    const [searchModalOpen, setSearchModalOpen] = useState(false);

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <div className="flex flex-1 justify-center px-4">
                    <div className="relative w-full max-w-md">
                        <Input
                            type="text"
                            placeholder="Search..."
                            className="cursor-pointer rounded-full"
                            readOnly
                            onClick={() => setSearchModalOpen(true)}
                        />
                        <Search
                            className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                    </div>
                </div>
                <Link
                    to="https://support.inkybay.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition"
                >
                    <Headset className="h-4 w-4" />
                    <span>Support</span>
                </Link>
                <ThemeToggle />
            </div>
            {
                searchModalOpen && (
                    <Suspense fallback={<CenterSpinner />}>
                        <SearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
                    </Suspense>
                )
            }
        </header>

    )
}
