import { Link, useLoaderData, useNavigate } from "react-router";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { DataTable } from "@/components/tables/user-data-table";
import { Button } from "~/components/ui/button";
import { prisma } from "~/lib/prisma.server";
import { Plus } from "lucide-react";
import { lazy } from "react";

export async function loader({ request }: LoaderFunctionArgs) {

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);
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
                createdAt: true,
                role: {
                    select: { name: true, slug: true },
                },
                modulePermissions: {
                    where: { isDeleted: false },
                    select: {
                        module: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                        permission: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
        }),

        prisma.user.count({ where }),
    ])

    const formattedUsers = users.map(user => {
        const modulesMap: Record<string, { name: string; permissions: string[] }> = {}

        user.modulePermissions.forEach(mp => {
            const moduleName = mp.module.name
            if (!modulesMap[moduleName]) {
                modulesMap[moduleName] = { name: moduleName, permissions: [] }
            }
            modulesMap[moduleName].permissions.push(mp.permission.name)
        })

        return {
            ...user,
            modules: Object.values(modulesMap),
        }
    })


    return json({
        users: formattedUsers,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            search,
        },
    });
}

export const meta = () => [{ title: "Users List | InkyBay" }];

export default function UsersList() {

    const { users, meta } = useLoaderData<typeof loader>();
    const navigate = useNavigate();

    function handlePageChange(newPage: number) {
        const params = new URLSearchParams(window.location.search);
        params.set("page", newPage.toString());
        navigate(`?${params.toString()}`);
    }

    const handleLimitChange = (newLimit: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("limit", newLimit.toString());
        params.set("page", "1"); // reset to first page
        navigate(`?${params.toString()}`);
    };

    function handleSearch(value: string) {
        const params = new URLSearchParams(window.location.search);
        params.set("search", value);
        params.set("page", "1");
        navigate(`?${params.toString()}`);
    }

    return (
        <div className="px-6 space-y-2">
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
                handleLimitChange={handleLimitChange}
            />
        </div>
    );
}
