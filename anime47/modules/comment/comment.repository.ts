import { prisma } from '@/lib/prisma';

export class CommentRepository {
    // Lấy comments của một story
    async findByStoryId(storyId: string, limit: number = 50) {
        return prisma.comment.findMany({
            where: { storyId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    // Tạo comment mới
    async create(data: {
        storyId: string;
        author: string;
        content: string;
        userIp: string;
        rating?: number;
    }) {
        return prisma.comment.create({
            data,
        });
    }

    // Đếm số comments của story
    async countByStoryId(storyId: string): Promise<number> {
        return prisma.comment.count({
            where: { storyId },
        });
    }

    // Xóa comment
    async delete(id: string) {
        return prisma.comment.delete({
            where: { id },
        });
    }
}

export const commentRepository = new CommentRepository();
