import React from 'react';
import RankingBoard from './RankingBoard';
import { prisma } from '@/lib/prisma';

type TabType = 'HOT NGÀY' | 'THÁNG' | 'NĂM';

interface RankingAnime {
    id: string;
    title: string;
    slug: string;
    coverImage?: string;
    rating: number;
    episodes?: string;
    year?: number;
}

async function getRankingData(): Promise<Record<TabType, RankingAnime[]>> {
    // Fetch stories cho mỗi khoảng thời gian qua API
    const fetchRanking = async (period: 'day' | 'month' | 'year') => {
        const apiUrl = process.env.API_URL || 'https://api.animeez.online/';
        try {
            const res = await fetch(`${apiUrl}/api/public/movies?limit=10&sort=views&period=${period}`, {
                next: { revalidate: 3600 }
            });
            if (res.ok) {
                const data = await res.json();
                return data.data || [];
            }
        } catch (error) {
            console.error('Lỗi khi fetch ranking:', error);
        }
        return [];
    };

    const [dailyStories, monthlyStories, yearlyStories] = await Promise.all([
        fetchRanking('day'),
        fetchRanking('month'),
        fetchRanking('year'),
    ]);

    // Format dữ liệu
    const formatStories = (stories: any[]): RankingAnime[] => {
        const apiUrl = (process.env.API_URL || 'https://api.animeez.online').replace(/\/$/, '');
        return stories.map(story => {
            const latestChapter = story.latestChapter;
            let episodes = 'Đang cập nhật';

            if (story.status === 'completed' || story.status === 'Hoàn thành') {
                episodes = 'Full';
            } else if (latestChapter) {
                episodes = story.totalEpisodes > 0
                    ? `Tập ${latestChapter.index}/${story.totalEpisodes}`
                    : `Tập ${latestChapter.index}`;
            }

            let imageUrl = story.coverImage || '';
            if (imageUrl && imageUrl.includes('/upload/')) {
                imageUrl = `${apiUrl}${imageUrl.substring(imageUrl.indexOf('/upload/'))}`;
            }

            return {
                id: story.id,
                title: story.title,
                slug: story.slug,
                coverImage: imageUrl,
                rating: story.averageRating || 0,
                episodes,
                year: story.releaseYear || undefined,
            };
        });
    };

    return {
        'HOT NGÀY': formatStories(dailyStories),
        'THÁNG': formatStories(monthlyStories),
        'NĂM': formatStories(yearlyStories),
    };
}

interface RankingBoardWrapperProps {
    title?: string;
}

export default async function RankingBoardWrapper({ title }: RankingBoardWrapperProps) {
    const rankingData = await getRankingData();

    return <RankingBoard rankingData={rankingData} title={title} />;
}
