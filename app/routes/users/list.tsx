import { Link, useLoaderData, useNavigate } from "react-router";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { DataTable } from "@/components/tables/user-data-table";
import { prisma } from "~/lib/prisma.server";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 5);
    const search = url.searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search
        ? {
            OR: [
                { fullName: { contains: search } },
                { email: { contains: search } },
            ],
        }
        : {};

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                avatar: true,
                fullName: true,
                email: true,
                role: { select: { name: true, slug: true } },
                createdAt: true,
            },
        }),
        prisma.user.count({ where }),
    ]);

    return json({
        users,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            search,
        },
    });
}

export default function UsersList() {
    const { users, meta } = useLoaderData<typeof loader>();
    const navigate = useNavigate();

    function handlePageChange(newPage: number) {
        const params = new URLSearchParams(window.location.search);
        params.set("page", newPage.toString());
        navigate(`?${params.toString()}`);
    }

    function handleSearch(value: string) {
        const params = new URLSearchParams(window.location.search);
        params.set("search", value);
        params.set("page", "1");
        navigate(`?${params.toString()}`);
    }

    return (
        <div className="px-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Users</h1>

                <Button
                    asChild
                    className="gap-2"
                >
                    <Link to="/users/create">
                        <Plus className="h-4 w-4" />
                        Add User
                    </Link>
                </Button>
            </div>
            <DataTable
                data={users}
                meta={meta}
                onPageChange={handlePageChange}
                onSearch={handleSearch}
            />
        </div>
    );
}
