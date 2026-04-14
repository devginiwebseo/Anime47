import React from 'react';
import { notFound } from 'next/navigation';
import AnimeCard from '@/components/home/AnimeCard';
import Pagination from '@/components/ui/Pagination';
import AnimeHotList from '@/components/home/AnimeHotList';
import RankingBoardWrapper from '@/components/home/RankingBoardWrapper';
import { fetchExternalApi } from '@/lib/external-api';

export default async function CountryDetailPage(props: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const { slug } = await props.params;
    const searchParams = await props.searchParams;
    const currentPage = parseInt(searchParams.page || '1');
    const limit = 20;

    const res = await fetchExternalApi(
        `/api/public/countries?slug=${encodeURIComponent(slug)}&limit=${limit}&page=${currentPage}`,
        { next: { revalidate: 60 } }
    );

    let result: { success: boolean; country: any; data: any[]; pagination: any } = {
        success: false,
        country: null,
        data: [],
        pagination: { totalItems: 0, totalPages: 1 },
    };
    if (res.ok) {
        result = await res.json();
    }

    if (!result.country) {
        notFound();
    }

    const { country, data: stories, pagination } = result;
    const totalStories = result.pagination?.totalItems || pagination?.total || stories.length;
    const totalPages = result.pagination?.totalPages || Math.ceil(totalStories / limit);

    const animeData = stories.map((story: any) => {
        return {
            id: story.id,
            title: story.title,
            slug: story.slug,
            coverImage: story.coverImage || story.thumbnail || undefined,
            rating: story.averageRating || story.rating || 0,
            quality: story.quality || 'HD',
            totalEpisodes: story.totalEpisodes > 0 ? story.totalEpisodes : undefined,
            currentEpisode: story.latestChapter?.index || undefined,
            isNew: false,
            views: story.views || 0,
            status: story.status,
        };
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-[10px] md:pt-[30px] pb-12 px-2 md:px-4 lg:px-0">
            <div className="lg:col-span-9 space-y-6">
                <div className="bg-gray-800 rounded-lg p-6 mt-6 border-l-4 border-primary">
                    <h1 className="text-2xl font-bold text-white mb-2 uppercase flex items-center gap-2">
                        Quốc Gia {country.name}
                    </h1>
                    <p className="text-gray-400">
                        Danh sách các bộ Anime thuộc quốc gia {country.name} mới nhất được cập nhật trên hệ thống.
                        Hiện có <span className="text-primary font-bold">{totalStories}</span> bộ phim.
                    </p>
                </div>

                {stories.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {animeData.map((anime: any) => (
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
                        <p className="text-gray-400 text-lg">Chưa có phim nào thuộc quốc gia này</p>
                    </div>
                )}
            </div>

            <div className="lg:col-span-3 space-y-8">
                <AnimeHotList title="Anime Hot" limit={10} />
                <RankingBoardWrapper title="Bảng Xếp Hạng" />
            </div>
        </div>
    );
}
