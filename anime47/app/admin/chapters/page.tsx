import { prisma } from '@/lib/prisma';
import ChapterManager from '@/components/admin/crud/ChapterManager';

export const metadata = { title: 'Quản lý Tập Phim - Admin Panel' };

export default async function AdminChaptersPage(props: {
    searchParams?: Promise<{ page?: string; q?: string }>;
}) {
    const searchParams = await props.searchParams;
    const page = parseInt(searchParams?.page || '1');
    const query = searchParams?.q?.trim() || '';
    const limit = 20;
    const skip = (page - 1) * limit;

    const where = query
        ? {
            OR: [
                { title: { contains: query, mode: 'insensitive' as const } },
                { stories: { title: { contains: query, mode: 'insensitive' as const } } },
            ],
        }
        : {};

    const [chapters, total] = await Promise.all([
        prisma.chapters.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                stories: { select: { title: true, slug: true } },
            },
        }),
        prisma.chapters.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return (
        <ChapterManager
            initialChapters={chapters as any}
            total={total}
            page={page}
            totalPages={totalPages}
            query={query}
        />
    );
}
