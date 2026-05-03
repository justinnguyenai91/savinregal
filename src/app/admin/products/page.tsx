'use client';

import { useEffect, useState } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice: number | null;
  images: string[];
  badges: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  isPublished: boolean;
  origin: string | null;
  usage: string | null;
  benefits: string[];
  ingredients: { name: string; amount: string; description: string }[];
  warnings: string[];
  certifications: string[];
  category: { id: string; name: string; slug: string };
  variants: { id: string; name: string; price: number; originalPrice: number | null; inStock: boolean; stockQuantity: number }[];
  _count: { reviews: number; orderItems: number };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const emptyForm = {
    name: '', slug: '', shortDescription: '', description: '',
    price: '', originalPrice: '', categoryId: '',
    stockQuantity: '100', badges: [] as string[], benefits: [''],
    ingredients: [{ name: '', amount: '', description: '' }],
    usage: '', warnings: [''], certifications: [''],
    origin: 'Kon Tum, Việt Nam', isPublished: true,
    images: [] as string[],
    variants: [] as { name: string; price: string; originalPrice: string; stockQuantity: string }[],
    rating: '0', reviewCount: '0',
  };

  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/categories'),
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData.products || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreateForm = () => {
    setEditingProduct(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id || '' });
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      categoryId: product.category.id,
      stockQuantity: String(product.stockQuantity),
      badges: product.badges,
      benefits: product.benefits.length > 0 ? product.benefits : [''],
      ingredients: product.ingredients.length > 0 ? product.ingredients : [{ name: '', amount: '', description: '' }],
      usage: product.usage || '',
      warnings: product.warnings.length > 0 ? product.warnings : [''],
      certifications: product.certifications.length > 0 ? product.certifications : [''],
      origin: product.origin || 'Kon Tum, Việt Nam',
      isPublished: product.isPublished,
      images: product.images || [],
      variants: product.variants.map(v => ({
        name: v.name, price: String(v.price),
        originalPrice: v.originalPrice ? String(v.originalPrice) : '',
        stockQuantity: String(v.stockQuantity),
      })),
      rating: String(product.rating ?? 0),
      reviewCount: String(product.reviewCount ?? 0),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
        stockQuantity: parseInt(form.stockQuantity),
        benefits: form.benefits.filter(b => b.trim()),
        warnings: form.warnings.filter(w => w.trim()),
        certifications: form.certifications.filter(c => c.trim()),
        ingredients: form.ingredients.filter(i => i.name.trim()),
        images: form.images,
        rating: parseFloat(form.rating) || 0,
        reviewCount: parseInt(form.reviewCount) || 0,
        variants: form.variants.filter(v => v.name.trim()).map(v => ({
          name: v.name,
          price: parseFloat(v.price),
          originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
          stockQuantity: parseInt(v.stockQuantity) || 0,
        })),
      };

      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowForm(false);
        fetchData();
      }
    } catch (err) {
      console.error('Save error:', err);
    }
    setSaving(false);
  };

  const handleDelete = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteConfirm(null);
        fetchData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const updateListItem = (field: 'benefits' | 'warnings' | 'certifications', index: number, value: string) => {
    const arr = [...form[field]];
    arr[index] = value;
    setForm({ ...form, [field]: arr });
  };

  const addListItem = (field: 'benefits' | 'warnings' | 'certifications') => {
    setForm({ ...form, [field]: [...form[field], ''] });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 rounded-full animate-spin" style={{ borderColor: '#1a3c34', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {editingProduct ? `✏️ Sửa: ${editingProduct.name}` : '➕ Thêm Sản Phẩm Mới'}
          </h1>
          <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700">← Quay lại</button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="tu-dong-tao" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn *</label>
                <input type="text" value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5" style={{color:'#374151'}}>Mô tả chi tiết</label>
                <RichTextEditor
                  value={form.description}
                  onChange={(html) => setForm({ ...form, description: html })}
                  placeholder="Mô tả đầy đủ về sản phẩm..."
                  minHeight="250px"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="font-semibold mb-4" style={{color:'#111714',fontFamily:'var(--font-heading)'}}>Hình ảnh sản phẩm</h3>
            <ImageUpload
              value={form.images}
              onChange={(urls) => setForm({ ...form, images: urls as string[] })}
              multiple={true}
              label="Upload hình ảnh sản phẩm (nhiều ảnh)"
            />
          </div>

          {/* Pricing */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Giá & Tồn kho</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (₫) *</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc (₫)</label>
                <input type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Để trống nếu không giảm giá" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn kho</label>
                <input type="number" value={form.stockQuantity} onChange={e => setForm({ ...form, stockQuantity: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {/* Badges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Badges</label>
            <div className="flex gap-3">
              {['bestseller', 'new', 'sale', 'limited'].map(badge => (
                <label key={badge} className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" checked={form.badges.includes(badge)} onChange={e => {
                    setForm({ ...form, badges: e.target.checked ? [...form.badges, badge] : form.badges.filter(b => b !== badge) });
                  }} className="accent-emerald-600" />
                  {badge === 'bestseller' ? 'Bán chạy' : badge === 'new' ? 'Mới' : badge === 'sale' ? 'Sale' : 'Giới hạn'}
                </label>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Công dụng</label>
            {form.benefits.map((b, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={b} onChange={e => updateListItem('benefits', i, e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="VD: Tăng cường hệ miễn dịch" />
                {form.benefits.length > 1 && (
                  <button type="button" onClick={() => setForm({ ...form, benefits: form.benefits.filter((_, j) => j !== i) })} className="text-red-400 text-sm px-2">✕</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addListItem('benefits')} className="text-xs text-emerald-600 font-medium">+ Thêm công dụng</button>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">🌿 Thành phần hoạt chất</label>
              <button type="button" onClick={() => setForm({ ...form, ingredients: [...form.ingredients, { name: '', amount: '', description: '' }] })} className="text-xs text-emerald-600 font-medium">+ Thêm thành phần</button>
            </div>
            <div className="space-y-2">
              {form.ingredients.map((ing, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={e => { const arr = [...form.ingredients]; arr[i] = { ...arr[i], name: e.target.value }; setForm({ ...form, ingredients: arr }); }}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="Tên (VD: Saponin)"
                  />
                  <input
                    type="text"
                    value={ing.amount}
                    onChange={e => { const arr = [...form.ingredients]; arr[i] = { ...arr[i], amount: e.target.value }; setForm({ ...form, ingredients: arr }); }}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="Hàm lượng (VD: 52mg)"
                  />
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={ing.description}
                      onChange={e => { const arr = [...form.ingredients]; arr[i] = { ...arr[i], description: e.target.value }; setForm({ ...form, ingredients: arr }); }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Mô tả tác dụng"
                    />
                    {form.ingredients.length > 1 && (
                      <button type="button" onClick={() => setForm({ ...form, ingredients: form.ingredients.filter((_, j) => j !== i) })} className="text-red-400 text-sm px-2">✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usage & Warnings */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📖 Hướng dẫn sử dụng</label>
              <textarea
                value={form.usage}
                onChange={e => setForm({ ...form, usage: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                placeholder="VD: Ngày dùng 1-2 lần, mỗi lần 2-3g. Dùng với nước ấm hoặc ngậm trực tiếp..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">⚠️ Lưu ý / Cảnh báo</label>
              {form.warnings.map((w, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input type="text" value={w} onChange={e => updateListItem('warnings', i, e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="VD: Không dùng cho phụ nữ có thai" />
                  {form.warnings.length > 1 && (
                    <button type="button" onClick={() => setForm({ ...form, warnings: form.warnings.filter((_, j) => j !== i) })} className="text-red-400 text-sm px-2">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addListItem('warnings')} className="text-xs text-emerald-600 font-medium">+ Thêm lưu ý</button>
            </div>
          </div>

          {/* Rating & Reviews */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">⭐ Đánh giá</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Điểm trung bình (0–5)</label>
                <input
                  type="number"
                  min="0" max="5" step="0.1"
                  value={form.rating}
                  onChange={e => setForm({ ...form, rating: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="VD: 4.9"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng đánh giá</label>
                <input
                  type="number"
                  min="0"
                  value={form.reviewCount}
                  onChange={e => setForm({ ...form, reviewCount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="VD: 127"
                />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Biến thể (tuỳ chọn)</label>
              <button type="button" onClick={() => setForm({ ...form, variants: [...form.variants, { name: '', price: '', originalPrice: '', stockQuantity: '50' }] })} className="text-xs text-emerald-600 font-medium">+ Thêm biến thể</button>
            </div>
            {form.variants.map((v, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                <input type="text" value={v.name} onChange={e => { const vs = [...form.variants]; vs[i].name = e.target.value; setForm({ ...form, variants: vs }); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Tên (VD: 50g)" />
                <input type="number" value={v.price} onChange={e => { const vs = [...form.variants]; vs[i].price = e.target.value; setForm({ ...form, variants: vs }); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Giá bán" />
                <input type="number" value={v.originalPrice} onChange={e => { const vs = [...form.variants]; vs[i].originalPrice = e.target.value; setForm({ ...form, variants: vs }); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Giá gốc" />
                <div className="flex gap-1">
                  <input type="number" value={v.stockQuantity} onChange={e => { const vs = [...form.variants]; vs[i].stockQuantity = e.target.value; setForm({ ...form, variants: vs }); }} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="SL" />
                  <button type="button" onClick={() => setForm({ ...form, variants: form.variants.filter((_, j) => j !== i) })} className="text-red-400 text-sm px-2">✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Publish */}
          <div className="flex items-center justify-between pt-4 border-t">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} className="accent-emerald-600" />
              Xuất bản
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Hủy</button>
              <button type="submit" disabled={saving} className="px-6 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: '#d4af37' }}>
                {saving ? 'Đang lưu...' : editingProduct ? 'Cập Nhật' : 'Tạo Sản Phẩm'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{color:'#111714',fontFamily:'var(--font-heading)'}}>Quản Lý Sản Phẩm</h1>
          <p className="text-sm mt-1" style={{color:'#6B7280'}}>{products.length} sản phẩm</p>
        </div>
        <button onClick={openCreateForm} className="px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90" style={{ backgroundColor: '#2C4A3E' }}>
          ➕ Thêm sản phẩm
        </button>
      </div>

      <div className="admin-section" style={{padding:0,overflow:'hidden'}}>
        <table className="w-full admin-table">
          <thead>
            <tr>
              <th className="text-left">Sản phẩm</th>
              <th className="text-left">Danh mục</th>
              <th className="text-left">Giá</th>
              <th className="text-center">Tồn kho</th>
              <th className="text-center">Đánh giá</th>
              <th className="text-center">Đã bán</th>
              <th className="text-center">Trạng thái</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center" style={{ background: '#FAF6EF', border: '1px solid #E8DDD0' }}>
                      {(() => {
                        const imgUrl = product.images?.[0];
                        const src = imgUrl
                          ? (imgUrl.startsWith('http') ? `/_next/image?url=${encodeURIComponent(imgUrl)}&w=96&q=75` : imgUrl)
                          : '/placeholder.png';
                        return <img src={src} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e => { (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }} />;
                      })()}
                    </div>
                    <div>
                      <p className="text-sm font-medium max-w-56 truncate" style={{color:'#111714'}}>{product.name}</p>
                      <div className="flex gap-1 mt-0.5">
                        {product.badges.map(badge => (
                          <span key={badge} className="text-xs px-1.5 py-0.5 rounded-full" style={{
                            backgroundColor: badge === 'bestseller' ? '#dcfce7' : badge === 'sale' ? '#fee2e2' : '#dbeafe',
                            color: badge === 'bestseller' ? '#16a34a' : badge === 'sale' ? '#dc2626' : '#2563eb',
                          }}>
                            {badge === 'bestseller' ? 'Bán chạy' : badge === 'sale' ? 'Sale' : badge === 'new' ? 'Mới' : badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
                <td><span className="text-xs px-2 py-1 rounded-full" style={{background:'#F2EBE0',color:'#374151'}}>{product.category.name}</span></td>
                <td>
                  <p className="text-sm font-semibold" style={{ color: '#C4956A' }}>{formatCurrency(product.price)}</p>
                  {product.originalPrice && <p className="text-xs line-through" style={{color:'#9CA3AF'}}>{formatCurrency(product.originalPrice)}</p>}
                </td>
                <td style={{textAlign:'center'}}>
                  <span className="text-sm font-medium" style={{color: product.stockQuantity < 10 ? '#DC2626' : '#374151'}}>{product.stockQuantity}</span>
                </td>
                <td style={{textAlign:'center'}}>
                  <div className="flex items-center justify-center gap-1">
                    <span style={{color:'#D97706'}}>★</span>
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs" style={{color:'#9CA3AF'}}>({product._count.reviews})</span>
                  </div>
                </td>
                <td style={{textAlign:'center',color:'#6B7280',fontSize:'0.875rem'}}>{product._count.orderItems}</td>
                <td style={{textAlign:'center'}}>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" style={{
                    background: product.isPublished ? '#DCFCE7' : '#F3F4F6',
                    color: product.isPublished ? '#16A34A' : '#6B7280'
                  }}>{product.isPublished ? 'Xuất bản' : 'Ẩn'}</span>
                </td>
                <td style={{textAlign:'center'}}>
                  <div className="flex gap-1 justify-center">
                    <a href={`/san-pham/${product.slug}`} target="_blank" className="px-2 py-1 rounded text-xs transition-colors" style={{color:'#6B7280'}} onMouseEnter={e=>(e.currentTarget.style.background='#FAF6EF')} onMouseLeave={e=>(e.currentTarget.style.background='')}>👁️</a>
                    <button onClick={() => openEditForm(product)} className="px-2 py-1 rounded text-xs transition-colors" style={{color:'#6B7280'}} onMouseEnter={e=>(e.currentTarget.style.background='#FAF6EF')} onMouseLeave={e=>(e.currentTarget.style.background='')}>✏️</button>
                    <button onClick={() => setDeleteConfirm(product.id)} className="px-2 py-1 rounded text-xs transition-colors" style={{color:'#EF4444'}} onMouseEnter={e=>(e.currentTarget.style.background='#FEE2E2')} onMouseLeave={e=>(e.currentTarget.style.background='')}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-2">⚠️ Xóa sản phẩm?</h3>
            <p className="text-sm text-gray-500 mb-4">Hành động này không thể hoàn tác. Sản phẩm và tất cả biến thể sẽ bị xóa vĩnh viễn.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-500">Hủy</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
