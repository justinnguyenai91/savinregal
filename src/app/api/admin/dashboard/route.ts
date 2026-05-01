import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Dashboard statistics endpoint
export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      pendingOrders,
      monthlyOrders,
      lastMonthOrders,
      monthlyRevenue,
      lastMonthRevenue,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.product.count({ where: { isPublished: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'customer' } }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: startOfLastMonth, lt: startOfMonth },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          paymentStatus: 'paid',
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfLastMonth, lt: startOfMonth },
          paymentStatus: 'paid',
        },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          items: {
            include: {
              product: { select: { name: true } },
            },
          },
        },
      }),
      prisma.product.findMany({
        where: { stockQuantity: { lt: 10 }, isPublished: true },
        select: { name: true, slug: true, stockQuantity: true },
      }),
    ]);

    const currentRevenue = monthlyRevenue._sum.total || 0;
    const prevRevenue = lastMonthRevenue._sum.total || 0;
    const revenueGrowth = prevRevenue > 0
      ? (((currentRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)
      : '0';

    const orderGrowth = lastMonthOrders > 0
      ? (((monthlyOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1)
      : '0';

    return NextResponse.json({
      overview: {
        totalProducts,
        totalOrders,
        totalCustomers,
        pendingOrders,
      },
      monthly: {
        orders: monthlyOrders,
        orderGrowth: `${orderGrowth}%`,
        revenue: currentRevenue,
        revenueGrowth: `${revenueGrowth}%`,
      },
      recentOrders: recentOrders.map(o => ({
        orderNumber: o.orderNumber,
        status: o.status,
        total: o.total,
        createdAt: o.createdAt,
        items: o.items.map(i => i.product.name).join(', '),
      })),
      alerts: {
        lowStock: lowStockProducts,
        pendingOrders,
      },
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
