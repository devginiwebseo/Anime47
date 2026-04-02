import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { storyService } from '@/modules/story/story.service';
import { chapterService } from '@/modules/chapter/chapter.service';
import RandomAnimeButton from './RandomAnimeButton';

interface SectionProps {
    title: string;
    limit?: number;
}

export default async function AnimeHotList({ title, limit = 10 }: SectionProps) {
    const apiUrl = process.env.API_URL || 'http://localhost:3000';
    // Lấy stories hot từ API (có thể cần truyền thêm param sort=views)
    const res = await fetch(`${apiUrl}/api/public/movies?limit=${limit}&sort=views`, {
        next: { revalidate: 3600 } // Tùy chỉnh bộ nhớ đệm
    });
    
    let hotAnimeData = [];
    if (res.ok) {
        const result = await res.json();
        const stories = result.data || [];

        // Format data cho component
        hotAnimeData = stories.map((story: any) => {
            let status = 'Đang cập nhật';
            if (story.status === 'completed' || story.status === 'Hoàn thành') {
                status = 'Full';
            } else if (story.latestChapter) {
                status = story.totalEpisodes > 0
                    ? `Tập ${story.latestChapter.index}/${story.totalEpisodes}`
                    : `Tập ${story.latestChapter.index}`;
            }

            return {
                id: story.id,
                title: story.title,
                slug: story.slug,
                coverImage: story.coverImage || undefined,
                rating: story.rating || undefined,
                status,
            };
        });
    }

    return (
        <div className="rounded-xl">
            <div className="relative mb-6 pb-2">
                <h3 className="text-lg w-full md:text-2xl font-bold text-primary uppercase tracking-wider inline-block relative">
                    {title}
                    <div className="absolute -bottom-[9px] left-0 w-full h-[2px] bg-primary"></div>
                </h3>
            </div>

            {hotAnimeData.length > 0 ? (
                <div className="space-y-3">
                    {hotAnimeData.map((anime: any) => (
                        <Link
                            key={anime.id}
                            href={`/anime/${anime.slug}`}
                            className="flex gap-3 p-2 bg-[#1c1d22]/40 border border-gray-800/40 rounded-lg group hover:bg-[#1c1d22]/80 hover:border-primary/30 transition-all duration-300"
                        >
                            {/* Thumbnail */}
                            <div className="relative w-16 h-20 md:w-16 md:h-20 flex-shrink-0 rounded-md overflow-hidden ring-1 ring-white/5 transition-all">
                                {anime.coverImage ? (
                                    <Image
                                        src={anime.coverImage.includes('/upload/') ? anime.coverImage.substring(anime.coverImage.indexOf('/upload/')) : anime.coverImage}
                                        alt={anime.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        sizes="80px"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                        <span className="text-gray-500 text-lg">🎬</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                <h4 className="text-gray-100 font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                    {anime.title}
                                </h4>
                                <div className="flex flex-col gap-1">
                                    {anime.rating !== undefined && (
                                        <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                                            <span className="text-yellow-500 text-xs">★</span>
                                            <span className="text-yellow-500/90">{anime.rating.toFixed(1)}/5</span>
                                            <span className="mx-1 text-gray-700">|</span>
                                            <span className="text-primary/90 font-bold">{anime.status}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Chưa có dữ liệu hot</p>
                </div>
            )}

            {/* Random anime button */}
            <RandomAnimeButton />
        </div>
    );
}
