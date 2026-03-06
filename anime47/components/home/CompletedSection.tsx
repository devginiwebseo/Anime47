import React from 'react';
import AnimeCard from './AnimeCard';
import SectionHeader from './SectionHeader';
import SeeMoreButton from './SeeMoreButton';
import { prisma } from '@/lib/prisma';
import { chapterService } from '@/modules/chapter/chapter.service';

interface SectionProps {
    title: string;
    limit?: number;
    numColumns?: number;
}

export default async function CompletedSection({ title, limit = 10, numColumns = 5 }: SectionProps) {
    // Lấy stories đã hoàn thành
    const stories = await prisma.stories.findMany({
        where: {
            OR: [
                { status: 'completed' },
                { status: 'Hoàn thành' }
            ]
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            rating: true,
            quality: true,
        }
    });

    if (stories.length === 0) return null;

    const animeData = await Promise.all(
        stories.map(async (story) => {
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
                isNew: false,
            };
        })
    );

    return (
        <section className="mb-12">
            <SectionHeader title={title} icon="✅" />

            <div className="space-y-4">
                <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${Math.min(numColumns, 12)} gap-4`}>
                    {animeData.map((anime) => (
                        <AnimeCard key={anime.id} {...anime as any} />
                    ))}
                </div>
                <SeeMoreButton href="/danh-sach/hoan-thanh" />
            </div>
        </section>
    );
}
