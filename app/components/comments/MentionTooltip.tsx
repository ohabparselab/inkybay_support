import { useEffect, useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components//ui/avatar";
import { Spinner } from "@/components//ui/spinner";

export function MentionTooltip({ userId, children }: { userId: number; children: React.ReactNode }) {

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/users/${userId}`)
            .then((r) => r.json())
            .then((d) => setUser(d.user))
            .catch(() => { });
    }, [userId]);

    return (
        <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>{children}</HoverCardTrigger>
            <HoverCardContent className="w-64 p-4 shadow-lg border border-gray-100 rounded-2xl bg-white">
                {user ? (
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <Avatar className="w-12 h-12 border border-gray-200">
                            <AvatarImage src={user.avatar || "/avatar-default.svg"} alt={user.fullName} />
                            <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
                        </Avatar>

                        {/* User Info */}
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 text-sm">{user.fullName}</span>
                            {user.role && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full w-fit mt-0.5">
                                    {user.role?.name}
                                </span>
                            )}
                            <span className="text-xs text-gray-600 mt-1">{user.email}</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500">
                        <Spinner/>
                    </div>
                )}
            </HoverCardContent>
        </HoverCard>
    );
}
