import React from 'react';
import Link from 'next/link';

interface Episode {
    id: string;
    number: number;
    title?: string;
}

interface WatchEpisodeListProps {
    animeSlug: string;
    episodes: Episode[];
    currentEpisode: number;
    animeTitle?: string;
}

export default function WatchEpisodeList({ animeSlug, episodes, currentEpisode, animeTitle }: WatchEpisodeListProps) {
    return (
        <div className="bg-[#14151a] rounded-lg p-6">
            <h2 className="text-primary text-xl font-bold mb-6">
                Danh sách tập phim
            </h2>

            {episodes.length > 0 ? (
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
                    {episodes.map((episode) => (
                        <Link
                            key={episode.id}
                            href={`/anime/${animeSlug}/tap-${episode.number}`}
                            className={`
                                py-2.5 px-2 rounded font-semibold text-sm text-center transition-all duration-200
                                ${currentEpisode === episode.number
                                    ? 'bg-primary text-white shadow-lg ring-2 ring-primary ring-offset-2 ring-offset-[#14151a]'
                                    : 'bg-primary/80 hover:bg-primary text-white'
                                }
                            `}
                        >
                            Tập {episode.number}
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-gray-400 text-center py-8">
                    Chưa có tập phim nào
                </div>
            )}

            {/* Note box matching screenshot */}
            <div className="mt-8 border border-primary/40 bg-[#1c1d22]/50 rounded-lg p-4 text-center">
                <p className="text-gray-300 text-sm">
                    Xem tập mới tại <span className="text-white font-bold">anime47.onl</span>, tìm ngay cú pháp 👉 <span className="text-primary font-bold">{animeTitle || 'Phim này'} anime47</span>
                </p>
            </div>
        </div>
    );
}
