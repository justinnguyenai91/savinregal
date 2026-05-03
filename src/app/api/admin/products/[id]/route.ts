import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Update product
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.slug && { slug: body.slug }),
        ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: parseFloat(body.price) }),
        ...(body.originalPrice !== undefined && { originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null }),
        ...(body.images && { images: JSON.stringify(body.images) }),
        ...(body.categoryId && { categoryId: body.categoryId }),
        ...(body.badges && { badges: JSON.stringify(body.badges) }),
        ...(body.inStock !== undefined && { inStock: body.inStock }),
        ...(body.stockQuantity !== undefined && { stockQuantity: parseInt(body.stockQuantity) }),
        ...(body.benefits && { benefits: JSON.stringify(body.benefits) }),
        ...(body.ingredients && { ingredients: JSON.stringify(body.ingredients) }),
        ...(body.usage !== undefined && { usage: body.usage }),
        ...(body.warnings && { warnings: JSON.stringify(body.warnings) }),
        ...(body.certifications && { certifications: JSON.stringify(body.certifications) }),
        ...(body.origin !== undefined && { origin: body.origin }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(body.rating !== undefined && { rating: parseFloat(body.rating) || 0 }),
        ...(body.reviewCount !== undefined && { reviewCount: parseInt(body.reviewCount) || 0 }),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Product Update Error:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật sản phẩm' }, { status: 500 });
  }
}

// Delete product
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.productVariant.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product Delete Error:', error);
    return NextResponse.json({ error: 'Lỗi xóa sản phẩm' }, { status: 500 });
  }
}
