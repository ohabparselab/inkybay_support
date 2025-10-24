import { Dialog, DialogContent } from "../ui/dialog";
import { Link, useFetcher } from "react-router";
import { useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";

interface SearchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
    const searchFetcher = useFetcher<{ status: number; data: any }>();

    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [searchType, setSearchType] = useState('all');
    const [selectedPlatform, setSelectedPlatform] = useState("");
    const [projects, setProjects] = useState<any>("");

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

    const fetchProjects = async () => {
        try {
            // setLoadingUsers(true);
            const res = await fetch("api/settings/projects");
            const data = await res.json();
            setProjects(data.projects);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
        // finally {
        //     setLoadingUsers(false);
        // }
    };

    useEffect(() => {
        fetchProjects()
    }, []);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-3xl w-full mx-auto rounded-lg shadow-lg">
                {/* Modal Header */}
                <div className="sticky top-0 w-full py-5 border-b">
                    <div className="relative w-full max-w-3xl mx-auto">
                        {/* Search Icon */}
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </span>

                        {/* Right-side Select Dropdown inside Input */}
                        <div className="absolute inset-y-0 right-0 border rounded-r-4xl flex items-center pr-2">
                            <Select onValueChange={(value) => setSelectedPlatform(value)}>
                                <SelectTrigger className="h-10 border-none shadow-none focus:ring-0 focus:ring-offset-0 bg-transparent">
                                    <SelectValue placeholder="Select Project / Platform" />
                                </SelectTrigger>
                                <SelectContent align="end" className="mt-3">
                                    {projects.map((p:any) => (
                                        <SelectGroup key={p.projectName}>
                                            <SelectLabel>{p.projectName}</SelectLabel>
                                            {p.platforms.map((pf:any) => (
                                                <SelectItem key={pf.id} value={pf.id}>
                                                    {pf.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    ))}
                                    {/* <SelectGroup>
                                        <SelectLabel>Optionia</SelectLabel>
                                        <SelectItem value="project12-platform1">Shopify</SelectItem>
                                        <SelectItem value="project12-platform2">BigCommerce</SelectItem>
                                    </SelectGroup> */}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Search Input */}
                        <Input
                            type="text"
                            placeholder="Search..."
                            className="h-14 pl-10 pr-44 text-base rounded-4xl"
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
                        Array.from({ length: 3 }).map((_, i) => (
                            <div className="mb-2 border animate-pulse h-28 bg-accent rounded-xl shadow-sm flex justify-center items-center" >
                                <Spinner />
                            </div>
                        ))
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
                        <div className="text-center text-gray-400 py-40">
                            No results found
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
