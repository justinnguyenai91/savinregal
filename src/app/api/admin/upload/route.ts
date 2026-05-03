import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Dùng nodejs runtime để hỗ trợ fs và upload file lớn
export const runtime = 'nodejs';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const maxSize = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Không có file được chọn' }, { status: 400 });
    }

    // Validate files trước
    for (const file of files) {
      if (!file || file.size === 0) {
        return NextResponse.json({ error: 'File rỗng hoặc không hợp lệ' }, { status: 400 });
      }
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Định dạng không hỗ trợ: ${file.type}. Chỉ chấp nhận: JPG, PNG, WebP, GIF` },
          { status: 400 }
        );
      }
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File "${file.name}" quá lớn (${(file.size / 1024 / 1024).toFixed(1)}MB). Tối đa 10MB` },
          { status: 400 }
        );
      }
    }

    // ── Chế độ Vercel: proxy sang VPS ──
    const uploadServerUrl = process.env.UPLOAD_SERVER_URL;
    if (uploadServerUrl) {
      const proxyForm = new FormData();
      for (const file of files) {
        proxyForm.append('files', file);
      }

      const res = await fetch(`${uploadServerUrl}/api/admin/upload-vps`, {
        method: 'POST',
        headers: {
          'x-upload-key': process.env.UPLOAD_API_KEY || '',
        },
        body: proxyForm,
      });

      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    // ── Chế độ VPS/local: lưu vào disk ──
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = path.join(uploadDir, safeName);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Trả về URL tự VPS media nginx (port 8081) để Vercel lưu vào DB
      const vpsBaseUrl = process.env.VPS_MEDIA_URL || 'http://180.93.113.12:8081';
      urls.push(`${vpsBaseUrl}/uploads/${safeName}`);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload thất bại';
    return NextResponse.json({ error: `Lỗi server: ${message}` }, { status: 500 });
  }
}
