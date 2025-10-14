import { Search } from "lucide-react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { useEffect, useState } from "react";

interface SearchModalProps {
    open: boolean,
    onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-3xl w-full -mt-30 mx-auto bg-white rounded-lg shadow-lg">
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
    )
}