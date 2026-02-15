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
}

export default function WatchEpisodeList({ animeSlug, episodes, currentEpisode }: WatchEpisodeListProps) {
    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-white text-lg font-bold mb-4">
                Danh sách tập phim
            </h2>

            {episodes.length > 0 ? (
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                    {episodes.map((episode) => (
                        <Link
                            key={episode.id}
                            href={`/anime/${animeSlug}/tap-${episode.number}`}
                            className={`
                                py-2 px-3 rounded font-semibold text-sm text-center transition-all duration-200
                                ${
                                    currentEpisode === episode.number
                                        ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                                        : 'bg-gray-700 text-white hover:bg-red-500'
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
        </div>
    );
}
