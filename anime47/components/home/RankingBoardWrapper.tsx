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
    const now = new Date();

    // Ngày bắt đầu của ngày hôm nay
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Ngày bắt đầu của tháng này
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Ngày bắt đầu của năm này
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Fetch stories cho mỗi khoảng thời gian
    const fetchRanking = async (date?: Date) => {
        let stories = await prisma.stories.findMany({
            where: date ? { updatedAt: { gte: date } } : {},
            orderBy: [
                { views: 'desc' },
                { rating: 'desc' },
            ],
            take: 10,
            include: {
                chapters: {
                    orderBy: { index: 'desc' },
                    take: 1,
                },
            },
        });

        // Fallback: Nếu không có phim nào update trong khoảng TG đó, lấy top views chung
        if (stories.length === 0 && date) {
            stories = await prisma.stories.findMany({
                orderBy: [
                    { views: 'desc' },
                    { rating: 'desc' },
                ],
                take: 10,
                include: {
                    chapters: {
                        orderBy: { index: 'desc' },
                        take: 1,
                    },
                },
            });
        }
        return stories;
    };

    const [dailyStories, monthlyStories, yearlyStories] = await Promise.all([
        fetchRanking(startOfDay),
        fetchRanking(startOfMonth),
        fetchRanking(startOfYear),
    ]);

    // Format dữ liệu
    const formatStories = (stories: any[]): RankingAnime[] => {
        return stories.map(story => {
            const latestChapter = story.chapters[0];
            let episodes = 'Đang cập nhật';

            if (story.status === 'completed' || story.status === 'Hoàn thành') {
                episodes = 'Full';
            } else if (latestChapter) {
                episodes = `Tập ${latestChapter.index}`;
            }

            return {
                id: story.id,
                title: story.title,
                slug: story.slug,
                coverImage: story.coverImage || undefined,
                rating: story.rating || 0,
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
