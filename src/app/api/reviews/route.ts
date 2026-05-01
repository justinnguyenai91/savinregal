import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get reviews for a product
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where: { productId, isVisible: true },
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { productId, isVisible: true } }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { productId, isVisible: true },
        _count: { rating: true },
      }),
    ]);

    // Calculate average rating
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    let totalCount = 0;
    stats.forEach(s => {
      ratingDistribution[s.rating] = s._count.rating;
      totalRating += s.rating * s._count.rating;
      totalCount += s._count.rating;
    });

    return NextResponse.json({
      reviews: reviews.map(r => ({
        ...r,
        images: JSON.parse(r.images),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: {
        averageRating: totalCount > 0 ? (totalRating / totalCount).toFixed(1) : '0',
        totalReviews: totalCount,
        distribution: ratingDistribution,
      },
    });
  } catch (error) {
    console.error('Reviews API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Post a review
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, userId, rating, content } = body;

    if (!productId || !userId || !rating || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1-5' }, { status: 400 });
    }

    // Check if user has purchased this product (verified review)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: 'delivered',
        },
      },
    });

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        content,
        verified: !!hasPurchased,
      },
      include: { user: { select: { name: true } } },
    });

    // Update product rating stats
    const aggregation = await prisma.review.aggregate({
      where: { productId, isVisible: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: aggregation._avg.rating || 0,
        reviewCount: aggregation._count.rating,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Review POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
