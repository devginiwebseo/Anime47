import { commentRepository } from './comment.repository';
import { ratingService } from '@/modules/rating/rating.service';

export class CommentService {
    // Thêm comment mới
    async addComment(data: {
        storyId: string;
        author: string;
        email?: string;
        content: string;
        userIp: string;
        rating?: number;
    }) {
        // Validate
        if (!data.author.trim()) {
            throw new Error('Author name is required');
        }
        if (!data.content.trim()) {
            throw new Error('Comment content is required');
        }
        if (data.rating && (data.rating < 1 || data.rating > 5)) {
            throw new Error('Rating must be between 1 and 5');
        }

        const comment = await commentRepository.create(data);

        // Nếu có rating, thêm vào bảng ratings
        if (data.rating) {
            // Convert rating 1-5 sang 1-10
            const score = data.rating * 2;
            await ratingService.addRating(data.storyId, data.userIp, score);
        }

        return comment;
    }

    // Lấy comments của story
    async getStoryComments(storyId: string, limit?: number, userIp?: string, pendingIds?: string[]) {
        const comments = await commentRepository.findByStoryId(storyId, limit, userIp, pendingIds);
        
        // Format comments cho frontend
        return comments.map((comment: any) => ({
            id: comment.id,
            author: comment.author,
            content: comment.content,
            rating: comment.rating,
            status: comment.status,
            createdAt: this.formatRelativeTime(comment.createdAt),
        }));
    }

    // Format thời gian tương đối (2 giờ trước, 1 ngày trước...)
    private formatRelativeTime(date: Date): string {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'Vừa xong';
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} phút trước`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} giờ trước`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return `${diffInDays} ngày trước`;
        }

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return `${diffInMonths} tháng trước`;
        }

        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears} năm trước`;
    }
}

export const commentService = new CommentService();
