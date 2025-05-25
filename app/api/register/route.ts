import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Tüm alanları doldurun" },
        { status: 400 }
      );
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Geçerli bir email adresi girin" },
        { status: 400 }
      );
    }

    // Şifre uzunluğunu kontrol et
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Şifre en az 6 karakter olmalıdır" },
        { status: 400 }
      );
    }

    // Email'in benzersiz olduğunu kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Bu email adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 12);

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "Kullanıcı başarıyla oluşturuldu" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
} 