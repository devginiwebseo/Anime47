import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });
        }

        const body = await req.json();
        const { name, currentPassword, newPassword } = body;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
        }

        const updates: any = {};
        if (name && name.trim() !== '') {
            updates.name = name.trim();
        }

        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: "Vui lòng nhập mật khẩu hiện tại" }, { status: 400 });
            }

            const isValid = await bcrypt.compare(currentPassword, user.password || "");
            if (!isValid) {
                return NextResponse.json({ error: "Mật khẩu hiện tại không đúng" }, { status: 400 });
            }

            updates.password = await bcrypt.hash(newPassword, 10);
        }

        if (Object.keys(updates).length > 0) {
            await prisma.user.update({
                where: { email: session.user.email },
                data: updates,
            });
        }

        return NextResponse.json({ success: true, message: "Cập nhật thông tin thành công" });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
    }
}
