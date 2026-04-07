import React from 'react';
import { notFound } from 'next/navigation';
import VideoPlayer from '@/components/watch/VideoPlayer';
import EpisodeNavigation from '@/components/watch/EpisodeNavigation';
import WatchEpisodeList from '@/components/watch/WatchEpisodeList';
import WatchRelatedAnime from '@/components/watch/WatchRelatedAnime';
import AnimeHotList from '@/components/home/AnimeHotList';
import RankingBoardWrapper from '@/components/home/RankingBoardWrapper';

interface WatchPageProps {
    params: Promise<{
        slug: string;
        episode: string;
    }>;
}

export default async function WatchPage({ params }: WatchPageProps) {
    const { slug, episode } = await params;
    // Extract episode number from params (e.g., "tap-2" -> 2)
    const episodeNumber = parseInt(episode.replace('tap-', ''));

    if (isNaN(episodeNumber) || episodeNumber < 1) {
        notFound();
    }

    const apiUrl = process.env.API_URL || 'https://anime.datatruyen.online/';

    // Fetch story data từ API
    const res = await fetch(`${apiUrl}/api/public/movies/${slug}`, {
        next: { revalidate: 3600 }
    });

    if (!res.ok) {
        notFound();
    }

    const { data: story } = await res.json();

    if (!story) {
        notFound();
    }

    // Fetch chapters/episodes từ property `chapters` của API
    const chapters = story.chapters || [];

    if (!chapters || chapters.length === 0) {
        notFound();
    }

    // Find current episode
    const currentChapter = chapters.find((ch: any) => ch.index === episodeNumber);

    if (!currentChapter) {
        notFound();
    }

    const currentEpisode = episodeNumber;
    const totalEpisodes = chapters.length;
    const hasNextEpisode = currentEpisode < totalEpisodes;
    const hasPrevEpisode = currentEpisode > 1;

    // Video URL - use chapter's sourceUrl (primary) or videoUrl (fallback)
    const videoUrl = currentChapter.sourceUrl || currentChapter.videoUrl || '';

    if (!videoUrl) {
        console.error('No video URL found for this episode');
    }

    // Format episodes for list
    const episodeList = chapters.map((ch: any) => ({
        id: ch.id,
        number: ch.index,
        title: ch.title,
    }));

    // Fix relative URL for coverImage local
    const formatImage = (url?: string) => {
        if (url && url.includes('/upload/')) {
            const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
            return `${baseUrl}${url.substring(url.indexOf('/upload/'))}`;
        }
        return url;
    };
    const formattedCover = formatImage(story.coverImage);

    // Fetch related anime
    let relatedAnimes: any[] = [];
    if (story.genres && story.genres.length > 0) {
        const relatedRes = await fetch(`${apiUrl}/api/public/movies?limit=6&genre=${story.genres[0].slug}`, {
            next: { revalidate: 3600 }
        });
        if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            relatedAnimes = (relatedData.data || []).filter((s: any) => s.id !== story.id).map((s: any) => ({
                id: s.id,
                title: s.title,
                slug: s.slug,
                coverImage: formatImage(s.coverImage) || undefined,
                rating: s.averageRating || undefined,
                quality: s.quality || 'HD',
                currentEpisode: s.latestChapter?.index,
                totalEpisodes: s.totalEpisodes > 0 ? s.totalEpisodes : undefined,
            }));
        }
    }

    return (
        <div className="space-y-6 lg:container lg:mx-auto">
            {/* Video Player Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content - 8 columns */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Navigation Controls */}
                    <div className="px-4 md:px-0">
                        <EpisodeNavigation
                            animeTitle={story.title}
                            animeSlug={story.slug}
                            currentEpisode={currentEpisode}
                            totalEpisodes={totalEpisodes}
                            hasNextEpisode={hasNextEpisode}
                            hasPrevEpisode={hasPrevEpisode}
                        />
                    </div>

                    {/* Video Player */}
                    <div className="w-full">
                        {videoUrl ? (
                            <VideoPlayer
                                videoUrl={videoUrl}
                                title={`${story.title} - Tập ${currentEpisode}`}
                                animeSlug={story.slug}
                                currentEpisode={currentEpisode}
                                totalEpisodes={totalEpisodes}
                                storyId={story.id}
                                poster={formattedCover || undefined}
                            />
                        ) : (
                            <div className="bg-gray-800 rounded-lg p-8 text-center mx-4 md:mx-0">
                                <p className="text-red-500 text-lg">Không có video</p>
                                <p className="text-gray-400 mt-2">Hiện chưa có link xem cho tập này</p>
                            </div>
                        )}
                    </div>

                    {/* Episode List */}
                    <div className="px-4 md:px-0">
                        <WatchEpisodeList
                            animeSlug={story.slug}
                            episodes={episodeList}
                            currentEpisode={currentEpisode}
                        />
                    </div>
                </div>

                {/* Sidebar - 4 columns */}
                <aside className="lg:col-span-4 space-y-6 px-4 md:px-0">
                    <WatchRelatedAnime animes={relatedAnimes} />
                    <AnimeHotList title="ANIME HOT" />
                    <RankingBoardWrapper />
                </aside>
            </div>
        </div>
    );
}
