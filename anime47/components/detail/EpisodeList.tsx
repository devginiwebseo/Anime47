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
        <div className="bg-[#1c1d22] rounded-lg border border-gray-800 p-4 sm:p-5 lg:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-primary sm:mb-5 sm:text-xl">
                 Danh sách tập phim
            </h2>

            {episodes.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3 md:grid-cols-6 lg:grid-cols-10">
                    {episodes.map((episode) => (
                        <Link
                            key={episode.id}
                            href={`/anime/${animeSlug}/tap-${episode.number}`}
                            className={`
                                rounded-md px-1 py-2 text-center text-[11px] font-semibold transition-colors duration-200 sm:px-2 sm:py-2.5 sm:text-xs md:text-sm whitespace-nowrap
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
            <div className="mt-5 rounded-r border-l-4 border-primary bg-[#14151a] p-3 text-xs text-gray-400 shadow-inner sm:mt-6 sm:p-4 sm:text-sm">
                <p>💡 <span className="text-white font-semibold">Lưu ý:</span> Xem hết tập này sẽ tự chuyển sang tập tiếp theo. Tình trạng xem sẽ được lưu lại để tiện cho lần xem sau.</p>
            </div>
        </div>
    );
}
