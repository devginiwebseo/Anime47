import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
    try {
        const { storyId } = await request.json();

        if (!storyId) {
            return NextResponse.json({ success: false, error: 'storyId is required' }, { status: 400 });
        }

        // Tăng views trong database
        const updatedStory = await prisma.stories.update({
            where: { id: storyId },
            data: {
                views: {
                    increment: 1
                }
            },
            select: { views: true }
        });

        return NextResponse.json({
            success: true,
            views: updatedStory.views
        });
    } catch (error: any) {
        logger.error('API Error: Failed to increment views', error);
        return NextResponse.json({ success: false, error: 'Failed to update views' }, { status: 500 });
    }
}
