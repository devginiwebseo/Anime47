import React from 'react';
import Link from 'next/link';

interface Episode {
    id: string;
    number: number;
    title?: string;
    isWatched?: boolean;
}

interface EpisodeListProps {
    animeSlug: string;
    episodes: Episode[];
    currentEpisode?: number;
}

export default function EpisodeList({ animeSlug, episodes, currentEpisode }: EpisodeListProps) {
    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                📺 Danh sách tập phim
            </h2>

            {episodes.length > 0 ? (
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                    {episodes.map((episode) => (
                        <Link
                            key={episode.id}
                            href={`/anime/${animeSlug}/tap-${episode.number}`}
                            className={`
                                py-2 px-3 rounded font-semibold text-sm text-center transition-all duration-200
                                ${
                                    currentEpisode === episode.number
                                        ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                                        : episode.isWatched
                                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
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

            {/* Note for users */}
            <div className="mt-4 p-3 bg-gray-900 rounded text-xs text-gray-400 border-l-4 border-red-600">
                <p>💡 <span className="text-white font-semibold">Lưu ý:</span> Xem hết tập này sẽ tự chuyển sang tập tiếp theo. Tình trạng xem sẽ được lưu lại để tiện cho lần xem sau.</p>
            </div>
        </div>
    );
}
