'use client'

import React, { useState, useEffect } from 'react'
import { Input, Button, Space, Divider } from 'antd'
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  LinkOutlined,
  EyeOutlined,
  EditOutlined,
} from '@ant-design/icons'

const { TextArea } = Input

interface SimpleWysiwygEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
  disabled?: boolean
}

const SimpleWysiwygEditor: React.FC<SimpleWysiwygEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  height = 200,
  disabled = false
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [textValue, setTextValue] = useState(value || '')

  // Sync with external value changes
  useEffect(() => {
    setTextValue(value || '')
  }, [value])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setTextValue(newValue)
    onChange(newValue)
  }

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('simple-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textValue.substring(start, end)
    const newText = before + selectedText + after
    const newValue = textValue.substring(0, start) + newText + textValue.substring(end)

    setTextValue(newValue)
    onChange(newValue)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      )
    }, 0)
  }

  const wrapWithTag = (tag: string) => {
    insertText(`<${tag}>`, `</${tag}>`)
  }

  const insertList = (ordered: boolean) => {
    const tag = ordered ? 'ol' : 'ul'
    insertText(`<${tag}>\n<li>`, `</li>\n<li>Item 2</li>\n</${tag}>`)
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      insertText(`<a href="${url}">`, '</a>')
    }
  }

  const toolbarButtons = [
    { icon: <BoldOutlined />, onClick: () => wrapWithTag('strong'), title: 'Bold' },
    { icon: <ItalicOutlined />, onClick: () => wrapWithTag('em'), title: 'Italic' },
    { icon: <UnderlineOutlined />, onClick: () => wrapWithTag('u'), title: 'Underline' },
    { divider: true },
    { icon: <UnorderedListOutlined />, onClick: () => insertList(false), title: 'Bullet List' },
    { icon: <OrderedListOutlined />, onClick: () => insertList(true), title: 'Numbered List' },
    { divider: true },
    { icon: <LinkOutlined />, onClick: insertLink, title: 'Insert Link' },
  ]

  return (
    <div className="simple-wysiwyg-editor">
      <style jsx>{`
        .simple-wysiwyg-editor {
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          background-color: #fff;
          overflow: hidden;
        }

        .editor-toolbar {
          background-color: #fafafa;
          padding: 8px;
          border-bottom: 1px solid #d9d9d9;
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }

        .toolbar-button {
          background: none;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 12px;
          color: #595959;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 28px;
        }

        .toolbar-button:hover {
          background-color: #f5f5f5;
          border-color: #4096ff;
          color: #4096ff;
        }

        .toolbar-button.active {
          background-color: #4096ff;
          border-color: #4096ff;
          color: white;
        }

        .toolbar-divider {
          width: 1px;
          height: 16px;
          background-color: #d9d9d9;
          margin: 0 4px;
        }

        .editor-textarea {
          min-height: ${height}px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #262626;
          resize: vertical;
          border: none;
          padding: 12px;
        }

        .editor-textarea:focus {
          outline: none;
          box-shadow: none;
        }

        .editor-preview {
          min-height: ${height}px;
          padding: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #262626;
          overflow-y: auto;
          background-color: #fff;
        }

        .editor-preview h1 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }

        .editor-preview h2 {
          font-size: 1.3em;
          font-weight: bold;
          margin: 0.5em 0;
        }

        .editor-preview h3 {
          font-size: 1.1em;
          font-weight: bold;
          margin: 0.5em 0;
        }

        .editor-preview ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }

        .editor-preview ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }

        .editor-preview li {
          margin: 0.2em 0;
        }

        .editor-preview strong {
          font-weight: bold;
        }

        .editor-preview em {
          font-style: italic;
        }

        .editor-preview u {
          text-decoration: underline;
        }

        .editor-preview p {
          margin: 0.5em 0;
        }

        .editor-preview a {
          color: #4096ff;
          text-decoration: underline;
        }

        .editor-preview a:hover {
          color: #0958d9;
        }

        .editor-footer {
          padding: 4px 8px;
          background-color: #fafafa;
          border-top: 1px solid #d9d9d9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #8c8c8c;
        }

        .preview-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>

      {/* Toolbar */}
      <div className="editor-toolbar">
        {toolbarButtons.map((button, index) =>
          button.divider ? (
            <div key={`divider-${index}`} className="toolbar-divider" />
          ) : (
            <Button
              key={`button-${index}`}
              size="small"
              className="toolbar-button"
              icon={button.icon}
              onClick={button.onClick}
              title={button.title}
              disabled={disabled}
            />
          )
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Button
            size="small"
            type={isPreviewMode ? 'default' : 'primary'}
            icon={<EditOutlined />}
            onClick={() => setIsPreviewMode(false)}
            title="Edit"
          >
            Edit
          </Button>
          <Button
            size="small"
            type={isPreviewMode ? 'primary' : 'default'}
            icon={<EyeOutlined />}
            onClick={() => setIsPreviewMode(true)}
            title="Preview"
          >
            Preview
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      {!isPreviewMode ? (
        <TextArea
          id="simple-editor"
          className="editor-textarea"
          value={textValue}
          onChange={handleTextChange}
          placeholder={placeholder}
          disabled={disabled}
          style={{ minHeight: `${height}px`, border: 'none', resize: 'vertical' }}
        />
      ) : (
        <div
          className="editor-preview"
          dangerouslySetInnerHTML={{ __html: textValue || '<p style="color: #bfbfbf;">' + placeholder + '</p>' }}
        />
      )}

      {/* Footer */}
      <div className="editor-footer">
        <div className="preview-toggle">
          {isPreviewMode ? <EyeOutlined /> : <EditOutlined />}
          <span>{isPreviewMode ? 'Preview Mode' : 'Edit Mode'}</span>
        </div>
        <span>
          {textValue.length} characters | {textValue.split(/\s+/).filter(word => word.length > 0).length} words
        </span>
      </div>
    </div>
  )
}

export default SimpleWysiwygEditor