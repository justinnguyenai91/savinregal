'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { useCallback, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// Toolbar button component
function ToolBtn({ active, onClick, title, children, disabled }: {
  active?: boolean; onClick: () => void; title: string; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="rte-btn"
      style={{
        background: active ? '#2C4A3E' : 'transparent',
        color: active ? '#FFFFFF' : '#374151',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div style={{ width: '1px', height: '20px', background: '#E8DDD0', margin: '0 4px' }} />;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Bắt đầu soạn thảo...', minHeight = '300px' }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'rte-link' } }),
      Image.configure({ HTMLAttributes: { class: 'rte-image' } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rte-content',
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value]);

  const addImage = useCallback(async (files: FileList) => {
    if (!editor || !files.length) return;
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('files', f));
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.urls) {
        data.urls.forEach((url: string) => {
          editor.chain().focus().setImage({ src: url }).run();
        });
      }
    } catch (e) { console.error('Image upload failed', e); }
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Nhập URL:', 'https://');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rte-wrapper">
      {/* Toolbar */}
      <div className="rte-toolbar">
        {/* Text formatting */}
        <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Đậm (Ctrl+B)">
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Nghiêng (Ctrl+I)">
          <em>I</em>
        </ToolBtn>
        <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Gạch chân (Ctrl+U)">
          <span style={{ textDecoration: 'underline' }}>U</span>
        </ToolBtn>
        <ToolBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Gạch ngang">
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </ToolBtn>
        <ToolBtn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Tô sáng">
          <span style={{ background: '#FBBF24', padding: '0 3px', borderRadius: '2px' }}>H</span>
        </ToolBtn>

        <Separator />

        {/* Headings */}
        <ToolBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Tiêu đề 1">
          H1
        </ToolBtn>
        <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Tiêu đề 2">
          H2
        </ToolBtn>
        <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Tiêu đề 3">
          H3
        </ToolBtn>

        <Separator />

        {/* Lists */}
        <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Danh sách chấm">
          •≡
        </ToolBtn>
        <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Danh sách số">
          1.≡
        </ToolBtn>

        <Separator />

        {/* Alignment */}
        <ToolBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Căn trái">
          ≡←
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Căn giữa">
          ≡↔
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Căn phải">
          →≡
        </ToolBtn>

        <Separator />

        {/* Insert */}
        <ToolBtn onClick={addLink} active={editor.isActive('link')} title="Chèn liên kết">
          🔗
        </ToolBtn>
        <ToolBtn onClick={() => fileInputRef.current?.click()} title="Chèn ảnh">
          🖼️
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Chèn bảng">
          📊
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
          {'</>'}
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Đường kẻ ngang">
          ─
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Trích dẫn">
          ❝
        </ToolBtn>

        {/* Table controls - show when inside a table */}
        {editor.isActive('table') && (
          <>
            <Separator />
            <ToolBtn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Thêm cột">+Col</ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().addRowAfter().run()} title="Thêm hàng">+Row</ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().deleteColumn().run()} title="Xóa cột">-Col</ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().deleteRow().run()} title="Xóa hàng">-Row</ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().deleteTable().run()} title="Xóa bảng">🗑️</ToolBtn>
          </>
        )}
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => { if (e.target.files) addImage(e.target.files); e.target.value = ''; }}
      />


      <div style={{ padding: '6px 12px', fontSize: '11px', color: '#9CA3AF', borderTop: '1px solid #E8DDD0' }}>
        {editor.storage.characterCount?.characters?.() ?? editor.getText().length} ký tự
      </div>
    </div>
  );
}
