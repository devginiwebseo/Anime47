import { prisma } from '@/lib/prisma';

export class CommentRepository {
    // Lấy comments của một story
    async findByStoryId(storyId: string, limit: number = 50, userIp?: string, pendingIds?: string[]) {
        return prisma.comments.findMany({
            where: { 
                storyId,
                OR: [
                    { status: 'APPROVED' },
                    ...(pendingIds && pendingIds.length > 0 ? [{ id: { in: pendingIds } }] : [])
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    // Tạo comment mới
    async create(data: {
        storyId: string;
        author: string;
        email?: string;
        content: string;
        userIp: string;
        rating?: number;
    }) {
        return prisma.comments.create({
            data: {
                ...data,
                status: "PENDING", // Mặc định là PENDING
            },
        });
    }

    // Đếm số comments của story
    async countByStoryId(storyId: string): Promise<number> {
        return prisma.comments.count({
            where: { storyId },
        });
    }

    // Lấy TẤT CẢ comments cho admin
    async findAllForAdmin(options: { skip?: number; take?: number } = {}) {
        return prisma.comments.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                stories: {
                    select: { id: true, title: true, slug: true }
                }
            },
            ...options
        });
    }

    // Đếm tổng số comment cho admin
    async countAll(): Promise<number> {
        return prisma.comments.count();
    }

    // Xóa comment
    async delete(id: string) {
        return prisma.comments.delete({
            where: { id },
        });
    }

    // Cập nhật trạng thái comment
    async updateStatus(id: string, status: string) {
        return prisma.comments.update({
            where: { id },
            data: { status }
        });
    }
}

export const commentRepository = new CommentRepository();
