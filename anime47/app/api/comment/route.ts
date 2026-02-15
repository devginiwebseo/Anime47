import { NextRequest, NextResponse } from 'next/server';
import { commentService } from '@/modules/comment/comment.service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { storyId, author, content, rating } = body;

        if (!storyId || !author || !content) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get user IP
        const userIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';

        const comment = await commentService.addComment({
            storyId,
            author: author.trim(),
            content: content.trim(),
            userIp,
            rating: rating || undefined,
        });

        return NextResponse.json({
            success: true,
            comment,
        });
    } catch (error: any) {
        console.error('Error adding comment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to add comment' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const storyId = searchParams.get('storyId');
        const limit = searchParams.get('limit');

        if (!storyId) {
            return NextResponse.json(
                { error: 'Missing storyId' },
                { status: 400 }
            );
        }

        const comments = await commentService.getStoryComments(
            storyId,
            limit ? parseInt(limit) : undefined
        );

        return NextResponse.json(comments);
    } catch (error: any) {
        console.error('Error getting comments:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get comments' },
            { status: 500 }
        );
    }
}
