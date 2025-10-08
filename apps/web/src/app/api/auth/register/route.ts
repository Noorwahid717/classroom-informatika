import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      studentId,
      fullName,
      email,
      password,
      class: studentClass,
      phone,
      address,
      parentName,
      parentPhone,
      userType
    } = body

    // Validate required fields
    if (!studentId || !fullName || !email || !password) {
      return NextResponse.json(
        { message: 'NIS, nama lengkap, email, dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Validate user type
    if (userType !== 'student') {
      return NextResponse.json(
        { message: 'Invalid user type' },
        { status: 400 }
      )
    }

    // Check if student ID already exists
    const existingStudentId = await prisma.student.findUnique({
      where: { studentId }
    })

    if (existingStudentId) {
      return NextResponse.json(
        { message: 'NIS sudah terdaftar. Gunakan NIS yang berbeda.' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.student.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar. Gunakan email yang berbeda.' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new student
    const student = await prisma.student.create({
      data: {
        studentId,
        fullName,
        email,
        password: hashedPassword,
        class: studentClass,
        phone,
        address,
        parentName,
        parentPhone,
        status: 'active',
        isVerified: true // For now, auto-verify. Later can add email verification
      }
    })

    // Remove password from response
    const { password: _, ...studentWithoutPassword } = student

    return NextResponse.json({
      message: 'Registrasi berhasil! Selamat datang di GEMA.',
      student: studentWithoutPassword
    }, { status: 201 })

  } catch (error) {
    console.error('Student registration error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}