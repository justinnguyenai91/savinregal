import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Endpoint này chỉ dùng trên VPS Docker, nhận upload được proxy từ Vercel
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Xác thực API key (server-to-server)
  const uploadKey = request.headers.get('x-upload-key');
  const expectedKey = process.env.UPLOAD_API_KEY;

  if (!expectedKey || uploadKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Không có file' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];
    const vpsBaseUrl = process.env.NEXTAUTH_URL || 'http://180.93.113.12:8080';

    for (const file of files) {
      if (!file || file.size === 0) continue;

      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = path.join(uploadDir, safeName);

      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      // Trả về URL tuyệt đối từ VPS để Vercel lưu vào DB
      urls.push(`${vpsBaseUrl}/uploads/${safeName}`);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('VPS Upload error:', error);
    return NextResponse.json({ error: 'Upload thất bại trên VPS' }, { status: 500 });
  }
}
