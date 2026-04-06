import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
    try {
        const { storyId } = await request.json();

        if (!storyId) {
            return NextResponse.json({ success: false, error: 'storyId is required' }, { status: 400 });
        }

        const apiUrl = (process.env.API_URL || 'https://api.animeez.online').replace(/\/$/, '');

        // Call External API via Server (Bypassing CORS)
        const res = await fetch(`${apiUrl}/api/public/view`, {
            method: 'POST',
            cache: 'no-cache',
            next: { revalidate: 0 },
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storyId }),
        });

        if (!res.ok) {
            const errorRes = await res.json().catch(() => ({}));
            throw new Error(errorRes.message || 'Failed to update views on main api');
        }

        const data = await res.json();

        return NextResponse.json({
            success: true,
            views: data.views || 0
        });
    } catch (error: any) {
        logger.error('API Error: Failed to increment views', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to update views' }, { status: 500 });
    }
}
