import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AnimeDetailHeaderProps {
    title: string;
    slug: string;
    originalTitle?: string;
    year?: number;
    coverImage?: string;
    rating?: number;
    status?: string;
    totalEpisodes?: number;
    quality?: string;
    genres?: string[];
    director?: string;
    cast?: string[];
    description?: string;
}

export default function AnimeDetailHeader({
    title,
    slug,
    originalTitle,
    year,
    coverImage,
    rating = 0,
    status = 'Đang Phát Sóng',
    totalEpisodes,
    quality = 'HD',
    genres = [],
    director,
    cast = [],
    description,
}: AnimeDetailHeaderProps) {
    return (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                {/* Poster Image */}
                <div className="md:col-span-1">
                    <div className="aspect-[2/3] relative bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg overflow-hidden shadow-xl">
                        {coverImage ? (
                            <Image
                                src={coverImage}
                                alt={title}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-gray-500 text-6xl">🎬</span>
                            </div>
                        )}
                        {/* Quality Badge */}
                        <div className="absolute top-3 right-3">
                            <div className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm">
                                {quality}
                            </div>
                        </div>
                    </div>
                    {/* Watch Button */}
                    <Link 
                        href={`/anime/${slug}/tap-1`}
                        className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        <span className="text-xl">▶️</span>
                        Xem Phim
                    </Link>
                </div>

                {/* Anime Details */}
                <div className="md:col-span-2 text-white space-y-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-red-500 mb-2">
                            {title}
                        </h1>
                        {originalTitle && (
                            <p className="text-gray-400 text-lg italic">{originalTitle}</p>
                        )}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {year && (
                            <div className="flex items-start">
                                <span className="text-red-500 font-semibold min-w-[120px]">Năm Phát Hành:</span>
                                <span className="text-gray-300">{year}</span>
                            </div>
                        )}
                        
                        {status && (
                            <div className="flex items-start">
                                <span className="text-red-500 font-semibold min-w-[120px]">Trạng Thái:</span>
                                <span className="text-gray-300">{status}</span>
                            </div>
                        )}

                        {totalEpisodes && (
                            <div className="flex items-start">
                                <span className="text-red-500 font-semibold min-w-[120px]">Số Tập:</span>
                                <span className="text-gray-300">{totalEpisodes} tập</span>
                            </div>
                        )}

                        {rating > 0 && (
                            <div className="flex items-start">
                                <span className="text-red-500 font-semibold min-w-[120px]">Đánh Giá:</span>
                                <span className="text-yellow-400 flex items-center gap-1">
                                    ⭐ {rating}/10
                                </span>
                            </div>
                        )}

                        {genres.length > 0 && (
                            <div className="flex items-start sm:col-span-2">
                                <span className="text-red-500 font-semibold min-w-[120px]">Thể Loại:</span>
                                <div className="flex flex-wrap gap-2">
                                    {genres.map((genre, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-700 px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors cursor-pointer"
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {director && (
                            <div className="flex items-start sm:col-span-2">
                                <span className="text-red-500 font-semibold min-w-[120px]">Đạo Diễn:</span>
                                <span className="text-gray-300">{director}</span>
                            </div>
                        )}

                        {cast.length > 0 && (
                            <div className="flex items-start sm:col-span-2">
                                <span className="text-red-500 font-semibold min-w-[120px]">Diễn Viên:</span>
                                <span className="text-gray-300">{cast.join(', ')}</span>
                            </div>
                        )}
                    </div>

                    {/* Quick Description */}
                    {description && (
                        <div className="pt-2">
                            <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                                {description}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition-colors">
                            ⭐ Đánh Giá
                        </button>
                        <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition-colors">
                            🔖 Lưu Lại
                        </button>
                        <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition-colors">
                            📤 Chia Sẻ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
