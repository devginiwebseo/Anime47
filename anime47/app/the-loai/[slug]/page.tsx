import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AnimeCard from '@/components/home/AnimeCard';
import { chapterService } from '@/modules/chapter/chapter.service';
import Pagination from '@/components/ui/Pagination';

export default async function GenrePage(props: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ page?: string }>
}) {
    const { slug } = await props.params;
    const searchParams = await props.searchParams;
    const currentPage = parseInt(searchParams.page || '1');
    const pageSize = 20;
    const skip = (currentPage - 1) * pageSize;

    // Fetch genre
    const genre = await prisma.genres.findUnique({
        where: { slug },
    });

    if (!genre) {
        notFound();
    }

    // Process stories by genre
    const [storyGenres, totalStories] = await Promise.all([
        prisma.story_genres.findMany({
            where: { genreId: genre.id },
            include: { stories: true },
            take: pageSize,
            skip: skip,
            orderBy: { stories: { createdAt: 'desc' } }
        }),
        prisma.story_genres.count({ where: { genreId: genre.id } })
    ]);

    const totalPages = Math.ceil(totalStories / pageSize);

    const animeData = await Promise.all(
        storyGenres.map(async (sg) => {
            const story = sg.stories;
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
            };
        })
    );

    return (
        <div className="space-y-6">
            <div className="flex gap-2 text-sm text-gray-400 bg-gray-900 border border-gray-800 p-2 rounded-lg w-max mt-6">
                🏠 Anime47 <span className="text-gray-600">»</span> Thể Loại <span className="text-gray-600">»</span> <span className="text-white font-semibold">{genre.name}</span>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-primary">
                <h1 className="text-2xl font-bold text-white mb-2 uppercase">
                    Thể Loại: {genre.name}
                </h1>
                <p className="text-gray-400">
                    {genre.description || `Danh sách các phim anime thể loại ${genre.name}. Cập nhật liên tục những bộ phim mới nhất, hay nhất.`}
                </p>
                <div className="mt-2 text-sm text-primary font-semibold">
                    Tìm thấy {totalStories} bộ phim
                </div>
            </div>

            {animeData.length > 0 ? (
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
                <div className="bg-gray-800 rounded-lg p-12 text-center text-gray-400">
                    Chưa có phim nào thuộc thể loại này
                </div>
            )}
        </div>
    );
}
