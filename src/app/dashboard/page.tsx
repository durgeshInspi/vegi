import { redirect } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { getDashboardMetrics, type DashboardMetrics } from "@/modules/reports/report.service";
import { serializeMongo } from "@/lib/mongo-utils";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const metrics = await getDashboardMetrics();
  const serializedMetrics = serializeMongo<DashboardMetrics>(metrics);

  return (
    <AppLayout>
      <DashboardClient initialData={serializedMetrics} />
    </AppLayout>
  );
}
