import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
    title: 'Lịch Chiếu - Anime47',
    description: 'Lịch chiếu anime theo từng ngày trong tuần trên Anime47.',
};

function formatMovieCard(movie: any) {
    const status = String(movie.status || '').toLowerCase();
    const releaseYear = Number(movie.releaseYear) || new Date().getFullYear();
    const isUpcoming =
        status === 'upcoming' ||
        status === 'coming_soon' ||
        status === 'sap-chieu' ||
        status === 'sắp chiếu' ||
        releaseYear > new Date().getFullYear();

    return {
        id: movie.id,
        title: movie.title,
        slug: movie.slug,
        coverImage: movie.coverImage || movie.thumbnail || '',
        rating: movie.averageRating || movie.rating || 0,
        statusLabel: isUpcoming ? 'Sắp Chiếu' : 'Đang Chiếu',
        currentEpisode: movie.latestChapter?.index || (movie.totalEpisodes > 0 ? movie.totalEpisodes : null),
        releaseYear,
    };
}

export default async function SchedulePage() {
    const apiUrl = process.env.API_URL || 'https://api.animeez.online';
    const res = await fetch(`${apiUrl}/api/public/schedule`, {
        next: { revalidate: 60 },
    });

    let result: { success: boolean; data: any[] } = { success: false, data: [] };
    if (res.ok) {
        result = await res.json();
    }

    const schedules = result.data || [];

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
                    const movies = (schedule.movies || []).map(formatMovieCard);

                    return (
                        <section key={schedule.daySlug} className="space-y-4">
                            <div className="flex items-center justify-between gap-4 border-b border-primary/70 pb-3">
                                <h2 className="text-2xl md:text-3xl font-bold text-primary">
                                    Anime {schedule.dayOfWeek}
                                </h2>
                                <span className="text-sm text-gray-400">
                                    {schedule.totalMovies || movies.length} phim
                                </span>
                            </div>

                            {movies.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                                    {movies.map((movie: any) => (
                                        <Link key={movie.id} href={`/anime/${movie.slug}`} className="group block">
                                            <div className="rounded-lg overflow-hidden bg-[#242424] border border-gray-800 hover:border-primary transition-all">
                                                <div className="relative aspect-[2/3] overflow-hidden">
                                                    {movie.coverImage ? (
                                                        <Image
                                                            src={movie.coverImage}
                                                            alt={movie.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12vw"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-4xl text-gray-500">
                                                            🎬
                                                        </div>
                                                    )}

                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                                                    <div className="absolute top-2 left-2 bg-black/70 text-yellow-400 px-2 py-1 rounded-full text-xs font-bold">
                                                        ★ {Number(movie.rating || 0).toFixed(1)}
                                                    </div>

                                                    {movie.currentEpisode && (
                                                        <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-bold uppercase">
                                                            Tập {movie.currentEpisode}
                                                        </div>
                                                    )}

                                                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-3 text-center">
                                                        <div className="text-4xl md:text-5xl font-black text-white/90 leading-none drop-shadow-lg">
                                                            {movie.releaseYear}
                                                        </div>
                                                        <h3 className="mt-3 text-white font-bold text-base leading-tight line-clamp-2 text-left">
                                                            {movie.title}
                                                        </h3>
                                                    </div>

                                                    <div className="absolute inset-x-0 bottom-0 bg-primary text-white text-center py-2 text-sm font-bold uppercase">
                                                        {movie.statusLabel}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
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
