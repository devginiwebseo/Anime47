import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import AnimeCard from '@/components/home/AnimeCard';

import { Metadata } from 'next';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await props.params;
    const apiUrl = process.env.API_URL || 'https://anime.datatruyen.online';

    try {
        const res = await fetch(
            `${apiUrl}/api/public/directors?slug=${encodeURIComponent(slug)}&limit=1`,
            { next: { revalidate: 60 } }
        );
        if (res.ok) {
            const result = await res.json();
            const director = result.director;
            if (director) {
                return {
                    title: `Đạo diễn ${director.name} - Phim do ${director.name} đạo diễn | Anime47`,
                    description: director.bio ? `${director.bio.substring(0, 160)}...` : `Tuyển tập các anime đặc sắc do đạo diễn ${director.name} thực hiện, xem phim chất lượng FHD vietsub.`,
                    openGraph: {
                        images: director.avatarUrl ? [director.avatarUrl] : [],
                    }
                };
            }
        }
    } catch (e) {
        // ignore
    }

    return {
        title: 'Đạo diễn | Anime47',
    };
}

export default async function DirectorPage(props: { params: Promise<{ slug: string }> }) {
    const { slug } = await props.params;
    const apiUrl = process.env.API_URL || 'https://anime.datatruyen.online';

    const res = await fetch(
        `${apiUrl}/api/public/directors?slug=${encodeURIComponent(slug)}&limit=20&page=1`,
        { next: { revalidate: 60 } }
    );

    let result: { success: boolean; director?: any; data: any[] } = { success: false, data: [] };
    if (res.ok) {
        result = await res.json();
    }

    const director = result.director;

    if (!director || director.slug !== slug) {
        notFound();
    }

    const animeData = (result.data || []).map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        slug: movie.slug,
        coverImage: movie.coverImage || movie.thumbnail || undefined,
        rating: movie.averageRating || movie.rating || 0,
        quality: movie.quality || 'FHD',
        totalEpisodes: movie.totalEpisodes > 0 ? movie.totalEpisodes : undefined,
        currentEpisode: movie.latestChapter?.index || (movie.totalEpisodes > 0 ? movie.totalEpisodes : undefined),
        isNew: false,
        views: movie.views || 0,
    }));

    return (
        <div className="pt-[10px] md:pt-[30px] pb-12 px-2 md:px-4 lg:px-0 space-y-8">
            <div className="flex gap-2 text-sm text-gray-400 bg-gray-900 border border-gray-800 p-2 rounded-lg w-max">
                🏠 Anime47 <span className="text-gray-600">»</span> Đạo Diễn <span className="text-gray-600">»</span> <span className="text-white font-semibold">{director.name}</span>
            </div>

            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="w-48 h-64 shrink-0 relative bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 shadow-xl">
                        {director.avatarUrl ? (
                            <Image src={director.avatarUrl} alt={director.name} fill className="object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-gray-500 text-6xl">🎥</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <h1 className="text-4xl font-bold border-b border-gray-700 pb-4">{director.name}</h1>
                        <div className="text-gray-300 leading-relaxed text-sm">
                            {director.bio || 'Đang cập nhật tiểu sử đạo diễn...'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-l-4 border-primary pl-3">
                    Danh sách các phim tham gia đạo diễn
                </h2>
                {animeData.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {animeData.map((anime: any) => (
                            <AnimeCard key={anime.id} {...anime} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-800 rounded-lg p-12 text-center text-gray-400">
                        Chưa có phim nào trên hệ thống
                    </div>
                )}
            </div>
        </div>
    );
}
