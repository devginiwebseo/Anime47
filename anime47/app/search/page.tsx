import React from 'react';
import AnimeCard from '@/components/home/AnimeCard';
import { fetchExternalApi } from '@/lib/external-api';

import Pagination from '@/components/ui/Pagination';

export default async function SearchPage(props: {
    searchParams: Promise<{ q?: string; page?: string }>
}) {
    const searchParams = await props.searchParams;
    const query = searchParams.q?.trim() || '';
    const currentPage = parseInt(searchParams.page || '1');
    const pageSize = 20;

    let stories: any[] = [];
    let totalStories = 0;

    if (query) {
        const res = await fetchExternalApi(
            `/api/public/search?q=${encodeURIComponent(query)}&limit=${pageSize}&page=${currentPage}`,
            {
                next: { revalidate: 60 },
            }
        );

        if (res.ok) {
            const result = await res.json();
            stories = result.data || result.items || [];
            totalStories =
                result.pagination?.totalItems ||
                result.pagination?.total ||
                result.total ||
                stories.length;
        }
    }

    const totalPages = Math.ceil(totalStories / pageSize);

    // Lấy thông tin số tập cho mỗi story
    const animeData = stories.map((story: any) => ({
        id: story.id,
        title: story.title,
        slug: story.slug,
        coverImage: story.coverImage || story.thumbnail || undefined,
        rating: story.averageRating || story.rating || undefined,
        quality: story.quality || 'HD',
        totalEpisodes: story.totalEpisodes > 0 ? story.totalEpisodes : undefined,
        currentEpisode: story.latestChapter?.index || undefined,
        isNew: false,
        views: story.views || 0,
        status: story.status,
    }));

    return (
        <div className="space-y-5 sm:space-y-6">
            <div className="mt-4 rounded-lg bg-gray-800 p-4 sm:mt-6 sm:p-5 lg:p-6">
                <h1 className="mb-2 text-xl font-bold text-white sm:text-2xl">
                    Kết quả tìm kiếm
                </h1>
                {query && (
                    <p className="text-sm text-gray-400 sm:text-base">
                        Tìm thấy <span className="text-primary font-bold">{totalStories}</span> kết quả cho "{query}"
                        {totalStories > 0 && (
                            <span className="ml-2">
                                (Trang {currentPage}/{totalPages})
                            </span>
                        )}
                    </p>
                )}
            </div>

            {!query ? (
                <div className="rounded-lg bg-gray-800 p-8 text-center sm:p-12">
                    <p className="text-base text-gray-400 sm:text-lg">Vui lòng nhập từ khóa để tìm kiếm</p>
                </div>
            ) : stories.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                        {animeData.map((anime) => (
                            <AnimeCard key={anime.id} {...anime} />
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                    />
                </>
            ) : (
                <div className="rounded-lg bg-gray-800 p-8 text-center sm:p-12">
                    <p className="text-base text-gray-400 sm:text-lg">Không tìm thấy kết quả nào</p>
                    <p className="text-gray-500 mt-2">Thử tìm với từ khóa khác</p>
                </div>
            )}
        </div>
    );
}

