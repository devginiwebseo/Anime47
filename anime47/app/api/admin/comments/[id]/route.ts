import { NextRequest, NextResponse } from 'next/server';
import { commentRepository } from '@/modules/comment/comment.repository';

// Lấy authOptions, nhưng middleware đã bảo vệ route này rồi với role="ADMIN"

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // in Next.js 15, params is a promise
) {
    try {
        const params = await context.params;
        const id = params.id;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Missing status' }, { status: 400 });
        }

        const updatedComment = await commentRepository.updateStatus(id, status);

        return NextResponse.json({ success: true, comment: updatedComment });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Lỗi khi cập nhật trạng thái' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const id = params.id;

        await commentRepository.delete(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Lỗi khi xóa bình luận' },
            { status: 500 }
        );
    }
}
