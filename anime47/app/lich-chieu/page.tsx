import React from 'react';
import AnimeCard from '@/components/home/AnimeCard';
import { fetchExternalApi } from '@/lib/external-api';

export const metadata = {
    title: 'Lịch Chiếu - Anime47',
    description: 'Lịch chiếu anime theo từng ngày trong tuần trên Anime47.',
};

export default async function SchedulePage() {
    const res = await fetchExternalApi('/api/public/schedule', {
        next: { revalidate: 60 },
    });

    let result: { success: boolean; data: any[] } = { success: false, data: [] };
    if (res.ok) {
        result = await res.json();
    }

    const schedules = result.data || [];

    // DEBUG: log cấu trúc data API trả về để kiểm tra
    if (schedules.length > 0 && schedules[0].movies?.length > 0) {
        console.log('[LichChieu DEBUG] movie mẫu:', JSON.stringify(schedules[0].movies[0], null, 2));
    }

    return (
        <div className="space-y-12 py-8">
            <section className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-primary">Lịch Chiếu Anime47</h1>
                <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Theo dõi anime được cập nhật theo từng ngày trong tuần. Lịch được đồng bộ trực tiếp từ API mới.
                </p>
            </section>

            <div className="space-y-10">
                {schedules.map((schedule: any) => {
                    const movies = (schedule.movies || []).map((movie: any) => {
                        // currentEpisode là nguồn dữ liệu duy nhất đáng tin
                        const currentEpisode = movie.latestChapter?.index ?? undefined;
                        const hasEpisodes = currentEpisode != null && currentEpisode > 0;

                        return {
                            id: movie.id,
                            title: movie.title,
                            slug: movie.slug,
                            coverImage: movie.coverImage || movie.thumbnail || undefined,
                            rating: movie.averageRating || movie.rating || 0,
                            quality: movie.quality || 'HD',
                            totalEpisodes: movie.totalEpisodes > 0 ? movie.totalEpisodes : undefined,
                            currentEpisode,
                            isNew: false,
                            // Chỉ sắp chiếu khi THỰC SỰ chưa có tập nào
                            isUpcoming: !hasEpisodes,
                            status: movie.status,
                            year: movie.releaseYear || new Date().getFullYear(),
                            genres: movie.genres?.map((g: any) => g.name || g) || undefined,
                            director: movie.director || undefined,
                            cast: movie.cast || undefined,
                            duration: movie.duration || undefined,
                        };
                    });

                    return (
                        <section key={schedule.daySlug} className="space-y-4">
                            <div className="flex items-center justify-between gap-4 border-b border-primary/70 pb-3">
                                <h2 className="text-2xl md:text-3xl font-bold text-primary">
                                    Anime {schedule.dayOfWeek}
                                </h2>
                                <span className="text-sm text-gray-400">
                                    {movies.length} phim
                                </span>
                            </div>

                            {movies.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                                    {movies.map((movie: any) => (
                                        <AnimeCard key={movie.id} {...movie} isScheduleCard={true} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
                                    Chưa có lịch chiếu cho {schedule.dayOfWeek.toLowerCase()}
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>
        </div>
    );
}