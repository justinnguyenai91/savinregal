import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Default settings
const DEFAULTS: Record<string, string> = {
  'store.name': 'Savin Regal',
  'store.phone': '0901 690 470',
  'store.email': 'savin.regal@gmail.com',
  'store.address': 'Kon Tum, Việt Nam',
  'store.description': 'Dược liệu quý từ núi rừng Ngọc Linh',
  'social.facebook': '',
  'social.zalo': '',
  'social.instagram': '',
  'social.tiktok': '',
  'shipping.freeThreshold': '500000',
  'shipping.defaultFee': '30000',
  'seo.title': 'Savin Regal — Dược Liệu Núi Rừng Ngọc Linh',
  'seo.description': 'Sâm Ngọc Linh chính hãng, thực phẩm chức năng cao cấp từ Kon Tum. Giao hàng toàn quốc.',
  'seo.keywords': 'sâm ngọc linh, dược liệu, kon tum, thực phẩm chức năng',
};

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const result: Record<string, string> = { ...DEFAULTS };

    for (const s of settings) {
      result[s.key] = s.value;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(DEFAULTS);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Upsert each setting
    const promises = Object.entries(body).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );

    await Promise.all(promises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
