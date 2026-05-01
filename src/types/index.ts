// ===== PRODUCT TYPES =====
export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  categorySlug: string;
  badges: ('bestseller' | 'new' | 'sale' | 'limited')[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  variants?: ProductVariant[];
  benefits: string[];
  ingredients: Ingredient[];
  usage: string;
  warnings: string[];
  certifications: string[];
  origin: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
}

export interface Ingredient {
  name: string;
  amount: string;
  description: string;
}

// ===== CART TYPES =====
export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

// ===== REVIEW TYPES =====
export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
  images?: string[];
  verified: boolean;
}

// ===== ORDER TYPES =====
export interface Order {
  id: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'vnpay' | 'momo' | 'cod' | 'transfer';
  status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
  total: number;
  shippingFee: number;
  discount: number;
  trackingNumber?: string;
  createdAt: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address: string;
}

// ===== CATEGORY TYPES =====
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

// ===== BLOG TYPES =====
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  publishedAt: string;
  category: string;
  readTime: number;
}

// ===== TESTIMONIAL TYPES =====
export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  role: string;
  content: string;
  rating: number;
}
