import { PrismaClient, UserRole, SubmissionStatus, EnrollmentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Classroom Informatika database...')

  // 1. Create Users (Teachers and Students)
  const adminPassword = await bcrypt.hash('admin123!@#', 12)
  const teacherPassword = await bcrypt.hash('teacher123', 12)
  const studentPassword = await bcrypt.hash('student123', 12)

  // Create admin record in Admin table for NextAuth
  await prisma.admin.upsert({
    where: { email: 'admin@smawahidiyah.edu' },
    update: { password: adminPassword },
    create: {
      email: 'admin@smawahidiyah.edu',
      password: adminPassword,
      name: 'Super Admin GEMA',
      role: 'SUPER_ADMIN'
    }
  })

  // Create Teacher/Admin in User table
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@smawahidiyah.edu' },
    update: {},
    create: {
      name: 'Pak Agus Hartono',
      email: 'teacher@smawahidiyah.edu',
      password: teacherPassword,
      role: UserRole.TEACHER,
    }
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@smawahidiyah.edu' },
    update: {},
    create: {
      name: 'Admin GEMA',
      email: 'admin@smawahidiyah.edu',
      password: teacherPassword,
      role: UserRole.ADMIN,
    }
  })

  // Create Students in User table
  const student1 = await prisma.user.upsert({
    where: { email: 'ahmad@student.smawahidiyah.edu' },
    update: {},
    create: {
      name: 'Ahmad Fahreza',
      email: 'ahmad@student.smawahidiyah.edu',
      password: studentPassword,
      role: UserRole.STUDENT,
    }
  })

  const student2 = await prisma.user.upsert({
    where: { email: 'siti@student.smawahidiyah.edu' },
    update: {},
    create: {
      name: 'Siti Nurhaliza',
      email: 'siti@student.smawahidiyah.edu',
      password: studentPassword,
      role: UserRole.STUDENT,
    }
  })

  const student3 = await prisma.user.upsert({
    where: { email: 'rizki@student.smawahidiyah.edu' },
    update: {},
    create: {
      name: 'Muhammad Rizki',
      email: 'rizki@student.smawahidiyah.edu',
      password: studentPassword,
      role: UserRole.STUDENT,
    }
  })

  // Create sample students in Student table
  await prisma.student.upsert({
    where: { studentId: '2024001' },
    update: {},
    create: {
      studentId: '2024001',
      fullName: 'Ahmad Fahreza',
      email: 'ahmad.fahreza@student.smawahidiyah.edu',
      password: studentPassword,
      class: 'XI-A',
      phone: '08123456789',
      address: 'Jl. Raya Kediri No. 123',
      parentName: 'Bapak Ahmad Suryadi',
      parentPhone: '08123456790',
      status: 'active',
      isVerified: true
    }
  })

  await prisma.student.upsert({
    where: { studentId: '2024002' },
    update: {},
    create: {
      studentId: '2024002', 
      fullName: 'Siti Nurhaliza',
      email: 'siti.nurhaliza@student.smawahidiyah.edu',
      password: studentPassword,
      class: 'XI-A',
      phone: '08234567890',
      address: 'Jl. Masjid Agung No. 45',
      parentName: 'Ibu Siti Aminah',
      parentPhone: '08234567891',
      status: 'active',
      isVerified: true
    }
  })

  await prisma.student.upsert({
    where: { studentId: '2024003' },
    update: {},
    create: {
      studentId: '2024003',
      fullName: 'Muhammad Rizki',
      email: 'muhammad.rizki@student.smawahidiyah.edu', 
      password: studentPassword,
      class: 'XI-B',
      phone: '08345678901',
      address: 'Jl. Pondok Pesantren No. 67',
      parentName: 'Bapak Muhammad Yusuf',
      parentPhone: '08345678902',
      status: 'active',
      isVerified: true
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n📚 Sample Accounts:')
  console.log('👨‍💼 Admin (Admin table): admin@smawahidiyah.edu / admin123!@#')
  console.log('👨‍🏫 Teacher: teacher@smawahidiyah.edu / teacher123')
  console.log('👨‍🎓 Student 1: ahmad@student.smawahidiyah.edu / student123')
  console.log('👩‍🎓 Student 2: siti@student.smawahidiyah.edu / student123')
  console.log('👨‍🎓 Student 3: rizki@student.smawahidiyah.edu / student123')
  console.log('\n🏫 Student Table Accounts:')
  console.log('- NIS: 2024001, Password: student123 (Ahmad Fahreza - XI-A)')
  console.log('- NIS: 2024002, Password: student123 (Siti Nurhaliza - XI-A)')
  console.log('- NIS: 2024003, Password: student123 (Muhammad Rizki - XI-B)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })