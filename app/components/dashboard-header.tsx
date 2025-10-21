import { SearchModal } from "@/components/modals/search-modal";
import { CenterSpinner } from "@/components/ui/center-spinner";
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator"
import { Suspense, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";

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
                            className="cursor-pointer"
                            readOnly
                            onClick={() => setSearchModalOpen(true)}
                        />
                        <Search
                            className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                    </div>
                </div>
                <ThemeToggle/>
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

// <header className="sticky mb-5 top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
//                         <div className="flex items-center gap-2 px-4">
//                             <SidebarTrigger className="-ml-1" />
//                             <Separator
//                                 orientation="vertical"
//                                 className="mr-2 h-6 data-[orientation=vertical]:h-6"
//                             />
//                             {/* You can add additional header content here */}
//                         </div>
//                         {/* Centered search input */}
//                         <div className="flex flex-1 justify-center px-4">
//                             <div className="relative w-full max-w-md">
//                                 <input
//                                     type="text"
//                                     placeholder="Search..."
//                                     className="w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 px-4 pr-10 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
//                                     readOnly
//                                     onClick={() => setSearchModalOpen(true)}
//                                 />
//                                 <Search
//                                     className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none"
//                                 />
//                             </div>
//                         </div>
//                     </header>
