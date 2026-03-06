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

export const revalidate = 3600; // Tự động làm mới dữ liệu trang chủ mỗi 1 tiếng (3600 giây)

export default async function Home() {
    // Lấy config các khối trang chủ
    const homepageSetting = await prisma.settings.findUnique({ where: { key: 'homepage_blocks' } });

    // Tạo Default Layout như ban đầu nếu Admin chưa thiết lập
    let blocks = homepageSetting?.value ? (homepageSetting.value as any) : null;

    if (!blocks) {
        blocks = [
            { id: 'default-new', type: 'NEW_RELEASES', isHidden: false, title: 'ANIME MỚI CẬP NHẬT', numColumns: 5, limit: 20 },
            { id: 'default-soon', type: 'COMING_SOON', isHidden: false, title: 'ANIME SẮP CHIẾU', numColumns: 4, limit: 8 },
            { id: 'default-recommended', type: 'RECOMMENDED', isHidden: false, title: 'ANIME ĐỀ CỬ', numColumns: 4, limit: 8 },
            { id: 'default-hot', type: 'HOT', isHidden: false, title: 'ANIME HOT', limit: 10 },
            { id: 'default-ranking', type: 'RANKING', isHidden: false, title: 'BẢNG XẾP HẠNG' }
        ];
    }

    // Render linh động theo Cấu hình
    const validBlocks = blocks.filter((b: any) => !b.isHidden);

    // Tách riêng các khối chính và sidebar
    const mainBlocks = validBlocks.filter((b: any) => b.type !== 'HOT' && b.type !== 'RANKING');
    const hotBlocks = validBlocks.filter((b: any) => b.type === 'HOT');
    const rankingBlocks = validBlocks.filter((b: any) => b.type === 'RANKING');

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

                {/* Fix: Nếu admin chưa add vào danh sách, nhưng user vẫn muốn default có ở sidebar? 
                    Tuy nhiên hiện tại ta đang theo logic Admin quản lý. 
                    Nếu danh sách trống, ta có thể hiển thị mặc định nếu bạn muốn. 
                */}
            </div>
        </div>
    );
}
