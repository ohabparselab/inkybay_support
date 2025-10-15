import { Dialog, DialogContent } from "../ui/dialog";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { Spinner } from "../ui/spinner";
import { Search } from "lucide-react";
import { Input } from "../ui/input";

interface SearchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
    const searchFetcher = useFetcher<{ status: number; data: any }>();

    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);

    // Fetch search results when query changes
    useEffect(() => {
        if (!searchQuery) {
            setResults([]);
            return;
        }

        const timeout = setTimeout(() => {
            const fd = new FormData();
            fd.set("srckey", searchQuery);
            searchFetcher.submit(fd, {
                method: "post",
                action: "/api/inkybay/search",
            });
        }, 300); // debounce

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    // Update results when fetcher returns data
    useEffect(() => {
        if (searchFetcher.data?.status === 200) {
            // assuming backend returns { data: [...] }
            setResults(searchFetcher.data.data || []);
        } else if (searchFetcher.data?.status && searchFetcher.data.status !== 200) {
            setResults([]);
        }
    }, [searchFetcher.data]);

    const loading = searchFetcher.state !== "idle";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-3xl w-full mx-auto bg-white rounded-lg shadow-lg">
                {/* Modal Header */}
                <div className="sticky top-0 w-full bg-white py-5 border-b border-gray-200">
                    <div className="relative w-full mx-auto">
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
                                className="group p-4 mb-2 border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer bg-white hover:bg-gray-50"
                            >
                                <div className="flex items-start justify-between">
                                    {/* Left side: Shop info */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-blue-600 group-hover:underline truncate">
                                            {item.shop_name || "Unknown Shop"}
                                        </h3>
                                        <p className="text-sm text-blue-600 group-hover:underline truncate">{item.url}</p>
                                    </div>

                                    {/* Right side: ID badge */}
                                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                        ID: {item.id}
                                    </span>
                                </div>

                                {/* Client info */}
                                <div className="mt-2 text-sm text-gray-700">
                                    <span className="font-medium text-gray-600">Client Email:</span>{" "}
                                    {item.client_email || "N/A"}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-400 py-10">
                            No results found
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
