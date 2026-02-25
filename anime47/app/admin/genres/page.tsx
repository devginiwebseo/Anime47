import { prisma } from '@/lib/prisma';
import GenreManager from '@/components/admin/crud/GenreManager';

export const metadata = { title: 'Quản lý Thể Loại - Admin Panel' };

export default async function AdminGenresPage() {
    const genres = await prisma.genres.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: { select: { story_genres: true } },
        },
    });

    return (
        <GenreManager initialGenres={genres} />
    );
}
