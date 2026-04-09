import { NextRequest, NextResponse } from 'next/server';
import { fetchExternalApi } from '@/lib/external-api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const search = request.nextUrl.searchParams.toString();
        const path = search ? `/api/public/genres?${search}` : '/api/public/genres';

        const res = await fetchExternalApi(path, {
            cache: 'no-store',
        });

        const data = await res.json();

        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Proxy genres error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
