import { useEffect, useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export function MentionTooltip({ userId, children }: { userId: number; children: React.ReactNode }) {
    
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/users/${userId}`)
            .then((r) => r.json())
            .then((d) => setUser(d.user))
            .catch(() => { });
    }, [userId]);

    return (
        <HoverCard>
            <HoverCardTrigger asChild>{children}</HoverCardTrigger>
            <HoverCardContent className="p-2 text-sm">
                {user ? (
                    <div>
                        <strong>{user.fullName}</strong>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                    </div>
                ) : (
                    "Loading..."
                )}
            </HoverCardContent>
        </HoverCard>
    );
}
