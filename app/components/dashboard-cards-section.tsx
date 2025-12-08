import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { IconTrendingUp } from "@tabler/icons-react"
import { Link } from "react-router"

export function DashboardCardsSection({ summary }: any) {

    const cards = [
        {
            label: "Total Tasks",
            value: summary.totalTasks,
            link: "/tasks",
            linkLabel: "All Tasks",
        },
        {
            label: "Total Chats",
            value: summary.totalChats,
            link: "/chats",
            linkLabel: "All Chats",
        },
        {
            label: "Total Marketing Funnels",
            value: summary.totalFunnels,
            link: "/marketing-funnels",
            linkLabel: "All Marketing Funnels",
        },
        {
            label: "Total Meetings",
            value: summary.totalMeetings,
            link: "/meetings",
            linkLabel: "All Meetings",
        },
        {
            label: "Total Reviews",
            value: summary.totalReviews,
            link: "/reviews",
            linkLabel: "All Reviews",
        },
        {
            label: "Total Feature Requests",
            value: summary.totalFeatureRequest,
            link: "/features",
            linkLabel: "All Feature Requests",
        },
        {
            label: "Total Collaborations",
            value: summary.totalCollaboration,
            link: "/collaborations",
            linkLabel: "All Collaborations",
        },
        {
            label: "Total Communities",
            value: summary.totalCommunities,
            link: "/communities",
            linkLabel: "All Communities",
        },
    ]

    return (
        <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {cards.map((card, idx) => (
                <Card key={idx} className="@container/card" data-slot="card">
                    <CardHeader>
                        <CardDescription>{card.label}</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {card.value ?? 0}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                <IconTrendingUp className="size-4" />
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 text-blue-500 underline flex gap-2 font-medium">
                            <Link to={card.link}>{card.linkLabel}</Link>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
