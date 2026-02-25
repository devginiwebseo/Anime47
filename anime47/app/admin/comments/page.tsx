import { Metadata } from 'next';
import { commentRepository } from '@/modules/comment/comment.repository';
import CommentManagement from '@/components/admin/comments/CommentManagement';

export const metadata: Metadata = {
    title: 'Quản lý Bình Luận - Admin Panel',
};

export default async function AdminCommentsPage(props: {
    searchParams?: Promise<{ page?: string; limit?: string }>;
}) {
    const searchParams = await props.searchParams;
    const page = searchParams?.page ? parseInt(searchParams.page) : 1;
    const limit = searchParams?.limit ? parseInt(searchParams.limit) : 20;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
        commentRepository.findAllForAdmin({ skip, take: limit }),
        commentRepository.countAll(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Quản lý Bình Luận</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Xem, duyệt và xóa các bình luận trên hệ thống.
                    </p>
                </div>
            </div>

            <CommentManagement
                initialComments={comments}
                currentPage={page}
                totalPages={totalPages}
            />
        </div>
    );
}
