import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { storyService } from '@/modules/story/story.service';
import { chapterService } from '@/modules/chapter/chapter.service';

export default async function AnimeHotList() {
    // Lấy 10 stories hot nhất từ database (theo views và rating)
    const stories = await storyService.getHotStories(10);

    // Format data cho component
    const hotAnimeData = await Promise.all(
        stories.map(async (story) => {
            const totalEpisodes = await chapterService.countChapters(story.id);
            const latestChapter = await chapterService.getLatestChapter(story.id);

            let status = 'Đang cập nhật';
            if (story.status === 'completed' || story.status === 'Hoàn thành') {
                status = 'Full';
            } else if (latestChapter) {
                status = totalEpisodes > 0
                    ? `Tập ${latestChapter.index}/${totalEpisodes}`
                    : `Tập ${latestChapter.index}`;
            }

            return {
                id: story.id,
                title: story.title,
                slug: story.slug,
                coverImage: story.coverImage || undefined,
                rating: story.rating || undefined,
                status,
            };
        })
    );

    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-primary uppercase mb-4 pb-2 border-b border-gray-700">
                🔥 Phim Hot Mới
            </h3>

            {hotAnimeData.length > 0 ? (
                <div className="space-y-4">
                    {hotAnimeData.map((anime) => (
                        <Link
                            key={anime.id}
                            href={`/anime/${anime.slug}`}
                            className="flex gap-3 group hover:bg-gray-700/50 p-2 rounded transition-all duration-200"
                        >
                            {/* Thumbnail */}
                            <div className="relative w-16 h-20 flex-shrink-0 rounded overflow-hidden">
                                {anime.coverImage ? (
                                    <Image
                                        src={anime.coverImage}
                                        alt={anime.title}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                                        <span className="text-gray-500 text-xl">🎬</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <h4 className="text-white font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                                    {anime.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs">
                                    {anime.rating && (
                                        <span className="text-yellow-400 flex items-center gap-1">
                                            ⭐ {anime.rating.toFixed(1)}
                                        </span>
                                    )}
                                    <span className="text-gray-400">{anime.status}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-400">
                    <p>Chưa có dữ liệu</p>
                </div>
            )}

            {/* View all button */}
            <button className="w-full mt-4 bg-primary hover:brightness-110 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2">
                <span>Xem Thêm</span>
                Xem anime ngẫu nhiên
            </button>
        </div>
    );
}
