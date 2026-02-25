import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Lấy setting theo key
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const key = searchParams.get('key');

        if (key) {
            const setting = await prisma.settings.findUnique({ where: { key } });
            return NextResponse.json(setting?.value || null);
        }

        // Lấy tất cả settings
        const settings = await prisma.settings.findMany();
        const result: Record<string, any> = {};
        settings.forEach((s) => { result[s.key] = s.value; });
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Lưu settings
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { key, value } = body;

        if (!key) {
            return NextResponse.json({ error: 'Missing key' }, { status: 400 });
        }

        const setting = await prisma.settings.upsert({
            where: { key },
            create: {
                id: key,
                key,
                value,
                updatedAt: new Date(),
            },
            update: {
                value,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true, setting });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
