import { PrismaClient, UserRole, SubmissionStatus, EnrollmentStatus } from '@prisma/client'import { PrismaClient, UserRole, SubmissionStatus, EnrollmentStatus } from '@prisma/client'import { PrismaClient, UserRole, SubmissionStatus, EnrollmentStatus } from '@prisma/client'import { PrismaClient } from '@prisma/client'

import bcrypt from 'bcryptjs'

import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

import bcrypt from 'bcryptjs'import bcrypt from 'bcryptjs'

async function main() {

  console.log('🌱 Seeding Classroom Informatika database...')const prisma = new PrismaClient()



  // 1. Create Usersimport { seedPortfolio } from './seed-portfolio'

  const password = await bcrypt.hash('teacher123', 12)

async function main() {

  const teacher = await prisma.user.upsert({

    where: { email: 'teacher@smawahidiyah.edu' },  console.log('🌱 Seeding Classroom Informatika database...')const prisma = new PrismaClient()

    update: {},

    create: {

      name: 'Pak Agus Hartono',

      email: 'teacher@smawahidiyah.edu',  // 1. Create Users (Teachers and Students)const prisma = new PrismaClient()

      password: password,

      role: UserRole.TEACHER,  const teacherPassword = await bcrypt.hash('teacher123', 12)

    }

  })  const studentPassword = await bcrypt.hash('student123', 12)async function main() {



  const student1 = await prisma.user.upsert({

    where: { email: 'ahmad@student.smawahidiyah.edu' },

    update: {},  // Create Teacher/Admin  console.log('🌱 Seeding Classroom Informatika database...')async function main() {

    create: {

      name: 'Ahmad Fahreza',  const teacher = await prisma.user.upsert({

      email: 'ahmad@student.smawahidiyah.edu',

      password: password,    where: { email: 'teacher@smawahidiyah.edu' },  // Create admin users

      role: UserRole.STUDENT,

    }    update: {},

  })

    create: {  // 1. Create Users (Teachers and Students)  const hashedPassword = await bcrypt.hash('admin123', 12)

  // 2. Create Class

  const classInfo = await prisma.class.upsert({      name: 'Pak Agus Hartono',

    where: { code: 'INFO-XI-A-2025' },

    update: {},      email: 'teacher@smawahidiyah.edu',  const teacherPassword = await bcrypt.hash('teacher123', 12)  

    create: {

      name: 'Informatika XI-A',      password: teacherPassword,

      description: 'Kelas Informatika untuk siswa XI-A SMA Wahidiyah',

      code: 'INFO-XI-A-2025',      role: UserRole.TEACHER,  const studentPassword = await bcrypt.hash('student123', 12)  await prisma.admin.upsert({

      semester: 'Ganjil 2024/2025',

      year: '2024',    }

      ownerId: teacher.id,

    }  })    where: { email: 'admin@smawahidiyah.edu' },

  })



  // 3. Create Enrollment

  await prisma.enrollment.upsert({  const admin = await prisma.user.upsert({  // Create Teacher/Admin    update: {},

    where: { 

      userId_classId: {     where: { email: 'admin@smawahidiyah.edu' },

        userId: student1.id, 

        classId: classInfo.id     update: {},  const teacher = await prisma.user.upsert({    create: {

      }

    },    create: {

    update: {},

    create: {      name: 'Admin GEMA',    where: { email: 'teacher@smawahidiyah.edu' },      email: 'admin@smawahidiyah.edu',

      userId: student1.id,

      classId: classInfo.id,      email: 'admin@smawahidiyah.edu',

      status: EnrollmentStatus.ACTIVE,

    }      password: teacherPassword,    update: {},      password: hashedPassword,

  })

      role: UserRole.ADMIN,

  // 4. Create Assignment

  const assignment = await prisma.assignment.create({    }    create: {      name: 'Super Admin',

    data: {

      classId: classInfo.id,  })

      title: 'Portfolio Website Pribadi',

      description: 'Buat website portfolio menggunakan HTML, CSS, dan JavaScript',      name: 'Pak Agus Hartono',      role: 'SUPER_ADMIN'

      instructions: 'Upload file ZIP dengan index.html sebagai entry point',

      maxFileSize: 10 * 1024 * 1024,  // Create Students

      allowedFileTypes: '.html,.css,.js,.png,.jpg,.jpeg,.gif,.svg',

      isPublished: true,  const student1 = await prisma.user.upsert({      email: 'teacher@smawahidiyah.edu',    }

    }

  })    where: { email: 'ahmad@student.smawahidiyah.edu' },



  console.log('✅ Database seeded successfully!')    update: {},      password: teacherPassword,  })

  console.log('👨‍🏫 Teacher: teacher@smawahidiyah.edu / teacher123')

  console.log('👨‍🎓 Student: ahmad@student.smawahidiyah.edu / teacher123')    create: {

}

      name: 'Ahmad Fahreza',      role: UserRole.TEACHER,

main()

  .catch((e) => {      email: 'ahmad@student.smawahidiyah.edu',

    console.error(e)

    process.exit(1)      password: studentPassword,    }  await prisma.admin.upsert({

  })

  .finally(async () => {      role: UserRole.STUDENT,

    await prisma.$disconnect()

  })    }  })    where: { email: 'gema@smawahidiyah.edu' },

  })

    update: {},

  const student2 = await prisma.user.upsert({

    where: { email: 'siti@student.smawahidiyah.edu' },  const admin = await prisma.user.upsert({    create: {

    update: {},

    create: {    where: { email: 'admin@smawahidiyah.edu' },      email: 'gema@smawahidiyah.edu',

      name: 'Siti Nurhaliza',

      email: 'siti@student.smawahidiyah.edu',    update: {},      password: hashedPassword,

      password: studentPassword,

      role: UserRole.STUDENT,    create: {      name: 'GEMA Admin',

    }

  })      name: 'Admin GEMA',      role: 'ADMIN'



  const student3 = await prisma.user.upsert({      email: 'admin@smawahidiyah.edu',    }

    where: { email: 'rizki@student.smawahidiyah.edu' },

    update: {},      password: teacherPassword,  })

    create: {

      name: 'Muhammad Rizki',      role: UserRole.ADMIN,

      email: 'rizki@student.smawahidiyah.edu',

      password: studentPassword,    }  // Create sample announcements

      role: UserRole.STUDENT,

    }  })  await prisma.announcement.createMany({

  })

    data: [

  // 2. Create Classes

  const class1 = await prisma.class.upsert({  // Create Students      {

    where: { code: 'INFO-XI-A-2025' },

    update: {},  const student1 = await prisma.user.upsert({        title: 'Pendaftaran GEMA Batch 2025 Dibuka!',

    create: {

      name: 'Informatika XI-A',    where: { email: 'ahmad@student.smawahidiyah.edu' },        content: 'Hai calon santri teknologi! Pendaftaran untuk program GEMA tahun 2025 sudah dibuka. Buruan daftar sebelum kuota penuh!',

      description: 'Kelas Informatika untuk siswa XI-A SMA Wahidiyah',

      code: 'INFO-XI-A-2025',    update: {},        type: 'info'

      semester: 'Ganjil 2024/2025',

      year: '2024',    create: {      },

      ownerId: teacher.id,

    }      name: 'Ahmad Fahreza',      {

  })

      email: 'ahmad@student.smawahidiyah.edu',        title: 'Workshop Gratis: Introduction to AI',

  const class2 = await prisma.class.upsert({

    where: { code: 'INFO-XI-B-2025' },      password: studentPassword,        content: 'Ikuti workshop gratis tentang pengenalan Artificial Intelligence. Terbuka untuk semua siswa SMA Wahidiyah.',

    update: {},

    create: {      role: UserRole.STUDENT,        type: 'success'

      name: 'Informatika XI-B',

      description: 'Kelas Informatika untuk siswa XI-B SMA Wahidiyah',    }      },

      code: 'INFO-XI-B-2025',

      semester: 'Ganjil 2024/2025',  })      {

      year: '2024',

      ownerId: teacher.id,        title: 'Prestasi GEMA di Kompetisi Nasional',

    }

  })  const student2 = await prisma.user.upsert({        content: 'Selamat! Tim GEMA berhasil meraih juara 2 dalam kompetisi programming nasional. Bangga dengan pencapaian kalian!',



  // 3. Create Enrollments    where: { email: 'siti@student.smawahidiyah.edu' },        type: 'success'

  await prisma.enrollment.createMany({

    data: [    update: {},      }

      { userId: student1.id, classId: class1.id, status: EnrollmentStatus.ACTIVE },

      { userId: student2.id, classId: class1.id, status: EnrollmentStatus.ACTIVE },    create: {    ]

      { userId: student3.id, classId: class2.id, status: EnrollmentStatus.ACTIVE },

    ],      name: 'Siti Nurhaliza',  })

    skipDuplicates: true

  })      email: 'siti@student.smawahidiyah.edu',



  // 4. Create Assignments      password: studentPassword,  // Create sample activities

  const assignment1 = await prisma.assignment.create({

    data: {      role: UserRole.STUDENT,  await prisma.activity.createMany({

      classId: class1.id,

      title: 'Portfolio Website Pribadi',    }    data: [

      description: 'Buat website portfolio pribadi menggunakan HTML, CSS, dan JavaScript',

      instructions: 'Instruksi lengkap ada di dashboard kelas.',  })      {

      maxFileSize: 10 * 1024 * 1024, // 10MB

      allowedFileTypes: '.html,.css,.js,.png,.jpg,.jpeg,.gif,.svg,.woff,.woff2',        title: 'Workshop Web Development',

      rubric: {

        criteria: [  const student3 = await prisma.user.upsert({        description: 'Belajar membuat website modern dengan React dan Next.js dari dasar hingga deployment.',

          { name: 'Struktur HTML', weight: 25, maxScore: 25 },

          { name: 'Styling CSS', weight: 25, maxScore: 25 },    where: { email: 'rizki@student.smawahidiyah.edu' },        date: new Date('2024-12-15'),

          { name: 'JavaScript', weight: 25, maxScore: 25 },

          { name: 'Kreativitas', weight: 15, maxScore: 15 },    update: {},        location: 'Lab Komputer SMA Wahidiyah',

          { name: 'Kode Quality', weight: 10, maxScore: 10 }

        ]    create: {        capacity: 30,

      },

      dueDate: new Date('2024-10-31T23:59:00Z'),      name: 'Muhammad Rizki',        registered: 25

      isPublished: true,

    }      email: 'rizki@student.smawahidiyah.edu',      },

  })

      password: studentPassword,      {

  // 5. Create Sample Submissions

  const submission1 = await prisma.submission.create({      role: UserRole.STUDENT,        title: 'Coding Bootcamp Python',

    data: {

      assignmentId: assignment1.id,    }        description: 'Intensive bootcamp belajar Python untuk pemula dengan project-based learning.',

      userId: student1.id,

      status: SubmissionStatus.SUBMITTED,  })        date: new Date('2024-12-20'),

      submittedAt: new Date(),

      checkSummary: {        location: 'Aula SMA Wahidiyah',

        htmlhint: { issues: 2, warnings: 1 },

        eslint: { errors: 0, warnings: 3 },  // 2. Create Classes        capacity: 50,

        stylelint: { errors: 1, warnings: 2 }

      }  const class1 = await prisma.class.upsert({        registered: 45

    }

  })    where: { code: 'INFO-XI-A-2025' },      },



  // 6. Create Sample Grades    update: {},      {

  await prisma.grade.createMany({

    data: [    create: {        title: 'Kompetisi Mobile App Development',

      {

        submissionId: submission1.id,      name: 'Informatika XI-A',        description: 'Lomba pengembangan aplikasi mobile untuk tingkat SMA se-Jawa Timur.',

        gradedById: teacher.id,

        gradedUserId: student1.id,      description: 'Kelas Informatika untuk siswa XI-A SMA Wahidiyah',        date: new Date('2024-12-25'),

        criterion: 'Struktur HTML',

        score: 23,      code: 'INFO-XI-A-2025',        location: 'Gedung Serbaguna Kedunglo',

        maxScore: 25,

        feedback: 'HTML semantik bagus, perlu tambahan meta tags untuk SEO'      semester: 'Ganjil 2024/2025',        capacity: 100,

      },

      {      year: '2024',        registered: 80

        submissionId: submission1.id,

        gradedById: teacher.id,      ownerId: teacher.id,      }

        gradedUserId: student1.id,

        criterion: 'Styling CSS',    }    ]

        score: 24,

        maxScore: 25,  })  })

        feedback: 'Design responsif sempurna, consistent styling'

      }

    ]

  })  const class2 = await prisma.class.upsert({  // Create sample gallery items



  // 7. Create Sample Comments    where: { code: 'INFO-XI-B-2025' },  await prisma.gallery.createMany({

  await prisma.comment.createMany({

    data: [    update: {},    data: [

      {

        submissionId: submission1.id,    create: {      {

        userId: teacher.id,

        fileName: 'index.html',      name: 'Informatika XI-B',        title: 'Workshop Web Development 2024',

        lineNumber: 25,

        content: 'Tambahkan alt attribute untuk gambar ini untuk accessibility',      description: 'Kelas Informatika untuk siswa XI-B SMA Wahidiyah',        description: 'Antusiasme peserta dalam workshop web development',

      }

    ]      code: 'INFO-XI-B-2025',        imageUrl: '/images/gallery/workshop-1.jpg',

  })

      semester: 'Ganjil 2024/2025',        category: 'workshop'

  console.log('✅ Database seeded successfully!')

  console.log('\n📚 Sample Accounts:')      year: '2024',      },

  console.log('👨‍🏫 Teacher: teacher@smawahidiyah.edu / teacher123')

  console.log('👨‍💼 Admin: admin@smawahidiyah.edu / teacher123')      ownerId: teacher.id,      {

  console.log('👨‍🎓 Student 1: ahmad@student.smawahidiyah.edu / student123')

  console.log('👩‍🎓 Student 2: siti@student.smawahidiyah.edu / student123')    }        title: 'Tim GEMA Juara Kompetisi',

  console.log('👨‍🎓 Student 3: rizki@student.smawahidiyah.edu / student123')

}  })        description: 'Moment penyerahan trophy juara kompetisi',



main()        imageUrl: '/images/gallery/competition-1.jpg',

  .catch((e) => {

    console.error(e)  // 3. Create Enrollments        category: 'achievement'

    process.exit(1)

  })  await prisma.enrollment.createMany({      },

  .finally(async () => {

    await prisma.$disconnect()    data: [      {

  })
      { userId: student1.id, classId: class1.id, status: EnrollmentStatus.ACTIVE },        title: 'Kegiatan Coding Bootcamp',

      { userId: student2.id, classId: class1.id, status: EnrollmentStatus.ACTIVE },        description: 'Suasana seru coding bootcamp Python',

      { userId: student3.id, classId: class2.id, status: EnrollmentStatus.ACTIVE },        imageUrl: '/images/gallery/bootcamp-1.jpg',

    ],        category: 'bootcamp'

    skipDuplicates: true      },

  })      {

        title: 'Presentasi Project Final',

  // 4. Create Assignments        description: 'Siswa mempresentasikan project akhir',

  const assignment1 = await prisma.assignment.create({        imageUrl: '/images/gallery/presentation-1.jpg',

    data: {        category: 'project'

      classId: class1.id,      }

      title: 'Portfolio Website Pribadi',    ]

      description: 'Buat website portfolio pribadi menggunakan HTML, CSS, dan JavaScript',  })

      instructions: `

## Instruksi Tugas Portfolio Website  // Create sample students

  const studentPassword = await bcrypt.hash('student123', 12)

### Tujuan  

Membuat website portfolio pribadi yang menampilkan identitas dan karya kamu menggunakan teknologi web dasar.  await prisma.student.upsert({

    where: { studentId: '2024001' },

### Persyaratan Teknis    update: {},

1. **HTML**: Gunakan semantic HTML5 elements    create: {

2. **CSS**: Responsive design, minimal 2 breakpoints      studentId: '2024001',

3. **JavaScript**: Minimal 2 fitur interaktif      fullName: 'Ahmad Fahreza',

4. **File**: Upload dalam format ZIP dengan index.html sebagai entry point      email: 'ahmad.fahreza@student.smawahidiyah.edu',

      password: studentPassword,

### Kriteria Penilaian      class: 'XI-A',

- **Struktur HTML** (25%): Semantic, valid, organized      phone: '08123456789',

- **Styling CSS** (25%): Responsive, modern, consistent      address: 'Jl. Raya Kediri No. 123',

- **JavaScript** (25%): Functional, error-free      parentName: 'Bapak Ahmad Suryadi',

- **Kreativitas** (15%): Original design, user experience      parentPhone: '08123456790',

- **Kode Quality** (10%): Clean, documented, accessible      status: 'active',

      isVerified: true

### Deadline    }

Kamis, 31 Oktober 2024 - 23:59 WIB  })

      `,

      maxFileSize: 10 * 1024 * 1024, // 10MB  await prisma.student.upsert({

      allowedFileTypes: '.html,.css,.js,.png,.jpg,.jpeg,.gif,.svg,.woff,.woff2',    where: { studentId: '2024002' },

      rubric: {    update: {},

        criteria: [    create: {

          { name: 'Struktur HTML', weight: 25, maxScore: 25 },      studentId: '2024002', 

          { name: 'Styling CSS', weight: 25, maxScore: 25 },      fullName: 'Siti Nurhaliza',

          { name: 'JavaScript', weight: 25, maxScore: 25 },      email: 'siti.nurhaliza@student.smawahidiyah.edu',

          { name: 'Kreativitas', weight: 15, maxScore: 15 },      password: studentPassword,

          { name: 'Kode Quality', weight: 10, maxScore: 10 }      class: 'XI-A',

        ]      phone: '08234567890',

      },      address: 'Jl. Masjid Agung No. 45',

      dueDate: new Date('2024-10-31T23:59:00Z'),      parentName: 'Ibu Siti Aminah',

      isPublished: true,      parentPhone: '08234567891',

    }      status: 'active',

  })      isVerified: true

    }

  const assignment2 = await prisma.assignment.create({  })

    data: {

      classId: class2.id,  await prisma.student.upsert({

      title: 'Landing Page Responsif',    where: { studentId: '2024003' },

      description: 'Buat landing page responsif untuk produk atau jasa pilihan kamu',    update: {},

      instructions: `    create: {

## Instruksi Landing Page Responsif      studentId: '2024003',

      fullName: 'Muhammad Rizki',

### Tujuan      email: 'muhammad.rizki@student.smawahidiyah.edu', 

Membuat landing page yang responsif dan menarik untuk mempromosikan produk atau jasa.      password: studentPassword,

      class: 'XI-B',

### Persyaratan      phone: '08345678901',

1. **Mobile-first design**      address: 'Jl. Pondok Pesantren No. 67',

2. **CSS Grid atau Flexbox** untuk layout      parentName: 'Bapak Muhammad Yusuf',

3. **Form kontak** yang functional dengan JavaScript      parentPhone: '08345678902',

4. **Smooth scrolling** dan animasi CSS      status: 'active',

      isVerified: true

### Sections Wajib    }

- Hero section dengan CTA  })

- About/Features section  

- Testimonial section  console.log('Database seeded successfully!')

- Contact form  console.log('Sample Student Accounts:')

- Footer  console.log('- NIS: 2024001, Password: student123 (Ahmad Fahreza - XI-A)')

  console.log('- NIS: 2024002, Password: student123 (Siti Nurhaliza - XI-A)')

### Deadline  console.log('- NIS: 2024003, Password: student123 (Muhammad Rizki - XI-B)')

Jumat, 8 November 2024 - 23:59 WIB

      `,  // Seed portfolio assignment and sample submission snapshot

      maxFileSize: 15 * 1024 * 1024, // 15MB  await seedPortfolio(prisma)

      allowedFileTypes: '.html,.css,.js,.png,.jpg,.jpeg,.gif,.svg,.woff,.woff2,.mp4,.webm',}

      rubric: {

        criteria: [main()

          { name: 'Responsive Design', weight: 30, maxScore: 30 },  .catch((e) => {

          { name: 'UI/UX Design', weight: 25, maxScore: 25 },    console.error(e)

          { name: 'Functionality', weight: 25, maxScore: 25 },    process.exit(1)

          { name: 'Performance', weight: 20, maxScore: 20 }  })

        ]  .finally(async () => {

      },    await prisma.$disconnect()

      dueDate: new Date('2024-11-08T23:59:00Z'),  })

      isPublished: true,
    }
  })

  // 5. Create Sample Submissions
  const submission1 = await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      userId: student1.id,
      status: SubmissionStatus.SUBMITTED,
      submittedAt: new Date(),
      checkSummary: {
        htmlhint: { issues: 2, warnings: 1 },
        eslint: { errors: 0, warnings: 3 },
        stylelint: { errors: 1, warnings: 2 }
      }
    }
  })

  // 6. Create Sample Grades
  await prisma.grade.createMany({
    data: [
      {
        submissionId: submission1.id,
        gradedById: teacher.id,
        gradedUserId: student1.id,
        criterion: 'Struktur HTML',
        score: 23,
        maxScore: 25,
        feedback: 'HTML semantik bagus, perlu tambahan meta tags untuk SEO'
      },
      {
        submissionId: submission1.id,
        gradedById: teacher.id,
        gradedUserId: student1.id,
        criterion: 'Styling CSS',
        score: 24,
        maxScore: 25,
        feedback: 'Design responsif sempurna, consistent styling'
      },
      {
        submissionId: submission1.id,
        gradedById: teacher.id,
        gradedUserId: student1.id,
        criterion: 'JavaScript',
        score: 22,
        maxScore: 25,
        feedback: 'Fitur interaktif berfungsi, tambahkan error handling'
      },
      {
        submissionId: submission1.id,
        gradedById: teacher.id,
        gradedUserId: student1.id,
        criterion: 'Kreativitas',
        score: 14,
        maxScore: 15,
        feedback: 'Design original dan menarik'
      },
      {
        submissionId: submission1.id,
        gradedById: teacher.id,
        gradedUserId: student1.id,
        criterion: 'Kode Quality',
        score: 9,
        maxScore: 10,
        feedback: 'Kode bersih dan terdokumentasi dengan baik'
      }
    ]
  })

  // 7. Create Sample Comments
  await prisma.comment.createMany({
    data: [
      {
        submissionId: submission1.id,
        userId: teacher.id,
        fileName: 'index.html',
        lineNumber: 25,
        content: 'Tambahkan alt attribute untuk gambar ini untuk accessibility',
      },
      {
        submissionId: submission1.id,
        userId: teacher.id,
        fileName: 'style.css',
        lineNumber: 142,
        content: 'Gunakan rem unit instead of px untuk better scalability',
      },
      {
        submissionId: submission1.id,
        userId: student1.id,
        content: 'Terima kasih atas feedbacknya, Pak! Sudah saya perbaiki.',
      }
    ]
  })

  // 8. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: student1.id,
        action: 'upload_submission',
        resource: 'submission',
        resourceId: submission1.id,
        metadata: { fileName: 'portfolio.zip', fileSize: 2048576 }
      },
      {
        userId: teacher.id,
        action: 'grade_submission',
        resource: 'submission',
        resourceId: submission1.id,
        metadata: { totalScore: 92, maxScore: 100 }
      }
    ]
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n📚 Sample Accounts:')
  console.log('👨‍🏫 Teacher: teacher@smawahidiyah.edu / teacher123')
  console.log('👨‍💼 Admin: admin@smawahidiyah.edu / teacher123')
  console.log('👨‍🎓 Student 1: ahmad@student.smawahidiyah.edu / student123')
  console.log('👩‍🎓 Student 2: siti@student.smawahidiyah.edu / student123')
  console.log('👨‍🎓 Student 3: rizki@student.smawahidiyah.edu / student123')
  console.log('\n🏫 Classes:')
  console.log('📖 Informatika XI-A (Code: INFO-XI-A-2025)')
  console.log('📖 Informatika XI-B (Code: INFO-XI-B-2025)')
  console.log('\n📝 Assignments:')
  console.log('💻 Portfolio Website Pribadi (XI-A)')
  console.log('🌐 Landing Page Responsif (XI-B)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })