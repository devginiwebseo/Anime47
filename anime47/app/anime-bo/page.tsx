import React from 'react';
import AnimeCard from '@/components/home/AnimeCard';
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
    const limit = 20;

    // Call API để lấy data phim thay vì dùng prisma / database
    // Sử dụng biến API_URL trong file .env
    const apiUrl = process.env.API_URL || 'https://api.animeez.online/';
    const res = await fetch(`${apiUrl}/api/public/movies?limit=${limit}&page=${currentPage}`, {
        next: { revalidate: 60 } // Cache 60s
    });
    
    let result = { success: false, data: [], pagination: { totalItems: 0, totalPages: 1 } };
    if (res.ok) {
        result = await res.json();
    }

    const stories = result.data || [];
    // Giả sử API có trả về thông tin phân trang (pagination.totalItems)
    // Nếu API của bạn chưa có, hãy bổ sung object pagination vào response!
    const totalStories = result.pagination?.totalItems || stories.length;
    const totalPages = result.pagination?.totalPages || Math.ceil(totalStories / limit);

    // Xử lý data được trả về
    const animeData = stories.map((story: any) => {
        return {
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
        };
    });

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
                    <p className="text-gray-400 text-lg">Đang cập nhật dữ liệu</p>
                </div>
            )}
        </div>
    );
}
