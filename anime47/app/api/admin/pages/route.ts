import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        // Option to check roles if needed

        const body = await req.json();
        const { title, slug, content, isPublished, metaTitle, metaDescription } = body;

        if (!title || !slug || !content) {
            return NextResponse.json({ success: false, message: 'Thiếu trường bắt buộc' }, { status: 400 });
        }

        const existingPage = await prisma.pages.findUnique({
            where: { slug }
        });

        if (existingPage) {
            return NextResponse.json({ success: false, message: 'Đường dẫn (slug) đã tồn tại' }, { status: 400 });
        }

        const newPage = await prisma.pages.create({
            data: {
                title,
                slug,
                content,
                isPublished,
                metaTitle,
                metaDescription
            }
        });

        return NextResponse.json({ success: true, data: newPage });
    } catch (error) {
        console.error('Error creating page:', error);
        return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
    }
}
