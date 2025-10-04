import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../server-actions/get-current-user";
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
      <DashboardWidget title="Pendaftar" value={data.summary.applicants} trend={data.trends.applicants} />
      <DashboardWidget title="Kelas Aktif" value={data.summary.activeClasses} trend={data.trends.classes} />
      <DashboardWidget title="Tugas Tertunda" value={data.summary.pendingAssignments} trend={data.trends.assignments} />
      <div className="lg:col-span-3">
        <DashboardTable columns={data.columns} rows={data.rows} caption="Pendaftaran terbaru" />
      </div>
    </div>
  );
}

type DashboardWidgetProps = {
  title: string;
  value: number;
  trend: number;
};

function DashboardWidget({ title, value, trend }: DashboardWidgetProps) {
  const trendColor = trend >= 0 ? "text-emerald-600" : "text-rose-600";
  const trendLabel = trend >= 0 ? `+${trend}%` : `${trend}%`;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-card-foreground">{value}</p>
      <p className={`mt-2 text-sm font-medium ${trendColor}`}>{trendLabel} dibanding minggu lalu</p>
    </div>
  );
}

type DashboardTableProps = {
  columns: { header: string; accessorKey: string }[];
  rows: Record<string, unknown>[];
  caption?: string;
};

function DashboardTable({ columns, rows, caption }: DashboardTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <table className="min-w-full divide-y divide-border text-left">
        {caption ? (
          <caption className="px-6 py-4 text-left text-base font-semibold text-card-foreground">
            {caption}
          </caption>
        ) : null}
        <thead className="bg-muted/50">
          <tr>
            {columns.map((column) => (
              <th key={column.accessorKey} scope="col" className="px-6 py-3 text-sm font-semibold text-muted-foreground">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-muted-foreground">
                Belum ada data pendaftaran terbaru.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index} className="hover:bg-muted/40">
                {columns.map((column) => (
                  <td key={column.accessorKey} className="px-6 py-4 text-sm text-card-foreground">
                    {String(row[column.accessorKey] ?? "-")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
