import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const apiUrl = (process.env.API_URL || 'https://anime.datatruyen.online').replace(/\/$/, '');

        // Forward to external API to bypass CORS
        const res = await fetch(`${apiUrl}/api/public/comment`, {
            method: 'POST',
            cache: 'no-cache',
            next: { revalidate: 0 },
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json(data, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Proxy Error adding comment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to add comment via proxy' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const apiUrl = (process.env.API_URL || 'https://anime.datatruyen.online').replace(/\/$/, '');

        // Redirect to external API via Server
        const externalRes = await fetch(`${apiUrl}/api/public/comment?${searchParams.toString()}`, {
            method: 'GET',
            cache: 'no-cache',
            next: { revalidate: 0 },
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await externalRes.json();
        if (!externalRes.ok) {
            return NextResponse.json(data, { status: externalRes.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Proxy Error getting comments:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get comments via proxy' },
            { status: 500 }
        );
    }
}
