import { ratingRepository } from './rating.repository';

export class RatingService {
    // Thêm hoặc update rating
    async addRating(storyId: string, userIp: string, score: number) {
        // Validate score (1-10)
        if (score < 1 || score > 10) {
            throw new Error('Rating score must be between 1 and 10');
        }

        const rating = await ratingRepository.upsert(storyId, userIp, score);

        // Tính lại rating trung bình và cập nhật vào story
        const avgRating = await ratingRepository.calculateAverageRating(storyId);
        if (avgRating !== null) {
            await this.updateStoryRating(storyId, avgRating);
        }

        return rating;
    }

    // Lấy rating của user cho một story
    async getUserRating(storyId: string, userIp: string) {
        return ratingRepository.findByStoryAndIp(storyId, userIp);
    }

    // Lấy thông tin rating của story
    async getStoryRatingInfo(storyId: string) {
        const [avgRating, totalRatings] = await Promise.all([
            ratingRepository.calculateAverageRating(storyId),
            ratingRepository.countByStoryId(storyId),
        ]);

        return {
            averageRating: avgRating ? Number(avgRating.toFixed(1)) : 0,
            totalRatings,
        };
    }

    // Cập nhật rating vào bảng story
    private async updateStoryRating(storyId: string, rating: number) {
        const { prisma } = await import('@/lib/prisma');
        return prisma.story.update({
            where: { id: storyId },
            data: { rating: Number(rating.toFixed(1)) },
        });
    }
}

export const ratingService = new RatingService();
