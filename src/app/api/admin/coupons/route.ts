import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// List coupons
export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Coupons GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create coupon
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        description: body.description || null,
        discountType: body.discountType || 'percentage',
        discountValue: parseFloat(body.discountValue),
        maxDiscount: body.maxDiscount ? parseFloat(body.maxDiscount) : null,
        minOrderAmount: body.minOrderAmount ? parseFloat(body.minOrderAmount) : null,
        usageLimit: body.usageLimit ? parseInt(body.usageLimit) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error('Coupon Create Error:', error);
    return NextResponse.json({ error: 'Lỗi tạo mã giảm giá' }, { status: 500 });
  }
}
