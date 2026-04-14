import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Vui lòng nhập đầy đủ thông tin" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Email này đã được đăng ký" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "USER"
            },
        });

        return NextResponse.json(
            { message: "Đăng ký thành công", user: { id: user.id, name: user.name, email: user.email } },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("REGISTRATION_ERROR", error);
        return NextResponse.json(
            { message: "Có lỗi xảy ra trong quá trình đăng ký" },
            { status: 500 }
        );
    }
}
