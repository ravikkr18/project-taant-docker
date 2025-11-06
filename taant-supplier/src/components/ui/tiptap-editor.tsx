'use client'

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { Button, Space } from 'antd'
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
} from '@ant-design/icons'

interface TiptapEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  height = 200
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Remove duplicate underline if StarterKit includes it
        underline: false,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        style: `height: ${height}px; overflow-y: auto;`,
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    immediatelyRender: false,
  })

  if (!editor) {
    return null
  }

  return (
    <div className="tiptap-editor">
      {/* Toolbar */}
      <div className="editor-toolbar" style={{
        borderBottom: '1px solid #d9d9d9',
        padding: '8px',
        marginBottom: '8px',
        backgroundColor: '#fafafa',
        borderRadius: '4px 4px 0 0'
      }}>
        <Space size="small">
          <Button
            size="small"
            type={editor.isActive('bold') ? 'primary' : 'default'}
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          />
          <Button
            size="small"
            type={editor.isActive('italic') ? 'primary' : 'default'}
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          />
          <Button
            size="small"
            type={editor.isActive('underline') ? 'primary' : 'default'}
            icon={<UnderlineOutlined />}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          />
          <Button
            size="small"
            type={editor.isActive('bulletList') ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          />
          <Button
            size="small"
            type={editor.isActive('orderedList') ? 'primary' : 'default'}
            icon={<OrderedListOutlined />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
          />
          <Button
            size="small"
            type={editor.isActive('textAlign', 'left') ? 'primary' : 'default'}
            icon={<AlignLeftOutlined />}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Align Left"
          />
          <Button
            size="small"
            type={editor.isActive('textAlign', 'center') ? 'primary' : 'default'}
            icon={<AlignCenterOutlined />}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Align Center"
          />
          <Button
            size="small"
            type={editor.isActive('textAlign', 'right') ? 'primary' : 'default'}
            icon={<AlignRightOutlined />}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Align Right"
          />
        </Space>
      </div>

      {/* Editor */}
      <div className="editor-content" style={{
        border: '1px solid #d9d9d9',
        borderTop: 'none',
        borderRadius: '0 0 4px 4px',
        padding: '12px',
        minHeight: `${height}px`,
        backgroundColor: '#fff'
      }}>
        <EditorContent
          editor={editor}
          placeholder={placeholder}
        />
      </div>

      <style jsx>{`
        .tiptap-editor :global(.ProseMirror) {
          outline: none;
          padding: 8px;
          min-height: ${height - 40}px;
        }

        .tiptap-editor :global(.ProseMirror p.is-editor-empty:first-child::before) {
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          color: #aaa;
        }

        .tiptap-editor :global(.ProseMirror h1) {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }

        .tiptap-editor :global(.ProseMirror h2) {
          font-size: 1.3em;
          font-weight: bold;
          margin: 0.5em 0;
        }

        .tiptap-editor :global(.ProseMirror h3) {
          font-size: 1.1em;
          font-weight: bold;
          margin: 0.5em 0;
        }

        .tiptap-editor :global(.ProseMirror ul) {
          list-style-type: disc;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }

        .tiptap-editor :global(.ProseMirror ol) {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }

        .tiptap-editor :global(.ProseMirror li) {
          margin: 0.2em 0;
        }

        .tiptap-editor :global(.ProseMirror strong) {
          font-weight: bold;
        }

        .tiptap-editor :global(.ProseMirror em) {
          font-style: italic;
        }

        .tiptap-editor :global(.ProseMirror u) {
          text-decoration: underline;
        }

        .tiptap-editor :global(.ProseMirror p) {
          margin: 0.5em 0;
          line-height: 1.5;
        }

        .tiptap-editor :global(.ProseMirror:focus) {
          outline: none;
        }
      `}</style>
    </div>
  )
}

export default TiptapEditor