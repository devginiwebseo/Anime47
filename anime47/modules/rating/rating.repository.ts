import { prisma } from '@/lib/prisma';

export class RatingRepository {
    // Lấy tất cả ratings của một story
    async findByStoryId(storyId: string) {
        return prisma.rating.findMany({
            where: { storyId },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Lấy rating của user (theo IP) cho một story
    async findByStoryAndIp(storyId: string, userIp: string) {
        return prisma.rating.findUnique({
            where: {
                storyId_userIp: {
                    storyId,
                    userIp,
                },
            },
        });
    }

    // Tạo hoặc update rating
    async upsert(storyId: string, userIp: string, score: number) {
        return prisma.rating.upsert({
            where: {
                storyId_userIp: {
                    storyId,
                    userIp,
                },
            },
            create: {
                storyId,
                userIp,
                score,
            },
            update: {
                score,
                updatedAt: new Date(),
            },
        });
    }

    // Tính rating trung bình của một story
    async calculateAverageRating(storyId: string): Promise<number | null> {
        const result = await prisma.rating.aggregate({
            where: { storyId },
            _avg: { score: true },
            _count: true,
        });

        return result._count > 0 ? result._avg.score : null;
    }

    // Đếm số lượng ratings của một story
    async countByStoryId(storyId: string): Promise<number> {
        return prisma.rating.count({
            where: { storyId },
        });
    }

    // Xóa rating
    async delete(id: string) {
        return prisma.rating.delete({
            where: { id },
        });
    }
}

export const ratingRepository = new RatingRepository();
