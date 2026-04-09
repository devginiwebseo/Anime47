import { NextRequest, NextResponse } from 'next/server';
import { fetchExternalApi } from '@/lib/external-api';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q')?.trim() || '';
        const limit = parseInt(searchParams.get('limit') || '10');
        const page = parseInt(searchParams.get('page') || '1');

        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        const res = await fetchExternalApi(
            `/api/public/search?q=${encodeURIComponent(query)}&limit=${limit}&page=${page}`,
            {
                cache: 'no-cache',
                next: { revalidate: 0 },
            }
        );

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { error: data?.message || data?.error || 'Search failed' },
                { status: res.status }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: error.message || 'Search failed' },
            { status: 500 }
        );
    }
}
