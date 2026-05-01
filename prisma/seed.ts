import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { hash } from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ===== CATEGORIES =====
  const catSam = await prisma.category.create({
    data: { name: 'Sâm Ngọc Linh', slug: 'sam-ngoc-linh', description: 'Sâm Ngọc Linh tươi và khô chính hãng từ Kon Tum', sortOrder: 1 },
  });
  const catTPCN = await prisma.category.create({
    data: { name: 'Thực Phẩm Chức Năng', slug: 'thuc-pham-chuc-nang', description: 'Viên nang, bột sâm và các sản phẩm chiết xuất', sortOrder: 2 },
  });
  const catRuou = await prisma.category.create({
    data: { name: 'Rượu Sâm', slug: 'ruou-sam', description: 'Rượu sâm Ngọc Linh ngâm thượng hạng', sortOrder: 3 },
  });
  const catTra = await prisma.category.create({
    data: { name: 'Trà & Mật Ong', slug: 'tra-mat-ong', description: 'Trà sâm, mật ong rừng nguyên chất', sortOrder: 4 },
  });

  console.log('✅ Categories created');

  // ===== PRODUCTS =====
  const samTuoi = await prisma.product.create({
    data: {
      name: 'Sâm Ngọc Linh Tươi Tự Nhiên 10 Năm Tuổi',
      slug: 'sam-ngoc-linh-tuoi-tu-nhien-10-nam',
      shortDescription: 'Sâm Ngọc Linh tươi tự nhiên, thu hoạch từ rừng nguyên sinh Kon Tum, 10 năm tuổi.',
      description: 'Sâm Ngọc Linh (Panax vietnamensis) là loại sâm quý hiếm bậc nhất.',
      price: 85000000, originalPrice: 95000000,
      images: JSON.stringify(['/images/products/sam-tuoi-1.jpg']),
      categoryId: catSam.id,
      badges: JSON.stringify(['bestseller', 'limited']),
      rating: 4.9, reviewCount: 127, inStock: true, stockQuantity: 15,
      benefits: JSON.stringify(['Tăng cường hệ miễn dịch', 'Hỗ trợ phục hồi sức khỏe', 'Cải thiện trí nhớ']),
      ingredients: JSON.stringify([{ name: 'Saponin', amount: '12-15%', description: 'Hoạt chất chính' }]),
      usage: 'Dùng 2-3 lát sâm tươi/ngày.',
      warnings: JSON.stringify(['Không dùng cho phụ nữ mang thai']),
      certifications: JSON.stringify(['Chỉ dẫn địa lý Kon Tum', 'GACP-WHO']),
      origin: 'Kon Tum, Việt Nam',
    },
  });

  await prisma.productVariant.createMany({
    data: [
      { productId: samTuoi.id, name: '50g (1 củ)', price: 85000000, inStock: true, stockQuantity: 10, sortOrder: 1 },
      { productId: samTuoi.id, name: '100g (2-3 củ)', price: 160000000, inStock: true, stockQuantity: 5, sortOrder: 2 },
    ],
  });

  await prisma.product.create({
    data: {
      name: 'Viên Nang Sâm Ngọc Linh Premium',
      slug: 'vien-nang-sam-ngoc-linh-premium',
      shortDescription: 'Viên nang chiết xuất Sâm Ngọc Linh cô đặc.',
      description: 'Viên nang Sâm Ngọc Linh Premium.',
      price: 2500000, originalPrice: 3000000,
      images: JSON.stringify(['/images/products/vien-nang-1.jpg']),
      categoryId: catTPCN.id,
      badges: JSON.stringify(['bestseller', 'sale']),
      rating: 4.8, reviewCount: 89, inStock: true, stockQuantity: 50,
      benefits: JSON.stringify(['Tiện lợi sử dụng hàng ngày', 'Tăng cường sức đề kháng']),
      ingredients: JSON.stringify([{ name: 'Chiết xuất Sâm Ngọc Linh', amount: '500mg/viên', description: 'Chuẩn hóa 10% saponin' }]),
      usage: 'Uống 2 viên/ngày sau bữa ăn sáng.',
      certifications: JSON.stringify(['ISO 22000', 'GMP']),
      origin: 'Kon Tum, Việt Nam',
    },
  });

  await prisma.product.create({
    data: {
      name: 'Trà Sâm Ngọc Linh Túi Lọc',
      slug: 'tra-sam-ngoc-linh-tui-loc',
      shortDescription: 'Trà sâm Ngọc Linh tiện lợi dạng túi lọc.',
      description: 'Trà sâm Ngọc Linh túi lọc được chế biến từ lá và thân sâm.',
      price: 450000,
      images: JSON.stringify(['/images/products/tra-sam-1.jpg']),
      categoryId: catTra.id,
      badges: JSON.stringify(['new', 'bestseller']),
      rating: 4.5, reviewCount: 56, inStock: true, stockQuantity: 80,
      benefits: JSON.stringify(['Giảm stress, thư giãn', 'Hỗ trợ giấc ngủ']),
      ingredients: JSON.stringify([{ name: 'Lá sâm Ngọc Linh', amount: '60%', description: 'Sấy khô tự nhiên' }]),
      usage: 'Hãm 1 túi với 200ml nước nóng 80-90°C.',
      certifications: JSON.stringify(['ISO 22000']),
      origin: 'Kon Tum, Việt Nam',
    },
  });

  console.log('✅ Products created');

  // ===== BLOG POSTS =====
  await prisma.blogPost.createMany({
    data: [
      {
        title: 'Cách Phân Biệt Sâm Ngọc Linh Thật - Giả',
        slug: 'cach-phan-biet-sam-ngoc-linh-that-gia',
        excerpt: 'Hướng dẫn chi tiết cách nhận biết sâm Ngọc Linh chính hãng.',
        content: 'Nội dung chi tiết về cách phân biệt sâm Ngọc Linh thật giả...',
        author: 'Savin Regal', category: 'Kiến Thức', readTime: 8,
        isPublished: true, publishedAt: new Date('2026-04-20'),
      },
      {
        title: '10 Công Dụng Tuyệt Vời Của Sâm Ngọc Linh',
        slug: '10-cong-dung-sam-ngoc-linh',
        excerpt: 'Tổng hợp 10 công dụng nổi bật đã được khoa học chứng minh.',
        content: 'Nội dung chi tiết về công dụng sâm Ngọc Linh...',
        author: 'Savin Regal', category: 'Sức Khỏe', readTime: 12,
        isPublished: true, publishedAt: new Date('2026-04-15'),
      },
    ],
  });

  console.log('✅ Blog posts created');

  // ===== ADMIN USER =====
  const hashedPassword = await hash('admin123', 12);
  await prisma.user.create({
    data: {
      email: 'admin@savinregal.vn',
      name: 'Savin Regal Admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin user created (admin@savinregal.vn / admin123)');
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
