'use client';

import { useEffect, useState } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string | null;
  author: string;
  category: string | null;
  readTime: number;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  image: '',
  author: 'Admin',
  category: '',
  readTime: '5',
  isPublished: false,
};

const CATEGORIES = ['Sức Khỏe', 'Dinh Dưỡng', 'Thảo Dược', 'Làm Đẹp', 'Tin Tức'];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      params.set('limit', '50');
      const res = await fetch(`/api/admin/blog?${params}`);
      const data = await res.json();
      setPosts(data.posts || []);
      setTotal(data.pagination?.total || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [search, statusFilter, categoryFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setPreview(false);
    setShowForm(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image || '',
      author: post.author,
      category: post.category || '',
      readTime: String(post.readTime),
      isPublished: post.isPublished,
    });
    setError('');
    setPreview(false);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        readTime: parseInt(form.readTime) || 5,
      };
      const url = editing ? `/api/admin/blog/${editing.id}` : '/api/admin/blog';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Lỗi khi lưu'); setSaving(false); return; }
      setShowForm(false);
      fetchPosts();
    } catch { setError('Lỗi kết nối'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  const togglePublish = async (post: BlogPost) => {
    try {
      await fetch(`/api/admin/blog/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...post, isPublished: !post.isPublished }),
      });
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{color:'#111714',fontFamily:'var(--font-heading)'}}>
            {editing ? '✏️ Sửa bài viết' : '➕ Viết bài mới'}
          </h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{border:'1px solid #E8DDD0',color:'#6B7280'}}
            >
              {preview ? '✏️ Soạn thảo' : '👁️ Xem trước'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm transition-colors" style={{color:'#6B7280'}}>← Quay lại</button>
          </div>
        </div>

        {preview ? (
          <div className="admin-section" style={{padding:'2rem',maxWidth:'48rem',margin:'0 auto'}}>
            {form.image && <img src={form.image} alt={form.title} className="w-full h-56 object-cover rounded-xl mb-6" onError={e => (e.currentTarget.style.display='none')} />}
            <div className="flex gap-2 mb-3">
              {form.category && <span className="text-xs px-2 py-1 rounded-full font-medium" style={{background:'#F2EBE0',color:'#374151'}}>{form.category}</span>}
              <span className="text-xs" style={{color:'#9CA3AF'}}>{form.readTime} phút đọc</span>
            </div>
            <h2 className="text-3xl font-bold mb-3" style={{color:'#111714',fontFamily:'var(--font-heading)'}}>{form.title || 'Tiêu đề bài viết'}</h2>
            <p className="text-sm mb-6 italic" style={{color:'#6B7280'}}>{form.excerpt || 'Tóm tắt bài viết...'}</p>
            <div className="prose max-w-none text-sm leading-relaxed" style={{color:'#374151'}} dangerouslySetInnerHTML={{ __html: form.content || '<p><em>Nội dung bài viết...</em></p>' }} />
            <p className="text-xs mt-8" style={{color:'#9CA3AF'}}>Tác giả: {form.author}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-section space-y-5">
            {error && <div className="p-3 rounded-lg text-sm" style={{background:'#FEE2E2',color:'#DC2626'}}>{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" style={{color:'#374151'}}>Tiêu đề *</label>
                <input
                  type="text" required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{border:'1px solid #E8DDD0'}}
                  placeholder="VD: 10 Lợi ích của sâm Ngọc Linh"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{color:'#374151'}}>Slug (URL)</label>
                <input
                  type="text" value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-400"
                  placeholder="tu-dong-tao-tu-tieu-de"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{color:'#374151'}}>Tác giả *</label>
                <input
                  type="text" required value={form.author}
                  onChange={e => setForm({ ...form, author: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{border:'1px solid #E8DDD0'}}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{color:'#374151'}}>Danh mục</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{border:'1px solid #E8DDD0'}}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{color:'#374151'}}>Thời gian đọc (phút)</label>
                <input
                  type="number" min="1" max="60" value={form.readTime}
                  onChange={e => setForm({ ...form, readTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{border:'1px solid #E8DDD0'}}
                />
              </div>
              <div className="md:col-span-2">
                <ImageUpload
                  value={form.image}
                  onChange={(url) => setForm({ ...form, image: url as string })}
                  multiple={false}
                  label="Ảnh bìa bài viết"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" style={{color:'#374151'}}>Tóm tắt *</label>
                <textarea
                  required rows={3} value={form.excerpt}
                  onChange={e => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-emerald-400"
                  placeholder="Tóm tắt ngắn gọn về bài viết (hiển thị ở trang danh sách blog)..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5" style={{color:'#374151'}}>Nội dung *</label>
                <RichTextEditor
                  value={form.content}
                  onChange={(html) => setForm({ ...form, content: html })}
                  placeholder="Bắt đầu soạn nội dung bài viết..."
                  minHeight="400px"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} className="w-4 h-4" style={{accentColor:'#2C4A3E'}} />
                <span className="font-medium" style={{color:'#374151'}}>Xuất bản ngay</span>
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm" style={{color:'#6B7280'}}>Hủy</button>
                <button type="submit" disabled={saving} className="px-6 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-opacity hover:opacity-90" style={{ backgroundColor: '#2C4A3E' }}>
                  {saving ? 'Đang lưu...' : editing ? 'Cập Nhật' : 'Đăng Bài'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{color:'#111714',fontFamily:'var(--font-heading)'}}>Quản Lý Blog</h1>
          <p className="text-sm mt-1" style={{color:'#6B7280'}}>{total} bài viết</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 whitespace-nowrap"
          style={{ backgroundColor: '#2C4A3E' }}
        >
          ✍️ Viết bài mới
        </button>
      </div>

      {/* Filters */}
      <div className="admin-section flex flex-col sm:flex-row gap-3">
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Tìm kiếm tiêu đề, tác giả..."
          className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none" style={{border:'1px solid #E8DDD0'}}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg text-sm focus:outline-none" style={{border:'1px solid #E8DDD0'}}>
          <option value="">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-lg text-sm focus:outline-none" style={{border:'1px solid #E8DDD0'}}>
          <option value="">Tất cả danh mục</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng bài viết', value: total, color: '#2C4A3E' },
          { label: 'Đã xuất bản', value: posts.filter(p => p.isPublished).length, color: '#16a34a' },
          { label: 'Bản nháp', value: posts.filter(p => !p.isPublished).length, color: '#d97706' },
        ].map(s => (
          <div key={s.label} className="admin-stat-card text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{color:'#6B7280'}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="admin-section" style={{padding:0,overflow:'hidden'}}>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2C4A3E', borderTopColor: 'transparent' }} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16" style={{color:'#9CA3AF'}}>
            <p className="text-4xl mb-3">📝</p>
            <p className="font-medium">Chưa có bài viết nào</p>
            <p className="text-sm mt-1">Bắt đầu viết bài đầu tiên của bạn!</p>
            <button onClick={openCreate} className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: '#2C4A3E' }}>
              ✍️ Viết bài mới
            </button>
          </div>
        ) : (
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th className="text-left">Bài viết</th>
                <th className="text-left">Danh mục</th>
                <th className="text-left">Tác giả</th>
                <th className="text-center">Đọc</th>
                <th className="text-center">Trạng thái</th>
                <th className="text-left">Ngày tạo</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {post.image ? (
                        <img src={post.image} alt={post.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" onError={e => { e.currentTarget.style.display = 'none'; }} />
                      ) : (
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: '#FAF6EF' }}>
                          <img src="/placeholder.png" alt="" style={{width:'100%',height:'100%',objectFit:'contain'}} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-xs" style={{color:'#111714'}}>{post.title}</p>
                        <p className="text-xs truncate max-w-xs mt-0.5" style={{color:'#9CA3AF'}}>{post.excerpt}</p>
                        <p className="text-xs font-mono mt-0.5" style={{color:'#D1D5DB'}}>/{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {post.category ? (
                      <span className="text-xs px-2 py-1 rounded-full" style={{background:'#F2EBE0',color:'#374151'}}>{post.category}</span>
                    ) : (
                      <span className="text-xs" style={{color:'#D1D5DB'}}>—</span>
                    )}
                  </td>
                  <td style={{color:'#6B7280',fontSize:'0.875rem'}}>{post.author}</td>
                  <td style={{textAlign:'center',color:'#6B7280',fontSize:'0.875rem'}}>{post.readTime} phút</td>
                  <td style={{textAlign:'center'}}>
                    <button
                      onClick={() => togglePublish(post)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:opacity-80"
                      style={post.isPublished ? {background:'#DCFCE7',color:'#16A34A'} : {background:'#F3F4F6',color:'#6B7280'}}
                    >
                      <span>{post.isPublished ? '●' : '○'}</span>
                      {post.isPublished ? 'Xuất bản' : 'Nháp'}
                    </button>
                  </td>
                  <td style={{color:'#9CA3AF',fontSize:'0.75rem'}}>{formatDate(post.createdAt)}</td>
                  <td>
                    <div className="flex gap-1 justify-center">
                      <a href={`/blog/${post.slug}`} target="_blank" className="px-2 py-1 rounded text-xs" style={{color:'#6B7280'}} title="Xem">👁️</a>
                      <button onClick={() => openEdit(post)} className="px-2 py-1 rounded text-xs" style={{color:'#6B7280'}} title="Sửa">✏️</button>
                      <button onClick={() => setDeleteConfirm(post.id)} className="px-2 py-1 rounded text-xs" style={{color:'#DC2626'}} title="Xóa">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-2xl" style={{border:'1px solid #E8DDD0'}} onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-2" style={{color:'#111714'}}>⚠️ Xóa bài viết?</h3>
            <p className="text-sm mb-4" style={{color:'#6B7280'}}>Hành động này không thể hoàn tác. Bài viết sẽ bị xóa vĩnh viễn.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm" style={{color:'#6B7280'}}>Hủy</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{background:'#DC2626'}}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
