import { fetchExternalApi } from '@/lib/external-api';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const res = await fetchExternalApi('/api/public/random', {
            cache: 'no-store'
        });

        if (!res.ok) {
            return NextResponse.json(
                { success: false, error: 'Upstream random API failed' },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy random error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
