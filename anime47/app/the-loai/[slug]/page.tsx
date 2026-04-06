import React from 'react';
import { notFound } from 'next/navigation';
import AnimeCard from '@/components/home/AnimeCard';
import Pagination from '@/components/ui/Pagination';

export default async function GenrePage(props: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ page?: string }>
}) {
    const { slug } = await props.params;
    const searchParams = await props.searchParams;
    const currentPage = parseInt(searchParams.page || '1');
    const limit = 10;

    const apiUrl = process.env.API_URL || 'https://api.animeez.online';
    const res = await fetch(`${apiUrl}/api/public/genres?slug=${encodeURIComponent(slug)}&limit=${limit}&page=${currentPage}`, {
        next: { revalidate: 60 }
    });

    let result: { success: boolean, genre: any, data: any[], pagination: any } = { success: false, genre: null, data: [], pagination: { totalItems: 0, totalPages: 1 } };
    if (res.ok) {
        result = await res.json();
    }

    if (!result.genre) {
        notFound();
    }

    const { genre, data: stories, pagination } = result;
    const totalStories = pagination?.totalItems || stories.length;
    const totalPages = pagination?.totalPages || Math.ceil(totalStories / limit);

    const animeData = stories.map((story: any) => {
        return {
            id: story.id,
            title: story.title,
            slug: story.slug,
            coverImage: story.coverImage || story.thumbnail || undefined,
            rating: story.averageRating || story.rating || 0,
            quality: story.quality || 'FHD',
            totalEpisodes: story.totalEpisodes > 0 ? story.totalEpisodes : undefined,
            currentEpisode: story.latestChapter?.index || (story.totalEpisodes > 0 ? story.totalEpisodes : undefined),
            isNew: false,
            views: story.views || 0,
        };
    });

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
