import { prisma } from "~/lib/prisma.server";
import { useLoaderData, useSearchParams } from "react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export async function loader({ request }: any) {

    const url = new URL(request.url);

    const installPhase = url.searchParams.get("installPhase") || undefined;
    const followUpStatus = url.searchParams.get("followUpStatus") || undefined;
    const clientSuccessStatus = url.searchParams.get("clientSuccessStatus") || undefined;
    const followUpDateStart = url.searchParams.get("followUpDateStart");
    const followUpDateEnd = url.searchParams.get("followUpDateEnd");

    const where: any = {};

    if (installPhase) where.installPhase = installPhase;
    if (followUpStatus) where.followUpStep = followUpStatus;
    if (clientSuccessStatus) where.clientSuccessStatus = clientSuccessStatus;

    if (followUpDateStart && followUpDateEnd) {
        const start = new Date(followUpDateStart);
        const end = new Date(followUpDateEnd);
        end.setHours(23, 59, 59, 999);
        where.followUpDate = { gte: start, lt: end };
    }

    const funnels = await prisma.marketingFunnel.findMany({
        where,
        include: { client: true },
    });

    return { funnels };
}

export default function MarketingFunnelReportPage() {
    const { funnels } = useLoaderData<typeof loader>();
    const canView = true;
    // useEffect(() => {
    //     const fetchReport = async () => {
    //         const res = await fetch(`/api/reports/marketing-funnel?${searchParams.toString()}`);
    //         const data = await res.json();
    //         setFunnels(data);
    //     };
    //     fetchReport();
    // }, [searchParams.toString()]);

    return (
        <div className="px-6 space-y-2">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Marketing Funnels Report</h1>
            </div>
            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Shop URL</TableHead>
                            <TableHead>Install Phase</TableHead>
                            <TableHead>Follow-up Status</TableHead>
                            <TableHead>Follow-up Date</TableHead>
                            <TableHead>Client Success</TableHead>
                            <TableHead>Initial Feedback</TableHead>
                            <TableHead>Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            
                                canView ? (
                                    funnels.length > 0 ? (
                                        funnels.map((funnel: any, idx) => (
                                            <TableRow key={funnel.id}>
                                                <TableCell>{idx + 1}</TableCell>
                                                <TableCell>{funnel.client.shopDomain.split('.')[0]}</TableCell>
                                                <TableCell>{funnel.installPhase}</TableCell>
                                                <TableCell><Badge variant="outline">{funnel.followUpStep}</Badge></TableCell>
                                                <TableCell>{new Date(funnel.followUpDate).toLocaleDateString()}</TableCell>
                                                <TableCell><Badge variant="outline">{funnel.clientSuccessStatus == 'yes' ? 'Yes' : 'No'}</Badge></TableCell>

                                                <TableCell>{funnel.initialFeedback || 'N/A'}</TableCell>
                                                <TableCell>{new Date(funnel.createdAt).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-50 text-muted-foreground">
                                                No marketing funnels found.
                                            </TableCell>
                                        </TableRow>
                                    )
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9}>
                                            <div className="flex flex-col items-center justify-center py-50 text-yellow-600">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5" />
                                                    <span>You don’t have permission to view marketing funnels data.</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                        }
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
