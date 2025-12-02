import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DashboardCardsSection } from "~/components/dashboard-cards-section";
import { Badge } from "~/components/ui/badge";
import { useFetcher } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { Spinner } from "~/components/ui/spinner";
import { CenterSpinner } from "~/components/ui/center-spinner";

const ViewTaskDetailsModal = lazy(() =>
    import("~/components/modals/view-task-modal").then((m) => ({ default: m.ViewTaskDetailsModal }))
);

const ViewMeetingDetailsModal = lazy(() =>
    import("~/components/modals/view-meeting-modal").then((m) => ({ default: m.ViewMeetingDetailsModal }))
);

export const meta = () => [{ title: "Dashboard | InkyBay" }];

export default function DashboardPage() {

    const fetcher = useFetcher();
    const [selectedTaskId, setSelectedTaskId] = useState<any | null>(null);
    const [viewTaskModalOpen, setViewTaskModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
    const [viewMeetingModalOpen, setViewMeetingModalOpen] = useState(false);

    useEffect(() => {
        fetcher.submit({}, { method: "post", action: "/api/dashboard" });
    }, []);

    const data = fetcher.data;

    if (!data) {
        return (
            <div className="flex items-center justify-center h-[80vh] text-muted-foreground text-lg">
                <Spinner />
            </div>
        )
    }

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
                                                <TableHead>Store URL</TableHead>
                                                <TableHead>Provided By</TableHead>
                                                <TableHead>Task Added</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pendingTasks.length > 0 ? (
                                                pendingTasks.map((task: any, idx: number) => (
                                                    <TableRow
                                                        key={task.id}
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedTaskId(task.id);
                                                            setViewTaskModalOpen(true);
                                                        }}
                                                    >
                                                        <TableCell className="text-blue-500 hover:underline">{task.client.shopDomain}</TableCell>
                                                        <TableCell>{task.providedByUser.fullName}</TableCell>
                                                        <TableCell>{task.taskAddedDate ? new Date(task.taskAddedDate).toLocaleDateString() : '-'}</TableCell>
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
                                                <TableHead>Store URL</TableHead>
                                                <TableHead>Provided By</TableHead>
                                                <TableHead>Task Added</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {latestTasks.length > 0 ? (
                                                latestTasks.map((task: any, idx: number) => (
                                                    <TableRow
                                                        key={task.id}
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedTaskId(task.id);
                                                            setViewTaskModalOpen(true);
                                                        }}
                                                    >
                                                        <TableCell>{task.client.shopDomain}</TableCell>
                                                        <TableCell>{task.providedByUser.fullName}</TableCell>
                                                        <TableCell>{task.taskAddedDate
                                                            ? new Date(task.taskAddedDate).toLocaleDateString()
                                                            : "—"}</TableCell>
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
                                                    <TableRow
                                                        key={idx}
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedMeeting(meeting);
                                                            setViewMeetingModalOpen(true);
                                                        }}
                                                    >
                                                        <TableCell className="cursor-pointer hover:underline text-blue-500">{meeting.storeUrl}</TableCell>
                                                        <TableCell>{meeting.user.fullName}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {meeting.joiningStatus ? 'Yes' : 'No'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{meeting.meetingDateTime ? new Date(meeting.meetingDateTime).toLocaleString() : "—"}</TableCell>
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
                                                    <TableRow
                                                        key={meeting.id}
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedMeeting(meeting);
                                                            setViewMeetingModalOpen(true);
                                                        }}
                                                    >
                                                        <TableCell className="cursor-pointer hover:underline text-blue-500">{meeting.storeUrl}</TableCell>
                                                        <TableCell>{meeting.user.fullName}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {meeting.joiningStatus ? 'Yes' : 'No'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{meeting.meetingDateTime ? new Date(meeting.meetingDateTime).toLocaleString() : '-'}</TableCell>
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

            {viewTaskModalOpen && selectedTaskId && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewTaskDetailsModal
                        taskId={selectedTaskId}
                        open={viewTaskModalOpen}
                        onOpenChange={setViewTaskModalOpen}
                    />
                </Suspense>
            )}

            {/* View Meeting Modal */}
            {viewMeetingModalOpen && selectedMeeting && (
                <Suspense fallback={<CenterSpinner />}>
                    <ViewMeetingDetailsModal
                        meeting={selectedMeeting}
                        open={viewMeetingModalOpen}
                        onOpenChange={setViewMeetingModalOpen}
                    />
                </Suspense>
            )}
        </>
    );
};
