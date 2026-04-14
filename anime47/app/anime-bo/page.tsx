import React from 'react';
import AnimeCard from '@/components/home/AnimeCard';
import Pagination from '@/components/ui/Pagination';
import AnimeHotList from '@/components/home/AnimeHotList';
import RankingBoardWrapper from '@/components/home/RankingBoardWrapper';
import { fetchExternalApi } from '@/lib/external-api';

export const metadata = {
    title: 'Anime Bo - Anime47',
    description: 'Danh sach Anime Bo moi nhat, cap nhat lien tuc.',
};

export default async function AnimeBoPage(props: {
    searchParams: Promise<{ page?: string }>;
}) {
    const searchParams = await props.searchParams;
    const currentPage = parseInt(searchParams.page || '1');
    const limit = 20;

    const res = await fetchExternalApi(`/api/public/movies?limit=${limit}&page=${currentPage}`, {
        next: { revalidate: 60 },
    });

    let result = { success: false, data: [], pagination: { totalItems: 0, totalPages: 1 } };
    if (res.ok) {
        result = await res.json();
    }

    const stories = result.data || [];
    const totalStories = result.pagination?.totalItems || stories.length;
    const totalPages = result.pagination?.totalPages || Math.ceil(totalStories / limit);

    const animeData = stories.map((story: any) => ({
        id: story.id,
        title: story.title,
        slug: story.slug,
        coverImage: story.coverImage || undefined,
        rating: story.averageRating || story.rating || 0,
        quality: story.quality || 'HD',
        totalEpisodes: story.totalEpisodes > 0 ? story.totalEpisodes : undefined,
        currentEpisode: story.latestChapter?.index || undefined,
        isNew: false,
        views: story.views || 0,
        status: story.status,
        year: story.releaseYear || undefined,
        genres: story.genres?.map((g: any) => g.name || g) || undefined,
        director: story.director || undefined,
        cast: story.cast || undefined,
        duration: story.duration || undefined,
    }));

    return (
        <div className="grid grid-cols-1 gap-6 px-0 pb-10 pt-3 sm:px-2 sm:pb-12 md:px-4 md:pt-8 lg:grid-cols-12 lg:gap-8 lg:px-0">
            <div className="space-y-5 sm:space-y-6 lg:col-span-9">
                <div className="mt-4 rounded-lg border-l-4 border-primary bg-gray-800 p-4 sm:mt-6 sm:p-5 lg:p-6">
                    <h1 className="mb-2 flex items-center gap-2 text-xl font-bold uppercase text-white sm:text-2xl">
                        Anime Bộ
                    </h1>
                    <p className="text-sm text-gray-400 sm:text-base">
                        Danh sách các bộ anime nhiều tập mới nhất được cập nhật trên hệ thống.
                        Hiện có <span className="font-bold text-primary">{totalStories}</span> bộ phim.
                    </p>
                </div>

                {stories.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                            {animeData.map((anime: any) => (
                                <AnimeCard key={anime.id} {...anime} />
                            ))}
                        </div>

                        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
                    </>
                ) : (
                    <div className="rounded-lg bg-gray-800 p-8 text-center sm:p-12">
                        <p className="text-base text-gray-400 sm:text-lg">Dang cap nhat du lieu</p>
                    </div>
                )}
            </div>

            <div className="space-y-6 lg:col-span-3 lg:space-y-8">
                <AnimeHotList title="Anime Hot" limit={10} />
                <RankingBoardWrapper title="Bảng Xếp Hạng" />
            </div>
        </div>
    );
}
