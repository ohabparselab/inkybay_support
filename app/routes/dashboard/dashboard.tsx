"use client";
import { List } from "lucide-react";
import { DashboardCardsSection } from "~/components/dashboard-cards-section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

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

    const stats: StatCardProps[] = [
        {
            title: "Tasks",
            description: "Total Tasks",
            value: "125",
            trend: "up",
            badgeValue: "+12.5%",
            footerTitle: "Pending Tasks",
            footerSubtitle: "11",
        },
        {
            title: "Clients",
            description: "Total Chats",
            value: "1,234",
            trend: "up",
            badgeValue: "20%",
            footerTitle: "Total Chats",
            footerSubtitle: "2234",
        },
        {
            title: "Marketing Funnels",
            description: "Total Marketing Funnels",
            value: "45",
            trend: "up",
            badgeValue: "+12.5%",
            footerTitle: "Active Funnels",
            footerSubtitle: "20",
        },
        {
            title: "Meetings",
            description: "Total Meetings",
            value: "43",
            trend: "up",
            badgeValue: "4.5%",
            footerTitle: "Today Meetings with clients",
            footerSubtitle: "0",
        },
    ];

    const pendingTasks: any[] = [
        {
            id: 1
        },
        {
            id: 1
        },
        {
            id: 1
        },
        {
            id: 1
        },
        {
            id: 1
        },
        {
            id: 1
        },
        {
            id: 1
        }
    ]

    return (
        <>
            <DashboardCardsSection stats={stats} />
            <div className="flex w-full gap-4 px-4 lg:px-6">
                <div className="w-1/2">
                    <section className="border p-3 rounded">
                        <h3 className="mb-2 font-semibold tracking-tight">Tasks</h3>
                        <Tabs defaultValue="pending-tasks" className="w-full">
                            <TabsList className="w-full flex border-b">
                                <TabsTrigger value="pending-tasks" className="flex-1 text-center px-6 py-4 font-medium">
                                    Pending Tasks {(0)}
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
                                                <TableHead>Status</TableHead>
                                                <TableHead>Task Added</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pendingTasks.length > 0 ? (
                                                pendingTasks.map((task, idx) => (
                                                    <TableRow key={task.id}>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{idx + 1}</TableCell>
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
                                                <TableHead>Status</TableHead>
                                                <TableHead>Task Added</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pendingTasks.length > 0 ? (
                                                pendingTasks.map((task, idx) => (
                                                    <TableRow key={task.id}>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{idx + 1}</TableCell>
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
                        </Tabs>
                    </section>
                </div>
                <div className="w-1/2">
                    <section className="border p-3 rounded">
                        <h3 className="mb-2 font-semibold tracking-tight">Meetings</h3>
                        <Tabs defaultValue="pending-tasks" className="w-full">
                            <TabsList className="w-full flex border-b">
                                <TabsTrigger value="pending-tasks" className="flex-1 text-center px-6 py-4 font-medium">
                                    Today Meetings {(0)}
                                </TabsTrigger>
                                <TabsTrigger value="latest-tasks" className="flex-1 text-center px-6 py-4 ont-medium">
                                    Upcoming Meetings
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="pending-tasks" className="mt-2">
                                <div className="rounded-md border bg-card shadow-sm">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Shop Name</TableHead>
                                                <TableHead>Provided By</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Task Added</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pendingTasks.length > 0 ? (
                                                pendingTasks.map((task, idx) => (
                                                    <TableRow key={task.id}>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{idx + 1}</TableCell>
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
                                                <TableHead>Status</TableHead>
                                                <TableHead>Task Added</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pendingTasks.length > 0 ? (
                                                pendingTasks.map((task, idx) => (
                                                    <TableRow key={task.id}>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{idx + 1}</TableCell>
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
                        </Tabs>
                    </section>
                </div>
            </div>
            {/* <DataTable data={data} /> */}
        </>
    );
};
