
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RequestActions } from "@/components/admin/RequestActions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AccessRequestsPage() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        redirect("/");
    }

    const requests = await prisma.courseAccessRequest.findMany({
        where: { status: "PENDING" },
        include: {
            user: true,
            course: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="container mx-auto py-32">
            <Card>
                <CardHeader>
                    <CardTitle>Course Access Requests</CardTitle>
                    <CardDescription>Review and manage 30-day free access requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500">
                            No pending requests found.
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{request.user.name || "Unknown User"}</span>
                                                    <span className="text-xs text-zinc-500">{request.user.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{request.course.title}</TableCell>
                                            <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                                                    {request.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <RequestActions requestId={request.id} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
