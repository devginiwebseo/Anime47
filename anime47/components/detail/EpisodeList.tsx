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
        <div className="bg-[#1c1d22] rounded-lg p-6 border border-gray-800">
            <h2 className="text-white text-xl font-bold mb-5 flex items-center gap-2">
                📺 Danh sách tập phim
            </h2>

            {episodes.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                    {episodes.map((episode) => (
                        <Link
                            key={episode.id}
                            href={`/anime/${animeSlug}/tap-${episode.number}`}
                            className={`
                                py-2.5 px-3 rounded-md font-semibold text-sm text-center transition-colors duration-200
                                ${currentEpisode === episode.number
                                    ? 'bg-primary text-white shadow-xl'
                                    : episode.isWatched
                                        ? 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                                        : 'bg-[#2b2d35] text-gray-300 hover:bg-primary hover:text-white'
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
            <div className="mt-6 p-4 bg-[#14151a] rounded-r border-l-4 border-primary text-sm text-gray-400 shadow-inner">
                <p>💡 <span className="text-white font-semibold">Lưu ý:</span> Xem hết tập này sẽ tự chuyển sang tập tiếp theo. Tình trạng xem sẽ được lưu lại để tiện cho lần xem sau.</p>
            </div>
        </div>
    );
}
