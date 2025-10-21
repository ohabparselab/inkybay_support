import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DashboardCardsSection } from "~/components/dashboard-cards-section";
import { useFetcher } from "react-router-dom";
import { useEffect } from "react";
import { Badge } from "~/components/ui/badge";

type StatCardProps = {
    title: string;
    description: string;
    value: string | number;
    trend: "up" | "down";
    badgeValue: string;
    footerTitle: string;
    footerSubtitle: string;
};

export const meta = () => [{ title: "Dashboard | InkyBay" }];

export default function DashboardPage() {

    const fetcher = useFetcher();

    useEffect(() => {
        fetcher.submit({}, { method: "post", action: "/api/dashboard" });
    }, []);

    const data = fetcher.data;

    console.log("=======>>", data)

    // const stats: StatCardProps[] = [
    //     {
    //         title: "Tasks",
    //         description: "Total Tasks",
    //         value: "125",
    //         trend: "up",
    //         badgeValue: "+12.5%",
    //         footerTitle: "Pending Tasks",
    //         footerSubtitle: "11",
    //     },
    //     {
    //         title: "Clients",
    //         description: "Total Chats",
    //         value: "1,234",
    //         trend: "up",
    //         badgeValue: "20%",
    //         footerTitle: "Total Chats",
    //         footerSubtitle: "2234",
    //     },
    //     {
    //         title: "Marketing Funnels",
    //         description: "Total Marketing Funnels",
    //         value: "45",
    //         trend: "up",
    //         badgeValue: "+12.5%",
    //         footerTitle: "Active Funnels",
    //         footerSubtitle: "20",
    //     },
    //     {
    //         title: "Meetings",
    //         description: "Total Meetings",
    //         value: "43",
    //         trend: "up",
    //         badgeValue: "4.5%",
    //         footerTitle: "Today Meetings with clients",
    //         footerSubtitle: "0",
    //     },
    // ];

    if (!data)
        return <p className="text-center py-10 text-muted-foreground">Loading dashboard...</p>;

    const { summary, pendingTasks, latestTasks, todayMeetings, upcomingMeetings } = data;

    return (
        <>
            <DashboardCardsSection summary={summary} />
            <div className="flex w-full gap-4 px-4 lg:px-6">
                <div className="w-1/2">
                    <section className="border p-3 rounded">
                        <h3 className="mb-2 font-semibold tracking-tight">Tasks</h3>
                        <Tabs defaultValue="pending-tasks" className="w-full">
                            <TabsList className="w-full flex border-b">
                                <TabsTrigger value="pending-tasks" className="flex-1 text-center px-6 py-4 font-medium">
                                    Pending Tasks
                                    <Badge variant="outline">
                                        {summary.pendingTaskCount}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="latest-tasks" className="flex-1 text-center px-6 py-4 ont-medium">
                                    Latest Tasks
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="pending-tasks" className="mt-2">
                                <div className="rounded-md border bg-card shadow-sm">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Shop Name</TableHead>
                                                <TableHead>Provided By</TableHead>
                                                <TableHead>Task Added</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pendingTasks.length > 0 ? (
                                                pendingTasks.map((task: any, idx: number) => (
                                                    <TableRow key={task.id}>
                                                        <TableCell>{task.client.shopName}</TableCell>
                                                        <TableCell>{task.providedByUser.fullName}</TableCell>
                                                        <TableCell>{new Date(task.taskAddedDate).toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {task.status.name}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                                        No pending tasks found.
                                                    </TableCell>
                                                </TableRow>
                                            )
                                            }
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>
                            <TabsContent value="latest-tasks" className="mt-3">
                                <div className="rounded-md border bg-card shadow-sm">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Shop Name</TableHead>
                                                <TableHead>Provided By</TableHead>
                                                <TableHead>Task Added</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {latestTasks.length > 0 ? (
                                                latestTasks.map((task: any, idx: number) => (
                                                    <TableRow key={task.id}>
                                                        <TableCell>{task.client.shopName}</TableCell>
                                                        <TableCell>{task.providedByUser.fullName}</TableCell>
                                                        <TableCell>{new Date(task.taskAddedDate).toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {task.status.name}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                                        No tasks found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </section>
                </div>
                <div className="w-1/2">
                    <section className="border p-3 rounded">
                        <h3 className="mb-2 font-semibold tracking-tight">Meetings</h3>
                        <Tabs defaultValue="today-meetings" className="w-full">
                            <TabsList className="w-full flex border-b">
                                <TabsTrigger value="today-meetings" className="flex-1 text-center px-6 py-4 font-medium">
                                    Today Meetings
                                    <Badge variant="outline">
                                        {summary.todayMeetingCount}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="upcoming-meetings" className="flex-1 text-center px-6 py-4 ont-medium">
                                    Upcoming Meetings
                                    <Badge variant="outline">
                                        {summary.upcomingMeetingCount}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="today-meetings" className="mt-2">
                                <div className="rounded-md border bg-card shadow-sm">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Store URL</TableHead>
                                                <TableHead>Agent</TableHead>
                                                <TableHead>Joining Status</TableHead>
                                                <TableHead>Meeting Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {todayMeetings.length > 0 ? (
                                                todayMeetings.map((meeting: any, idx: number) => (
                                                    <TableRow key={meeting.id}>
                                                        <TableCell>{meeting.storeUrl}</TableCell>
                                                        <TableCell>{meeting.user.fullName}</TableCell>
                                                        <TableCell className="flex flex-wrap gap-1">
                                                            {meeting.joiningStatus ? 'Yes' : 'No'}
                                                        </TableCell>
                                                        <TableCell>{new Date(meeting.meetingDateTime).toLocaleString()}</TableCell>
                                                    </TableRow>
                                                ))) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                                        No today meetings found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>
                            <TabsContent value="upcoming-meetings" className="mt-3">
                                <div className="rounded-md border bg-card shadow-sm">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Store URL</TableHead>
                                                <TableHead>Agent</TableHead>
                                                <TableHead>Joining Status</TableHead>
                                                <TableHead>Meeting Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {upcomingMeetings.length > 0 ? (
                                                upcomingMeetings.map((meeting: any, idx: number) => (
                                                    <TableRow key={meeting.id}>
                                                        <TableCell>{meeting.storeUrl}</TableCell>
                                                        <TableCell>{meeting.user.fullName}</TableCell>
                                                        <TableCell className="flex flex-wrap gap-1">
                                                            {meeting.joiningStatus ? 'Yes' : 'No'}
                                                        </TableCell>
                                                        <TableCell>{new Date(meeting.meetingDateTime).toLocaleString()}</TableCell>
                                                    </TableRow>
                                                ))) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                                        No upcoming meetings found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </section>
                </div>
            </div>
            {/* <DataTable data={data} /> */}
        </>
    );
};
