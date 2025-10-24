import { Dialog, DialogContent } from "../ui/dialog";
import { Link, useFetcher } from "react-router";
import { useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface SearchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
    const searchFetcher = useFetcher<{ status: number; data: any }>();

    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [searchType, setSearchType] = useState('all');

    // Fetch search results when query changes
    useEffect(() => {
        if (!searchQuery) {
            setResults([]);
            return;
        }

        const timeout = setTimeout(() => {
            const fd = new FormData();
            fd.set("srckey", searchQuery.trim());
            fd.set("type", searchType);

            searchFetcher.submit(fd, {
                method: "post",
                action: "/api/inkybay/search",
            });
        }, 300); // debounce

        return () => clearTimeout(timeout);
    }, [searchQuery, searchType]);

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
            <DialogContent className="!max-w-3xl w-full mx-auto rounded-lg shadow-lg">
                {/* Modal Header */}
                <div className="sticky top-0 w-full py-5 border-b">
                    <div className="relative w-full mx-auto">
                        {/* Search Icon */}
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-5 w-5" />
                        </span>

                        {/* Search Input */}
                        <Input
                            type="text"
                            placeholder="Search..."
                            className="h-14 pl-10 pr-4 text-base"
                            autoFocus
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Radio Buttons */}
                    <RadioGroup
                        defaultValue="all"
                        value={searchType}
                        onValueChange={setSearchType}
                        className="flex justify-center gap-6 mt-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="all" />
                            <Label htmlFor="all" className="text-sm font-medium">
                                Search All
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="url" id="url" />
                            <Label htmlFor="url" className="text-sm font-medium">
                                Search by Shop URL
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="email" id="email" />
                            <Label htmlFor="email" className="text-sm font-medium">
                                Search by Email
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="name" id="name" />
                            <Label htmlFor="name" className="text-sm font-medium">
                                Search by Shop Name
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Modal Body */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Spinner />
                        </div>
                    ) : results.length > 0 ? (
                        results.map((item) => (
                            <Link to={`shop-details?shopUrl=${item.url}`} onClick={() => {
                                onOpenChange(false);
                                setSearchQuery("");
                                setResults([]);
                            }}>
                                <div
                                    key={item.id}
                                    className="group p-4 mb-2 border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
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
                                        <span className="text-xs font-medium text-gray-600 px-2 py-1 rounded-md">
                                            ID: {item.id}
                                        </span>
                                    </div>

                                    {/* Client info */}
                                    <div className="mt-2 text-sm text-gray-700">
                                        <span className="font-medium text-gray-600">Email:</span>{" "}
                                        {item.client_email || "N/A"}
                                    </div>
                                </div>
                            </Link>
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
