import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const count = await prisma.stories.count();
        if (count === 0) {
            return NextResponse.json({ error: 'No anime found' }, { status: 404 });
        }

        const skip = Math.floor(Math.random() * count);
        const randomAnime = await prisma.stories.findFirst({
            skip: skip,
            select: {
                slug: true
            }
        });

        if (!randomAnime) {
            return NextResponse.json({ error: 'Failed to pick random anime' }, { status: 500 });
        }

        return NextResponse.json({ slug: randomAnime.slug });
    } catch (error: any) {
        console.error('Random anime error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
