import { prisma } from '@/lib/prisma';
import ActorManager from '@/components/admin/crud/ActorManager';

export const metadata = { title: 'Quản lý Diễn Viên - Admin Panel' };

export default async function AdminActorsPage(props: {
    searchParams?: Promise<{ page?: string; q?: string }>;
}) {
    const searchParams = await props.searchParams;
    const page = parseInt(searchParams?.page || '1');
    const query = searchParams?.q?.trim() || '';
    const limit = 20;
    const skip = (page - 1) * limit;

    const where = query ? { name: { contains: query, mode: 'insensitive' as const } } : {};

    const [actors, total] = await Promise.all([
        prisma.actors.findMany({
            where,
            skip,
            take: limit,
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { story_actors: true } },
            },
        }),
        prisma.actors.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return (
        <ActorManager
            initialActors={actors}
            total={total}
            page={page}
            totalPages={totalPages}
            query={query}
        />
    );
}
