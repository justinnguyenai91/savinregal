import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          where: { isVisible: true },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const parsed = {
      ...product,
      images: JSON.parse(product.images),
      badges: JSON.parse(product.badges),
      benefits: JSON.parse(product.benefits),
      ingredients: JSON.parse(product.ingredients),
      warnings: JSON.parse(product.warnings),
      certifications: JSON.parse(product.certifications),
    };

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Product Detail API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
