import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../server-actions/get-current-user";
import { DataTable } from "@classroom/ui/data-table";
import { Widget } from "@classroom/ui/widget";
import { getDashboardData } from "../../../server-actions/get-dashboard-data";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/register");
  }

  return (
    <div className="space-y-8 p-10">
      <h1 className="text-3xl font-semibold">Dashboard Admin</h1>
      <Suspense fallback={<div>Memuat data dashboard...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

async function DashboardContent() {
  const data = await getDashboardData();
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Widget title="Pendaftar" value={data.summary.applicants} trend={data.trends.applicants} />
      <Widget title="Kelas Aktif" value={data.summary.activeClasses} trend={data.trends.classes} />
      <Widget title="Tugas Tertunda" value={data.summary.pendingAssignments} trend={data.trends.assignments} />
      <div className="lg:col-span-3">
        <DataTable columns={data.columns} data={data.rows} caption="Pendaftaran terbaru" />
      </div>
    </div>
  );
}
