import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const filePathParam = searchParams.get('path');

    if (!filePathParam) {
        return new NextResponse('File path is required', { status: 400 });
    }

    try {
        // Prevent path traversal attacks
        const cleanPath = filePathParam.replace(/\.\./g, '');
        const absolutePath = path.join(process.cwd(), 'public', 'upload', cleanPath);

        if (!fs.existsSync(absolutePath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        const fileBuffer = fs.readFileSync(absolutePath);
        
        // Determine content type
        let contentType = 'image/jpeg';
        if (absolutePath.endsWith('.png')) contentType = 'image/png';
        if (absolutePath.endsWith('.gif')) contentType = 'image/gif';
        if (absolutePath.endsWith('.webp')) contentType = 'image/webp';
        if (absolutePath.endsWith('.svg')) contentType = 'image/svg+xml';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (e) {
        console.error("Error serving media:", e);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
