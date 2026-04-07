import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession();
        // check role if needed...

        const { id } = await params;
        const body = await req.json();
        const { title, slug, content, isPublished, metaTitle, metaDescription } = body;

        const existingPage = await prisma.pages.findUnique({
            where: { slug }
        });

        if (existingPage && existingPage.id !== id) {
            return NextResponse.json({ success: false, message: 'Đường dẫn (slug) đã tồn tại cho trang khác' }, { status: 400 });
        }

        const updatedPage = await prisma.pages.update({
            where: { id },
            data: { title, slug, content, isPublished, metaTitle, metaDescription }
        });

        return NextResponse.json({ success: true, data: updatedPage });
    } catch (error) {
        console.error('Error updating page:', error);
        return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession();
        
        const { id } = await params;
        await prisma.pages.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting page:', error);
        return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
    }
}
