import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import AnimeCard from '@/components/home/AnimeCard';
import { chapterService } from '@/modules/chapter/chapter.service';

export default async function ActorPage(props: { params: Promise<{ slug: string }> }) {
    const { slug } = await props.params;

    // Fetch actor
    const actor = await prisma.actors.findUnique({
        where: { slug },
        include: {
            story_actors: {
                include: {
                    stories: true
                }
            }
        }
    });

    if (!actor) {
        notFound();
    }

    // Process stories to get episodes count
    const animeData = await Promise.all(
        actor.story_actors.map(async (st) => {
            const story = st.stories;
            const totalEpisodes = await chapterService.countChapters(story.id);
            const latestChapter = await chapterService.getLatestChapter(story.id);

            return {
                id: story.id,
                title: story.title,
                slug: story.slug,
                coverImage: story.coverImage || undefined,
                rating: story.rating || undefined,
                quality: story.quality || 'HD',
                totalEpisodes: totalEpisodes > 0 ? totalEpisodes : undefined,
                currentEpisode: latestChapter?.index || undefined,
            };
        })
    );

    return (
        <div className="space-y-8">
            {/* Breadcrumb dummy */}
            <div className="flex gap-2 text-sm text-gray-400 bg-gray-900 border border-gray-800 p-2 rounded-lg w-max">
                🏠 Anime47 <span className="text-gray-600">»</span> Diễn Viên <span className="text-gray-600">»</span> <span className="text-white font-semibold">{actor.name}</span>
            </div>

            {/* Actor Profile */}
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="w-48 h-64 shrink-0 relative bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 shadow-xl">
                        {actor.avatarUrl ? (
                            <Image src={actor.avatarUrl} alt={actor.name} fill className="object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-gray-500 text-6xl">👤</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <h1 className="text-4xl font-bold border-b border-gray-700 pb-4">{actor.name}</h1>
                        <div className="text-gray-300 leading-relaxed text-sm">
                            {actor.bio ? actor.bio : 'Đang cập nhật tiểu sử diễn viên...'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Movies List */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary border-l-4 border-primary pl-3">
                    Phim của {actor.name}
                </h2>
                {animeData.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {animeData.map((anime) => (
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
