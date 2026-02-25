import { prisma } from '@/lib/prisma';
import AuthorManager from '@/components/admin/crud/AuthorManager';

export const metadata = { title: 'Quản lý Tác Giả - Admin Panel' };

export default async function AdminAuthorsPage(props: {
    searchParams?: Promise<{ page?: string; q?: string }>;
}) {
    const searchParams = await props.searchParams;
    const page = parseInt(searchParams?.page || '1');
    const query = searchParams?.q?.trim() || '';
    const limit = 20;
    const skip = (page - 1) * limit;

    const where = query ? { name: { contains: query, mode: 'insensitive' as const } } : {};

    const [authors, total] = await Promise.all([
        prisma.authors.findMany({
            where,
            skip,
            take: limit,
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { stories: true } },
            },
        }),
        prisma.authors.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return (
        <AuthorManager
            initialAuthors={authors}
            total={total}
            page={page}
            totalPages={totalPages}
            query={query}
        />
    );
}
