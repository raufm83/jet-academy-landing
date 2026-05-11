import { dashboardHomePathForRole } from "@/lib/dashboard-home";
import { authOptions } from "@/utils/api/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  redirect(dashboardHomePathForRole(session?.user?.role));
}
