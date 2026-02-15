import React from 'react';
import { prisma } from '@/lib/prisma';
import AnimeCard from '@/components/home/AnimeCard';
import { chapterService } from '@/modules/chapter/chapter.service';

interface SearchPageProps {
    searchParams: {
        q?: string;
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const query = searchParams.q?.trim() || '';

    let stories: any[] = [];

    if (query) {
        stories = await prisma.story.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { alternativeName: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { keywords: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: 50,
            orderBy: [
                { views: 'desc' },
                { rating: 'desc' },
            ],
        });
    }

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
            <div className="bg-gray-800 rounded-lg p-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                    🔍 Kết quả tìm kiếm
                </h1>
                {query && (
                    <p className="text-gray-400">
                        Tìm thấy <span className="text-red-500 font-bold">{stories.length}</span> kết quả cho "{query}"
                    </p>
                )}
            </div>

            {!query ? (
                <div className="bg-gray-800 rounded-lg p-12 text-center">
                    <p className="text-gray-400 text-lg">Vui lòng nhập từ khóa để tìm kiếm</p>
                </div>
            ) : stories.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {animeData.map((anime) => (
                        <AnimeCard key={anime.id} {...anime} />
                    ))}
                </div>
            ) : (
                <div className="bg-gray-800 rounded-lg p-12 text-center">
                    <p className="text-gray-400 text-lg">Không tìm thấy kết quả nào</p>
                    <p className="text-gray-500 mt-2">Thử tìm với từ khóa khác</p>
                </div>
            )}
        </div>
    );
}
