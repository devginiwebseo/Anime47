import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import MovieManager from '@/components/admin/crud/MovieManager';

export const metadata = { title: 'Quản lý Phim - Admin Panel' };

export default async function AdminMoviesPage(props: {
    searchParams?: Promise<{ page?: string; q?: string }>;
}) {
    const searchParams = await props.searchParams;
    const page = parseInt(searchParams?.page || '1');
    const query = searchParams?.q?.trim() || '';
    const limit = 15;
    const skip = (page - 1) * limit;

    const where = query
        ? {
            OR: [
                { title: { contains: query, mode: 'insensitive' as const } },
                { slug: { contains: query, mode: 'insensitive' as const } },
            ],
        }
        : {};

    const [movies, total] = await Promise.all([
        prisma.stories.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                authors: { select: { name: true } },
                _count: { select: { chapters: true, comments: true } },
            },
        }),
        prisma.stories.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return (
        <MovieManager
            initialMovies={movies as any}
            total={total}
            page={page}
            totalPages={totalPages}
            query={query}
        />
    );
}
