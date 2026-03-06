import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/x-icon', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Allowed: JPG, PNG, WEBP, GIF, ICO, SVG' }, { status: 400 });
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create upload directory
        const uploadDir = path.join(process.cwd(), 'public', 'upload', 'logo');
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const ext = path.extname(file.name);
        const basename = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
        const filename = `${basename}_${Date.now()}${ext}`;
        const filePath = path.join(uploadDir, filename);
        console.log(`Saving file to: ${filePath}`);

        await writeFile(filePath, buffer);

        const url = `/upload/logo/${filename}`;
        console.log(`File saved. Accessible at: ${url}`);

        return NextResponse.json({ success: true, url, filename });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url || !url.startsWith('/upload/logo/')) {
            return NextResponse.json({ error: 'Invalid URL for deletion' }, { status: 400 });
        }

        const filename = path.basename(url);
        const filePath = path.join(process.cwd(), 'public', 'upload', 'logo', filename);

        try {
            await unlink(filePath);
        } catch (err: any) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: error.message || 'Delete failed' }, { status: 500 });
    }
}
