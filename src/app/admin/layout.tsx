import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Protect all /admin routes
    if (!session || session.user?.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="pt-16 min-h-screen bg-black">
            {children}
        </div>
    );
}
