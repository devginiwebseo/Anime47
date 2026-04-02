import React from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import AnimeDetailHeader from '@/components/detail/AnimeDetailHeader';
import EpisodeList from '@/components/detail/EpisodeList';
import AnimeDescription from '@/components/detail/AnimeDescription';
import CommentSection from '@/components/detail/CommentSection';
import RelatedAnime from '@/components/detail/RelatedAnime';
import AnimeHotList from '@/components/home/AnimeHotList';
import RankingBoardWrapper from '@/components/home/RankingBoardWrapper';
import { slugify } from '@/lib/helpers';

// Tạm giữ lại commentService vì bạn có thể chưa viết API riêng cho comments
import { commentService } from '@/modules/comment/comment.service';

export default async function AnimeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const apiUrl = process.env.API_URL || 'http://localhost:3000';

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

    // Format các thông tin phụ từ API
    const genres = story.genres ? story.genres.map((g: any) => g.name) : [];
    const chapters = story.chapters || [];
    
    // Parse cast from string to array
    const castArray = story.cast ? story.cast.split(',').map((c: string) => c.trim()) : [];

    // Lấy thông tin đạo diễn từ metaJson hoặc director
    let directors: { name: string, slug: string }[] = [];
    if (story.metaJson?.directors && Array.isArray(story.metaJson.directors)) {
        directors = story.metaJson.directors.map((d: any) => ({ name: d.name, slug: slugify(d.name) }));
    } else if (story.director) {
        directors = story.director.split(',').map((d: string) => d.trim()).filter(Boolean).map((name: string) => ({ name, slug: slugify(name) }));
    }

    // Lấy user IP để lọc bình luận (commentService)
    const headersList = await headers();
    const userIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';

    // Lấy comments
    const comments = await commentService.getStoryComments(story.id, 20, userIp, []);

    // Format episodes cho EpisodeList
    const episodeList = chapters.map((ch: any) => ({
        id: ch.id,
        number: ch.index,
        title: ch.title,
        isWatched: false,
    }));

    const description = story.description || 'Chưa có mô tả cho anime này.';

    // Fix relative URL for coverImage
    const formatImage = (url?: string) => {
        if (url && url.includes('/upload/')) {
            return url.substring(url.indexOf('/upload/'));
        }
        return url;
    };

    const formattedCover = formatImage(story.coverImage);

    // Fetch related animes bằng API mới, truyền theo genre đầu tiên của phim
    let relatedAnimes: any[] = [];
    if (story.genres && story.genres.length > 0) {
        const relatedRes = await fetch(`${apiUrl}/api/public/movies?limit=8&genre=${story.genres[0].slug}`, {
            next: { revalidate: 3600 }
        });
        if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            relatedAnimes = (relatedData.data || []).filter((s: any) => s.id !== story.id).map((s: any) => ({
                id: s.id,
                title: s.title,
                slug: s.slug,
                coverImage: formatImage(s.coverImage) || undefined,
                rating: s.rating || undefined,
                quality: s.quality || 'HD',
                totalEpisodes: s.totalEpisodes > 0 ? s.totalEpisodes : undefined,
                currentEpisode: s.latestChapter?.index,
                isNew: false,
            }));
        }
    }

    return (
        <div className="space-y-6">
            {/* Header with main info */}
            <AnimeDetailHeader
                title={story.title}
                slug={story.slug}
                originalTitle={story.alternativeName || undefined}
                year={story.releaseYear || undefined}
                coverImage={formattedCover || undefined}
                rating={Number(story.avgRating) || story.rating || undefined}
                status={story.status || 'Đang cập nhật'}
                totalEpisodes={chapters.length}
                quality={story.quality || 'HD'}
                genres={genres}
                directors={directors}
                cast={castArray}
                description={description}
                duration={story.duration || undefined}
                language={story.language || undefined}
                views={story.views || 0}
                storyId={story.id}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content - 8 columns */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Episode List */}
                    <EpisodeList
                        animeSlug={story.slug}
                        episodes={episodeList}
                        currentEpisode={undefined}
                    />

                    {/* Detailed Description */}
                    <AnimeDescription
                        title={story.title}
                        description={description}
                        plot={undefined}
                    />

                    {/* Comments */}
                    <CommentSection storyId={story.id} comments={comments} />
                </div>

                <aside className="lg:col-span-4 space-y-6">
                    <AnimeHotList title="ANIME HOT" />
                    <RankingBoardWrapper />
                </aside>
            </div>

            {/* Related Anime - Full Width */}
            {relatedAnimes.length > 0 && (
                <RelatedAnime animes={relatedAnimes} />
            )}
        </div>
    );
}
