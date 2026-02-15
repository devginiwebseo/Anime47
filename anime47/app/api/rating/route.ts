import { NextRequest, NextResponse } from 'next/server';
import { ratingService } from '@/modules/rating/rating.service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { storyId, score } = body;

        if (!storyId || !score) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get user IP
        const userIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';

        const rating = await ratingService.addRating(storyId, userIp, score);
        const ratingInfo = await ratingService.getStoryRatingInfo(storyId);

        return NextResponse.json({
            success: true,
            rating,
            ratingInfo,
        });
    } catch (error: any) {
        console.error('Error adding rating:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to add rating' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const storyId = searchParams.get('storyId');

        if (!storyId) {
            return NextResponse.json(
                { error: 'Missing storyId' },
                { status: 400 }
            );
        }

        const ratingInfo = await ratingService.getStoryRatingInfo(storyId);

        return NextResponse.json(ratingInfo);
    } catch (error: any) {
        console.error('Error getting rating info:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get rating info' },
            { status: 500 }
        );
    }
}
