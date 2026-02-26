import React from 'react';
import { prisma } from '@/lib/prisma';
import AnimeCard from '@/components/home/AnimeCard';
import { chapterService } from '@/modules/chapter/chapter.service';
import Pagination from '@/components/ui/Pagination';

export const metadata = {
    title: 'Anime Bộ - Anime47',
    description: 'Danh sách Anime Bộ mới nhất, cập nhật liên tục.',
};

export default async function AnimeBoPage(props: {
    searchParams: Promise<{ page?: string }>
}) {
    const searchParams = await props.searchParams;
    const currentPage = parseInt(searchParams.page || '1');
    const pageSize = 20;
    const skip = (currentPage - 1) * pageSize;

    // Giả sử Anime Bộ là các phim có type hoặc số tập lớn hơn 1. 
    // Tạm thời lấy tất cả stories kèm order mới nhất cho trang này.
    const [stories, totalStories] = await Promise.all([
        prisma.stories.findMany({
            take: pageSize,
            skip: skip,
            orderBy: [
                { createdAt: 'desc' },
            ],
        }),
        prisma.stories.count()
    ]);

    const totalPages = Math.ceil(totalStories / pageSize);

    // Lấy thông tin số tập cho mỗi story
    const animeData = await Promise.all(
        stories.map(async (story) => {
            const totalEpisodes = await chapterService.countChapters(story.id);
            const latestChapter = await chapterService.getLatestChapter(story.id);

            return {
                id: story.id,
                title: story.title,
                slug: story.slug,
                coverImage: story.coverImage || undefined,
                rating: story.rating || undefined,
                quality: story.quality || 'HD',
                totalEpisodes: totalEpisodes > 0 ? totalEpisodes : undefined,
                currentEpisode: latestChapter?.index || undefined,
                isNew: false,
            };
        })
    );

    return (
        <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 mt-6 border-l-4 border-primary">
                <h1 className="text-2xl font-bold text-white mb-2 uppercase flex items-center gap-2">
                    📺 Anime Bộ
                </h1>
                <p className="text-gray-400">
                    Danh sách các bộ Anime nhiều tập mới nhất được cập nhật trên hệ thống.
                    Hiện có <span className="text-primary font-bold">{totalStories}</span> bộ phim.
                </p>
            </div>

            {stories.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {animeData.map((anime) => (
                            <AnimeCard key={anime.id} {...anime} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                        />
                    )}
                </>
            ) : (
                <div className="bg-gray-800 rounded-lg p-12 text-center">
                    <p className="text-gray-400 text-lg">Đang cập nhật dữ liệu</p>
                </div>
            )}
        </div>
    );
}
