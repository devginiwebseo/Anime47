import React from 'react';
import { notFound } from 'next/navigation';
import AnimeCard from '@/components/home/AnimeCard';
import Pagination from '@/components/ui/Pagination';
import { fetchExternalApi } from '@/lib/external-api';

export default async function GenrePage(props: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const { slug } = await props.params;
    const searchParams = await props.searchParams;
    const currentPage = parseInt(searchParams.page || '1');
    const limit = 10;

    const res = await fetchExternalApi(
        `/api/public/genres?slug=${encodeURIComponent(slug)}&limit=${limit}&page=${currentPage}`,
        {
            next: { revalidate: 60 },
        }
    );

    let result: { success: boolean; genre: any; data: any[]; pagination: any } = {
        success: false,
        genre: null,
        data: [],
        pagination: { totalItems: 0, totalPages: 1 },
    };

    if (res.ok) {
        result = await res.json();
    }

    if (!result.genre) {
        notFound();
    }

    const { genre, data: stories, pagination } = result;
    const totalStories = pagination?.totalItems || stories.length;
    const totalPages = pagination?.totalPages || Math.ceil(totalStories / limit);

    const animeData = stories.map((story: any) => ({
        id: story.id,
        title: story.title,
        slug: story.slug,
        coverImage: story.coverImage || story.thumbnail || undefined,
        rating: story.averageRating || story.rating || 0,
        quality: story.quality || 'FHD',
        totalEpisodes: story.totalEpisodes > 0 ? story.totalEpisodes : undefined,
        currentEpisode:
            story.latestChapter?.index || (story.totalEpisodes > 0 ? story.totalEpisodes : undefined),
        isNew: false,
        views: story.views || 0,
    }));

    return (
        <div className="space-y-5 sm:space-y-6">
            <div className="mt-4 flex w-fit flex-wrap gap-2 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-gray-400 sm:mt-6 sm:text-sm">
                Anime47 <span className="text-gray-600">/</span> The loai <span className="text-gray-600">/</span>{' '}
                <span className="font-semibold text-white">{genre.name}</span>
            </div>

            <div className="rounded-lg border-l-4 border-primary bg-gray-800 p-4 sm:p-5 lg:p-6">
                <h1 className="mb-2 text-xl font-bold uppercase text-white sm:text-2xl">
                    Thể loại: {genre.name}
                </h1>
                <p className="text-sm text-gray-400 sm:text-base">
                    {genre.description ||
                        `Danh sách anime thể loại ${genre.name}. Cập nhật liên tục những bộ phim mới và được xem nhiều.`}
                </p>
                <div className="mt-2 text-sm font-semibold text-primary">Tìm thấy {totalStories} bộ phim</div>
            </div>

            {animeData.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                        {animeData.map((anime) => (
                            <AnimeCard key={anime.id} {...anime} />
                        ))}
                    </div>

                    {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
                </>
            ) : (
                <div className="rounded-lg bg-gray-800 p-8 text-center text-sm text-gray-400 sm:p-12 sm:text-base">
                    Chưa có phim nào thuộc thể loại này
                </div>
            )}
        </div>
    );
}
