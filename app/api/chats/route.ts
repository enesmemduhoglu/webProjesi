import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    const chats = await prisma.chat.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { prompt, response } = body;

    if (!prompt || !response) {
      return NextResponse.json(
        { message: "Prompt ve response gerekli" },
        { status: 400 }
      );
    }

    const chat = await prisma.chat.create({
      data: {
        prompt,
        response,
        userId: user.id,
      },
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error saving chat:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
} 