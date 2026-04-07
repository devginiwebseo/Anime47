import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'Không tìm thấy file' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + '-' + file.name.replace(/\s+/g, '-');
        
        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'upload', 'pages');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // ignore
        }

        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        // Return the public URL
        const fileUrl = `/upload/pages/${filename}`;

        return NextResponse.json({ success: true, url: fileUrl });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ success: false, message: 'Lỗi server khi upload' }, { status: 500 });
    }
}
