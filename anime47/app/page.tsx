import { prisma } from '@/lib/prisma';
import NewReleasesSection from '@/components/home/NewReleasesSection';
import ComingSoonSection from '@/components/home/ComingSoonSection';
import RecommendedSection from '@/components/home/RecommendedSection';
import AnimeHotList from '@/components/home/AnimeHotList';
import RankingBoardWrapper from '@/components/home/RankingBoardWrapper';
import CategorySection from '@/components/home/CategorySection';
import CompletedSection from '@/components/home/CompletedSection';
import IntroductionBlock from '@/components/home/IntroductionBlock';
import NoticeBlock from '@/components/home/NoticeBlock';
import UspBlock from '@/components/home/UspBlock';
import { Suspense } from 'react';

export const revalidate = 3600;

const defaultBlocks = [
    { id: 'default-new', type: 'NEW_RELEASES', isHidden: false, title: 'ANIME MOI CAP NHAT', numColumns: 5, limit: 20 },
    { id: 'default-soon', type: 'COMING_SOON', isHidden: false, title: 'ANIME SAP CHIEU', numColumns: 4, limit: 8 },
    { id: 'default-recommended', type: 'RECOMMENDED', isHidden: false, title: 'ANIME DE CU', numColumns: 4, limit: 8 },
    { id: 'default-hot', type: 'HOT', isHidden: false, title: 'ANIME HOT', limit: 10 },
    { id: 'default-ranking', type: 'RANKING', isHidden: false, title: 'BANG XEP HANG' },
];

export default async function Home() {
    let homepageSetting = null;

    try {
        homepageSetting = await prisma.settings.findUnique({ where: { key: 'homepage_blocks' } });
    } catch (error) {
        console.error('Failed to load homepage blocks, using defaults.', error);
    }

    const blocks = homepageSetting?.value ? (homepageSetting.value as any) : defaultBlocks;
    const validBlocks = blocks.filter((block: any) => !block.isHidden);
    const mainBlocks = validBlocks.filter((block: any) => block.type !== 'HOT' && block.type !== 'RANKING');
    const hotBlocks = validBlocks.filter((block: any) => block.type === 'HOT');
    const rankingBlocks = validBlocks.filter((block: any) => block.type === 'RANKING');

    const Fallback = () => <div className="h-64 animate-pulse bg-gray-800 rounded-xl" />;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-[10px] md:pt-[30px] pb-12 px-2 md:px-4 lg:px-0">
            <div className="lg:col-span-9 space-y-10 lg:space-y-16">
                {mainBlocks.map((block: any) => {
                    switch (block.type) {
                        case 'NEW_RELEASES':
                            return <Suspense key={block.id} fallback={<Fallback />}><NewReleasesSection title={block.title} limit={block.limit} numColumns={block.numColumns} /></Suspense>;
                        case 'COMING_SOON':
                            return <Suspense key={block.id} fallback={<Fallback />}><ComingSoonSection title={block.title} limit={block.limit} numColumns={block.numColumns} /></Suspense>;
                        case 'RECOMMENDED':
                            return <Suspense key={block.id} fallback={<Fallback />}><RecommendedSection title={block.title} limit={block.limit} numColumns={block.numColumns} /></Suspense>;
                        case 'COMPLETED':
                            return <Suspense key={block.id} fallback={<Fallback />}><CompletedSection title={block.title} limit={block.limit} numColumns={block.numColumns} /></Suspense>;
                        case 'CATEGORY':
                            return <Suspense key={block.id} fallback={<Fallback />}><CategorySection title={block.title} limit={block.limit} numColumns={block.numColumns} genreSlug={block.genreSlug} /></Suspense>;
                        case 'INTRODUCTION':
                            return <IntroductionBlock key={block.id} title={block.title} description={block.description} />;
                        case 'USP':
                            return <UspBlock key={block.id} title={block.title} subtitle={block.subtitle} items={block.items} />;
                        case 'NOTICE':
                            return <NoticeBlock key={block.id} content={block.content} alertType={block.alertType} showIcon={block.showIcon} textLink={block.textLink} urlLink={block.urlLink} />;
                        default:
                            return null;
                    }
                })}
            </div>

            <div className="lg:col-span-3 space-y-8">
                {hotBlocks.map((block: any) => (
                    <Suspense key={block.id} fallback={<div className="h-64 animate-pulse bg-gray-800 rounded-xl" />}>
                        <AnimeHotList title={block.title} limit={block.limit} />
                    </Suspense>
                ))}
                {rankingBlocks.map((block: any) => (
                    <Suspense key={block.id} fallback={<div className="h-64 animate-pulse bg-gray-800 rounded-xl" />}>
                        <RankingBoardWrapper title={block.title} />
                    </Suspense>
                ))}
            </div>
        </div>
    );
}
