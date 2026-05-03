import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get all products for admin (including unpublished)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
          variants: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { reviews: true, orderItems: true } },
        },
      }),
      prisma.product.count(),
    ]);

    const parsed = products.map(p => ({
      ...p,
      images: JSON.parse(p.images),
      badges: JSON.parse(p.badges),
      benefits: JSON.parse(p.benefits),
      ingredients: JSON.parse(p.ingredients),
      warnings: JSON.parse(p.warnings),
      certifications: JSON.parse(p.certifications),
    }));

    return NextResponse.json({ products: parsed, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Admin Products GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug || (() => {
          // Chuẩn hóa tiếng Việt: bỏ dấu → slug ASCII
          const base = body.name
            .normalize('NFD')                    // tách dấu ra khỏi ký tự
            .replace(/[\u0300-\u036f]/g, '')     // xóa dấu
            .replace(/[đĐ]/g, 'd')               // đ → d
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          // Thêm timestamp để đảm bảo unique
          return `${base}-${Date.now().toString(36)}`;
        })(),
        shortDescription: body.shortDescription || '',
        description: body.description || '',
        price: parseFloat(body.price),
        originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
        images: JSON.stringify(body.images || []),
        categoryId: body.categoryId,
        badges: JSON.stringify(body.badges || []),
        rating: parseFloat(body.rating) || 0,
        reviewCount: parseInt(body.reviewCount) || 0,
        inStock: body.inStock !== false,
        stockQuantity: parseInt(body.stockQuantity) || 0,
        benefits: JSON.stringify(body.benefits || []),
        ingredients: JSON.stringify(body.ingredients || []),
        usage: body.usage || null,
        warnings: JSON.stringify(body.warnings || []),
        certifications: JSON.stringify(body.certifications || []),
        origin: body.origin || null,
        isPublished: body.isPublished !== false,
      },
    });

    // Create variants if provided
    if (body.variants?.length > 0) {
      await prisma.productVariant.createMany({
        data: body.variants.map((v: { name: string; price: number; originalPrice?: number; inStock?: boolean; stockQuantity?: number }, i: number) => ({
          productId: product.id,
          name: v.name,
          price: parseFloat(String(v.price)),
          originalPrice: v.originalPrice ? parseFloat(String(v.originalPrice)) : null,
          inStock: v.inStock !== false,
          stockQuantity: parseInt(String(v.stockQuantity)) || 0,
          sortOrder: i + 1,
        })),
      });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Admin Product Create Error:', error);
    return NextResponse.json({ error: 'Lỗi tạo sản phẩm' }, { status: 500 });
  }
}
