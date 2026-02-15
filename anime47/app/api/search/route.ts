import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q')?.trim() || '';
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        const stories = await prisma.story.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { alternativeName: { contains: query, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                title: true,
                slug: true,
                coverImage: true,
                quality: true,
            },
            take: limit,
            orderBy: { views: 'desc' },
        });

        return NextResponse.json(stories);
    } catch (error: any) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: error.message || 'Search failed' },
            { status: 500 }
        );
    }
}
