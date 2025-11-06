'use client'

import React, { useState } from 'react'
import {
  Button,
  Card,
  Input,
  Upload,
  Space,
  Typography,
  Image,
  message,
  Popconfirm,
  Row,
  Col,
  Select,
  Divider,
  Modal,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  CameraOutlined,
  FormatPainterOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
} from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import TiptapEditor from '../ui/tiptap-editor'

interface APlusSection {
  id: string
  type: 'text' | 'image_text' | 'text_image'
  title?: string
  content: string
  image?: string
  position: number
  formatting?: {
    bold?: boolean
    italic?: boolean
    underline?: boolean
    align?: 'left' | 'center' | 'right'
    listType?: 'none' | 'bullet' | 'number'
  }
}

interface APlusContentManagerProps {
  sections: APlusSection[]
  onChange: (sections: APlusSection[]) => void
}

const APlusContentManager: React.FC<APlusContentManagerProps> = ({ sections, onChange }) => {
  const [editingSection, setEditingSection] = useState<APlusSection | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string>('')

  // Add new section
  const addSection = (type: 'text' | 'image_text' | 'text_image') => {
    const newSection: APlusSection = {
      id: `temp-${Date.now()}`,
      type,
      title: '',
      content: '',
      position: sections.length,
      formatting: {
        bold: false,
        italic: false,
        underline: false,
        align: 'left',
        listType: 'none'
      }
    }
    onChange([...sections, newSection])
    message.success(`${type.replace('_', ' ')} section added`)
  }

  // Remove section
  const removeSection = (id: string) => {
    onChange(sections.filter(section => section.id !== id))
    message.success('Section removed')
  }

  // Update section
  const updateSection = (id: string, field: keyof APlusSection, value: any) => {
    onChange(sections.map(section =>
      section.id === id ? { ...section, [field]: value } : section
    ))
  }

  // Update section formatting
  const updateFormatting = (id: string, formatting: APlusSection['formatting']) => {
    onChange(sections.map(section =>
      section.id === id ? { ...section, formatting } : section
    ))
  }

  // Format text selection with list
  const formatSelectionAsList = (sectionId: string, listType: 'bullet' | 'number') => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    const textarea = document.querySelector(`textarea[data-section-id="${sectionId}"]`) as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = section.content.substring(start, end)

    if (selectedText) {
      let formattedText: string
      if (listType === 'bullet') {
        formattedText = selectedText.split('\n').map(line => `• ${line}`).join('\n')
      } else {
        formattedText = selectedText.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n')
      }

      const newContent = section.content.substring(0, start) + formattedText + section.content.substring(end)
      updateSection(sectionId, 'content', newContent)

      // Update formatting
      updateFormatting(sectionId, { ...section.formatting, listType })

      // Restore cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start, start + formattedText.length)
      }, 100)
    } else {
      // Apply list formatting to entire content
      updateFormatting(sectionId, { ...section.formatting, listType })
    }
  }

  // Handle image upload for sections
  const handleImageUpload = (sectionId: string) => (file: any) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('You can only upload image files!')
      return false
    }

    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!')
      return false
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    updateSection(sectionId, 'image', previewUrl)
    message.success('Image uploaded to section')

    return false // Prevent automatic upload
  }

  // Text formatting toolbar
  const FormattingToolbar = ({ sectionId, formatting }: { sectionId: string; formatting: APlusSection['formatting'] }) => (
    <Space size="small" style={{ marginBottom: 8, padding: 8, background: '#f5f5f5', borderRadius: 4, flexWrap: 'wrap' }}>
      <Button
        size="small"
        type={formatting?.bold ? 'primary' : 'default'}
        icon={<BoldOutlined />}
        onClick={() => updateFormatting(sectionId, { ...formatting, bold: !formatting?.bold })}
        title="Bold"
      />
      <Button
        size="small"
        type={formatting?.italic ? 'primary' : 'default'}
        icon={<ItalicOutlined />}
        onClick={() => updateFormatting(sectionId, { ...formatting, italic: !formatting?.italic })}
        title="Italic"
      />
      <Button
        size="small"
        type={formatting?.underline ? 'primary' : 'default'}
        icon={<UnderlineOutlined />}
        onClick={() => updateFormatting(sectionId, { ...formatting, underline: !formatting?.underline })}
        title="Underline"
      />
      <Divider type="vertical" />
      <Button
        size="small"
        type={formatting?.align === 'left' ? 'primary' : 'default'}
        icon={<AlignLeftOutlined />}
        onClick={() => updateFormatting(sectionId, { ...formatting, align: 'left' })}
        title="Align Left"
      />
      <Button
        size="small"
        type={formatting?.align === 'center' ? 'primary' : 'default'}
        icon={<AlignCenterOutlined />}
        onClick={() => updateFormatting(sectionId, { ...formatting, align: 'center' })}
        title="Align Center"
      />
      <Button
        size="small"
        type={formatting?.align === 'right' ? 'primary' : 'default'}
        icon={<AlignRightOutlined />}
        onClick={() => updateFormatting(sectionId, { ...formatting, align: 'right' })}
        title="Align Right"
      />
      <Divider type="vertical" />
      <Button
        size="small"
        type={formatting?.listType === 'bullet' ? 'primary' : 'default'}
        icon={<UnorderedListOutlined />}
        onClick={() => formatSelectionAsList(sectionId, 'bullet')}
        title="Bullet List"
      />
      <Button
        size="small"
        type={formatting?.listType === 'number' ? 'primary' : 'default'}
        icon={<OrderedListOutlined />}
        onClick={() => formatSelectionAsList(sectionId, 'number')}
        title="Numbered List"
      />
    </Space>
  )

  // Render content with formatting
  const renderFormattedText = (content: string, formatting?: APlusSection['formatting']) => {
    if (!content) return null

    let style: React.CSSProperties = {}
    if (formatting?.bold) style.fontWeight = 'bold'
    if (formatting?.italic) style.fontStyle = 'italic'
    if (formatting?.underline) style.textDecoration = 'underline'
    if (formatting?.align) style.textAlign = formatting.align

    // Process list formatting
    const processContent = (text: string) => {
      const lines = text.split('\n')
      return lines.map((line, index) => {
        // Check for bullet points
        if (line.trim().startsWith('• ')) {
          return (
            <li key={index} style={{ marginLeft: '20px', listStyle: 'disc' }}>
              {line.trim().substring(2)}
            </li>
          )
        }
        // Check for numbered lists
        const numberedMatch = line.trim().match(/^\d+\.\s+(.*)/)
        if (numberedMatch) {
          return (
            <li key={index} style={{ marginLeft: '20px', listStyle: 'decimal' }}>
              {numberedMatch[1]}
            </li>
          )
        }
        // Regular line
        return line ? (
          <div key={index} style={{ marginBottom: '4px' }}>
            {line}
          </div>
        ) : <div key={index} style={{ height: '1em' }} />
      })
    }

    // Determine if content is a list
    const isList = formatting?.listType && formatting.listType !== 'none'

    if (isList) {
      return (
        <div style={style}>
          <ul style={{ margin: 0, paddingLeft: '20px', listStyle: formatting.listType === 'bullet' ? 'disc' : 'decimal' }}>
            {processContent(content)}
          </ul>
        </div>
      )
    }

    return (
      <div style={style} className="whitespace-pre-wrap">
        {processContent(content)}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Typography.Title level={4}>A+ Content Sections</Typography.Title>
          <Typography.Text type="secondary">
            Create rich content with images and formatted text sections
          </Typography.Text>
        </div>
        <Space>
          <Button onClick={() => addSection('text')} icon={<FormatPainterOutlined />}>
            Add Text Section
          </Button>
          <Button onClick={() => addSection('image_text')} icon={<CameraOutlined />}>
            Add Image + Text
          </Button>
          <Button onClick={() => addSection('text_image')} icon={<CameraOutlined />}>
            Add Text + Image
          </Button>
        </Space>
      </div>

      {/* Sections List */}
      <div style={{ display: 'grid', gap: 16 }}>
        {sections.map((section, index) => (
          <Card
            key={section.id}
            size="small"
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  Section {index + 1}: {section.type.replace('_', ' ').charAt(0).toUpperCase() + section.type.slice(1).replace('_', ' + ')}
                </span>
                <Space>
                  <Popconfirm
                    title="Delete this section?"
                    description="This action cannot be undone."
                    onConfirm={() => removeSection(section.id)}
                    okText="Delete"
                    cancelText="Cancel"
                    okType="danger"
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              </div>
            }
          >
            <Row gutter={16}>
              {section.type === 'image_text' && (
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    {section.image ? (
                      <div>
                        <Image
                          src={section.image}
                          alt={section.title}
                          width="100%"
                          height={120}
                          style={{ objectFit: 'cover', borderRadius: 4 }}
                          preview={false}
                        />
                        <Upload
                          showUploadList={false}
                          beforeUpload={handleImageUpload(section.id)}
                          accept="image/*"
                        >
                          <Button size="small" icon={<EditOutlined />} style={{ marginTop: 8 }}>
                            Change Image
                          </Button>
                        </Upload>
                      </div>
                    ) : (
                      <Upload.Dragger
                        showUploadList={false}
                        beforeUpload={handleImageUpload(section.id)}
                        accept="image/*"
                        style={{ height: 120 }}
                      >
                        <p className="ant-upload-drag-icon">
                          <CameraOutlined />
                        </p>
                        <p className="ant-upload-text">Upload Image</p>
                      </Upload.Dragger>
                    )}
                  </div>
                </Col>
              )}
              <Col span={section.type === 'text' ? 24 : section.type === 'image_text' ? 16 : 16}>
                <div>
                  <Input
                    placeholder="Section Title (Optional)"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <TiptapEditor
                    value={section.content}
                    onChange={(value) => updateSection(section.id, 'content', value)}
                    placeholder="Content for this section... (Use the editor toolbar for text formatting and lists)"
                    height={120}
                  />
                </div>
              </Col>
              {section.type === 'text_image' && (
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    {section.image ? (
                      <div>
                        <Image
                          src={section.image}
                          alt={section.title}
                          width="100%"
                          height={120}
                          style={{ objectFit: 'cover', borderRadius: 4 }}
                          preview={false}
                        />
                        <Upload
                          showUploadList={false}
                          beforeUpload={handleImageUpload(section.id)}
                          accept="image/*"
                        >
                          <Button size="small" icon={<EditOutlined />} style={{ marginTop: 8 }}>
                            Change Image
                          </Button>
                        </Upload>
                      </div>
                    ) : (
                      <Upload.Dragger
                        showUploadList={false}
                        beforeUpload={handleImageUpload(section.id)}
                        accept="image/*"
                        style={{ height: 120 }}
                      >
                        <p className="ant-upload-drag-icon">
                          <CameraOutlined />
                        </p>
                        <p className="ant-upload-text">Upload Image</p>
                      </Upload.Dragger>
                    )}
                  </div>
                </Col>
              )}
            </Row>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sections.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }}>
              <FormatPainterOutlined />
            </div>
            <Typography.Text type="secondary">No A+ content sections created yet</Typography.Text>
            <div style={{ marginTop: 16 }}>
              <Space>
                <Button type="primary" onClick={() => addSection('text')} icon={<FormatPainterOutlined />}>
                  Add Text Section
                </Button>
                <Button onClick={() => addSection('image_text')} icon={<CameraOutlined />}>
                  Add Image + Text
                </Button>
                <Button onClick={() => addSection('text_image')} icon={<CameraOutlined />}>
                  Add Text + Image
                </Button>
              </Space>
            </div>
          </div>
        </Card>
      )}

      {/* Preview Modal */}
      <Modal
        open={previewOpen}
        title="Image Preview"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        width={800}
      >
        <img src={previewImage} style={{ width: '100%' }} alt="Preview" />
      </Modal>

      </div>
  )
}

export default APlusContentManager