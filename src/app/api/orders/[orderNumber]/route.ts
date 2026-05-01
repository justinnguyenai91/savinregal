import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get single order by order number
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Đơn hàng không tồn tại' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order Detail API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update order status (admin)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const body = await request.json();
    const { status, trackingNumber, shippingProvider } = body;

    const order = await prisma.order.findUnique({ where: { orderNumber } });
    if (!order) {
      return NextResponse.json({ error: 'Đơn hàng không tồn tại' }, { status: 404 });
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipping', 'cancelled'],
      shipping: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (status && !validTransitions[order.status]?.includes(status)) {
      return NextResponse.json({
        error: `Không thể chuyển từ "${order.status}" sang "${status}"`,
      }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { orderNumber },
      data: {
        ...(status && { status }),
        ...(trackingNumber && { trackingNumber }),
        ...(shippingProvider && { shippingProvider }),
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Order Update API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
