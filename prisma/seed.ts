import {
  EnrollmentRole,
  EnrollmentStatus,
  PrismaClient,
  SubmissionStatus,
  UserRole,
} from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding Classroom Informatika database…")

  const adminPassword = await bcrypt.hash("admin123!@#", 12)
  const teacherPassword = await bcrypt.hash("teacher123", 12)
  const studentPassword = await bcrypt.hash("student123", 12)

  await prisma.admin.upsert({
    where: { email: "admin@smawahidiyah.edu" },
    update: {
      password: adminPassword,
      name: "Super Admin GEMA",
      role: "SUPER_ADMIN",
    },
    create: {
      email: "admin@smawahidiyah.edu",
      password: adminPassword,
      name: "Super Admin GEMA",
      role: "SUPER_ADMIN",
    },
  })

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@smawahidiyah.edu" },
    update: {},
    create: {
      name: "Pak Agus Hartono",
      email: "teacher@smawahidiyah.edu",
      password: teacherPassword,
      role: UserRole.TEACHER,
    },
  })

  await prisma.user.upsert({
    where: { email: "admin@smawahidiyah.edu" },
    update: {},
    create: {
      name: "Admin GEMA",
      email: "admin@smawahidiyah.edu",
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  })

  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: "ahmad@student.smawahidiyah.edu" },
      update: {},
      create: {
        name: "Ahmad Fahreza",
        email: "ahmad@student.smawahidiyah.edu",
        password: studentPassword,
        role: UserRole.STUDENT,
      },
    }),
    prisma.user.upsert({
      where: { email: "siti@student.smawahidiyah.edu" },
      update: {},
      create: {
        name: "Siti Nurhaliza",
        email: "siti@student.smawahidiyah.edu",
        password: studentPassword,
        role: UserRole.STUDENT,
      },
    }),
  ])

  const [student1, student2] = students

  const classInfo = await prisma.class.upsert({
    where: { code: "INFO-XI-A-2025" },
    update: {
      description: "Kelas Informatika untuk siswa XI-A SMA Wahidiyah",
      isActive: true,
      ownerId: teacher.id,
    },
    create: {
      name: "Informatika XI-A",
      description: "Kelas Informatika untuk siswa XI-A SMA Wahidiyah",
      code: "INFO-XI-A-2025",
      semester: "Ganjil 2024/2025",
      year: "2024",
      ownerId: teacher.id,
    },
  })

  await prisma.enrollment.upsert({
    where: {
      userId_classId: {
        userId: teacher.id,
        classId: classInfo.id,
      },
    },
    update: {},
    create: {
      userId: teacher.id,
      classId: classInfo.id,
      role: EnrollmentRole.TEACHER_ASSISTANT,
      status: EnrollmentStatus.ACTIVE,
    },
  })

  await Promise.all(
    [student1, student2].map((student) =>
      prisma.enrollment.upsert({
        where: {
          userId_classId: {
            userId: student.id,
            classId: classInfo.id,
          },
        },
        update: {},
        create: {
          userId: student.id,
          classId: classInfo.id,
          role: EnrollmentRole.STUDENT,
          status: EnrollmentStatus.ACTIVE,
        },
      }),
    ),
  )

  const assignment = await prisma.assignment.upsert({
    where: { id: "portfolio-assignment" },
    update: {},
    create: {
      id: "portfolio-assignment",
      classId: classInfo.id,
      title: "Portfolio Website Pribadi",
      description:
        "Buat website portfolio menggunakan HTML, CSS, dan JavaScript.",
      instructions:
        "Upload file ZIP dengan index.html sebagai entry point dan pastikan seluruh aset tersusun rapi.",
      maxFileSize: 10 * 1024 * 1024,
      allowedFileTypes: ".html,.css,.js,.png,.jpg,.jpeg,.gif,.svg",
      isPublished: true,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.submission.upsert({
    where: {
      assignmentId_userId: {
        assignmentId: assignment.id,
        userId: student1.id,
      },
    },
    update: {
      status: SubmissionStatus.SUBMITTED,
      submittedAt: new Date(),
      previewPath: "/previews/ahmad-portfolio/index.html",
    },
    create: {
      assignmentId: assignment.id,
      userId: student1.id,
      status: SubmissionStatus.SUBMITTED,
      submittedAt: new Date(),
      previewPath: "/previews/ahmad-portfolio/index.html",
      zipPath: "/uploads/ahmad-portfolio.zip",
      zipSize: 1024 * 120,
    },
  })

  await prisma.submission.upsert({
    where: {
      assignmentId_userId: {
        assignmentId: assignment.id,
        userId: student2.id,
      },
    },
    update: {
      status: SubmissionStatus.DRAFT,
    },
    create: {
      assignmentId: assignment.id,
      userId: student2.id,
      status: SubmissionStatus.DRAFT,
    },
  })

  console.log("✅ Database seeded successfully!")
  console.log("👨‍💼 Admin (Admin table): admin@smawahidiyah.edu / admin123!@#")
  console.log("👨‍🏫 Teacher: teacher@smawahidiyah.edu / teacher123")
  console.log("👨‍🎓 Student 1: ahmad@student.smawahidiyah.edu / student123")
  console.log("👩‍🎓 Student 2: siti@student.smawahidiyah.edu / student123")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
