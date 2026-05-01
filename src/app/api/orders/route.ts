import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Create a new order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      items,
      customer,
      paymentMethod,
      note,
      couponCode,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Giỏ hàng trống' }, { status: 400 });
    }

    if (!customer?.name || !customer?.phone || !customer?.address) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin giao hàng' }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product || !product.inStock) {
        return NextResponse.json({ error: `Sản phẩm "${item.productName}" không khả dụng` }, { status: 400 });
      }

      let unitPrice = product.price;
      if (item.variantId) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (variant) unitPrice = variant.price;
      }

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    // Shipping fee from settings
    let freeThreshold = 2000000;
    let defaultShipFee = 30000;
    try {
      const settings = await prisma.setting.findMany({ where: { key: { in: ['shipping.freeThreshold', 'shipping.defaultFee'] } } });
      for (const s of settings) {
        if (s.key === 'shipping.freeThreshold') freeThreshold = parseInt(s.value) || 2000000;
        if (s.key === 'shipping.defaultFee') defaultShipFee = parseInt(s.value) || 30000;
      }
    } catch {}
    const shippingFee = subtotal >= freeThreshold ? 0 : defaultShipFee;

    // Coupon
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
          if (coupon.discountType === 'percentage') {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = coupon.discountValue;
          }
          // Update usage
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    const total = subtotal + shippingFee - discount;

    // Generate order number
    const orderNumber = `HM${Date.now().toString(36).toUpperCase()}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        guestName: customer.name,
        guestPhone: customer.phone,
        guestEmail: customer.email || null,
        guestAddress: `${customer.address}, ${customer.ward || ''}, ${customer.district || ''}, ${customer.province || ''}`,
        paymentMethod,
        subtotal,
        shippingFee,
        discount,
        total,
        note: note || null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    // TODO: Trigger payment gateway (VNPay/MoMo) if not COD
    // TODO: Send Telegram/email notification to admin
    // TODO: Forward to dropship supplier if applicable

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        paymentMethod: order.paymentMethod,
        status: order.status,
      },
      message: paymentMethod === 'cod'
        ? 'Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.'
        : 'Đơn hàng đã tạo. Vui lòng hoàn tất thanh toán.',
    });
  } catch (error) {
    console.error('Order API Error:', error);
    return NextResponse.json({ error: 'Lỗi tạo đơn hàng' }, { status: 500 });
  }
}

// Get orders (admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) where.status = status;

    // Date filter
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from + 'T00:00:00');
      if (to) where.createdAt.lte = new Date(to + 'T23:59:59');
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: {
            include: {
              product: { select: { name: true, slug: true } },
              variant: { select: { name: true } },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Orders List API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
