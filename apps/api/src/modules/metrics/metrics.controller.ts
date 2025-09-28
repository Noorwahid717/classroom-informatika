import { Controller, Get, Headers, UseGuards } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { env } from "@classroom/config/env";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";

@Controller()
export class MetricsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("stats")
  async stats(@Headers("x-api-key") apiKey: string | undefined) {
    if (apiKey !== env.INTERNAL_API_KEY) {
      return [];
    }
    const [students, classes, assignments, mentors] = await Promise.all([
      this.prisma.user.count({ where: { role: "STUDENT" } }),
      this.prisma.classroom.count({ where: { endsAt: { gte: new Date() } } }),
      this.prisma.assignment.count(),
      this.prisma.user.count({ where: { role: "MENTOR" } })
    ]);
    return [
      { label: "Peserta", value: students },
      { label: "Kelas Aktif", value: classes },
      { label: "Tugas", value: assignments },
      { label: "Mentor", value: mentors }
    ];
  }

  @UseGuards(JwtAuthGuard)
  @Get("admin/dashboard")
  async dashboard() {
    const [latestRegistrations, summary] = await Promise.all([
      this.prisma.registration.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, status: true, createdAt: true }
      }),
      this.prisma.registration.aggregate({
        _count: true
      })
    ]);
    const activeClasses = await this.prisma.classroom.count({ where: { endsAt: { gte: new Date() } } });
    const pendingAssignments = await this.prisma.assignment.count({ where: { dueAt: { gte: new Date() } } });
    return {
      summary: {
        applicants: summary._count?._all ?? 0,
        activeClasses,
        pendingAssignments
      },
      trends: {
        applicants: 12.5,
        classes: 5.4,
        assignments: -3.2
      },
      columns: [
        { header: "Nama", accessorKey: "name" },
        { header: "Email", accessorKey: "email" },
        { header: "Status", accessorKey: "status" },
        { header: "Tanggal", accessorKey: "createdAt" }
      ],
      rows: latestRegistrations
    };
  }
}
