import { NextRequest, NextResponse } from 'next/server';

// Proxy ảnh từ VPS HTTP → Vercel HTTPS, tránh mixed content và remotePatterns issues
export const runtime = 'nodejs';

const ALLOWED_HOSTS = ['180.93.113.12'];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url param', { status: 400 });
  }

  // Chỉ cho phép fetch từ VPS của chúng ta
  try {
    const parsed = new URL(url);
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return new NextResponse('Host not allowed', { status: 403 });
    }
  } catch {
    return new NextResponse('Invalid url', { status: 400 });
  }

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 1 ngày
    if (!res.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const blob = await res.arrayBuffer();
    const contentType = res.headers.get('Content-Type') || 'image/jpeg';

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch {
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}
