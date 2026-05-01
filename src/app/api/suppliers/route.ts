import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get all suppliers
export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      include: {
        products: {
          include: {
            product: { select: { name: true, slug: true, price: true } },
          },
        },
        _count: { select: { orders: true } },
      },
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Suppliers API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create supplier
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contactName, phone, email, address, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Tên nhà cung cấp là bắt buộc' }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: { name, contactName, phone, email, address, notes },
    });

    return NextResponse.json({ success: true, supplier });
  } catch (error) {
    console.error('Supplier Create Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
