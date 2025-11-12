'use client'

import React, { useState, useCallback } from 'react'
import { Upload, Button, Card, Image, Tag, Input, Space, message, Modal, Tooltip, Typography } from 'antd'
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarOutlined,
  DragOutlined,
  PlusOutlined,
  CameraOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import { DndProvider, useDrag, useDrop } from 'react-dnd/dist/index'
import { HTML5Backend } from 'react-dnd-html5-backend'

const { Text } = Typography

interface ProductImage {
  id: string
  url: string
  alt_text: string
  position: number
  is_primary: boolean
  file?: File
}

interface ImageUploadManagerProps {
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
  maxImages?: number
}

// Draggable Image Card Component
const DraggableImageCard: React.FC<{
  image: ProductImage
  index: number
  onMove: (dragIndex: number, hoverIndex: number) => void
  onRemove: (id: string) => void
  onSetPrimary: (id: string) => void
  onUpdateAlt: (id: string, alt: string) => void
}> = ({ image, index, onMove, onRemove, onSetPrimary, onUpdateAlt }) => {
  const ref = React.useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag({
    type: 'image',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: 'image',
    hover: (item: { index: number }) => {
      if (!ref.current) return
      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) return
      onMove(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  drag(drop(ref))

  return (
    <Card
      ref={ref}
      size="small"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        transition: 'all 0.3s ease',
      }}
      cover={
        <div style={{ position: 'relative' }}>
          <Image
            src={image.url}
            alt={image.alt_text}
            height={150}
            style={{ objectFit: 'cover' }}
            fallback="data:image/svg+xml,%3Csvg width='200' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='200' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E"
          />

          {image.is_primary && (
            <Tag color="gold" style={{ position: 'absolute', top: 8, left: 8 }}>
              <StarOutlined /> Primary
            </Tag>
          )}

          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
            {!image.is_primary && (
              <Tooltip title="Set as primary image">
                <Button
                  size="small"
                  type="primary"
                  ghost
                  icon={<StarOutlined />}
                  onClick={() => onSetPrimary(image.id)}
                />
              </Tooltip>
            )}

            <Tooltip title="Remove image">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onRemove(image.id)}
              />
            </Tooltip>
          </div>

          <div style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <DragOutlined />
            {index + 1}
          </div>
        </div>
      }
    >
      <div style={{ padding: 8 }}>
        <Input
          size="small"
          placeholder="Alt text for accessibility"
          value={image.alt_text}
          onChange={(e) => onUpdateAlt(image.id, e.target.value)}
          style={{ marginBottom: 4 }}
        />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#666'
        }}>
          <span>Position: {index + 1}</span>
          <CameraOutlined style={{ color: '#1890ff' }} />
        </div>

        {image.file && (
          <div style={{
            marginTop: 4,
            padding: 4,
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: 4,
            fontSize: '11px',
            color: '#52c41a'
          }}>
            Ready to upload
          </div>
        )}
      </div>
    </Card>
  )
}

const ImageUploadManager: React.FC<ImageUploadManagerProps> = ({
  images,
  onChange,
  maxImages = 10
}) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string>('')

  // Handle file upload
  const handleUpload: UploadProps['beforeUpload'] = (file, fileList) => {
    // Process all files at once when the first file is processed
    if (fileList.length > 0) {
      const remainingSlots = maxImages - images.length
      if (remainingSlots <= 0) {
        message.error(`Maximum ${maxImages} images allowed!`)
        return false
      }

      // Process valid files
      const validFiles = fileList.slice(0, remainingSlots).filter(file => {
        const isImage = file.type.startsWith('image/')
        const isLt5M = file.size / 1024 / 1024 < 5
        const isDuplicate = images.some(img =>
          img.file && img.file.name === file.name && img.file.size === file.size
        )

        if (!isImage) {
          message.error(`${file.name} is not an image file!`)
          return false
        }
        if (!isLt5M) {
          message.error(`${file.name} must be smaller than 5MB!`)
          return false
        }
        if (isDuplicate) {
          message.error(`${file.name} has already been uploaded!`)
          return false
        }

        return true
      })

      // Create new images for all valid files
      const newImages = validFiles.map(file => ({
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: URL.createObjectURL(file),
        alt_text: file.name.split('.')[0],
        position: images.length + validFiles.indexOf(file),
        is_primary: images.length === 0 && validFiles.indexOf(file) === 0,
        file
      }))

      if (newImages.length > 0) {
        onChange([...images, ...newImages])
        message.success(`${newImages.length} image${newImages.length > 1 ? 's' : ''} added to gallery`)
      }
    }

    return false // Prevent automatic upload for all files
  }

  // Remove image
  const handleRemove = useCallback((imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId)

    // If primary image was removed, make first image primary
    if (images.find(img => img.id === imageId)?.is_primary && updatedImages.length > 0) {
      updatedImages[0].is_primary = true
    }

    // Update positions
    const repositionedImages = updatedImages.map((img, index) => ({
      ...img,
      position: index
    }))

    onChange(repositionedImages)
    message.success('Image removed')
  }, [images, onChange])

  // Set primary image
  const handleSetPrimary = useCallback((imageId: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      is_primary: img.id === imageId
    }))
    onChange(updatedImages)
    message.success('Primary image updated')
  }, [images, onChange])

  // Update alt text
  const handleUpdateAlt = useCallback((imageId: string, altText: string) => {
    const updatedImages = images.map(img =>
      img.id === imageId ? { ...img, alt_text: altText } : img
    )
    onChange(updatedImages)
  }, [images, onChange])

  // Move image
  const handleMoveImage = useCallback((dragIndex: number, hoverIndex: number) => {
    const dragImage = images[dragIndex]
    const newImages = [...images]
    newImages.splice(dragIndex, 1)
    newImages.splice(hoverIndex, 0, dragImage)

    // Update positions
    const repositionedImages = newImages.map((img, index) => ({
      ...img,
      position: index
    }))

    onChange(repositionedImages)
  }, [images, onChange])

  // Preview image
  const handlePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl)
    setPreviewOpen(true)
  }

  // Upload config
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    beforeUpload: handleUpload,
    showUploadList: false,
    accept: 'image/*'
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        {/* Upload Area */}
        <Card
          style={{ marginBottom: 16 }}
          bodyStyle={{ padding: 16 }}
        >
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>
              Click or drag images to this area to upload
            </p>
            <p className="ant-upload-hint" style={{ color: '#666' }}>
              Support for JPG, PNG, GIF. Maximum {maxImages} images. Individual files must be smaller than 5MB.
            </p>
            <p style={{ color: '#52c41a', fontSize: 12, marginTop: 8 }}>
              📸 Drag to reorder images • ⭐ First image is automatically set as primary
            </p>
          </Upload.Dragger>
        </Card>

        {/* Image Gallery */}
        {images.length > 0 && (
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <CameraOutlined /> Image Gallery ({images.length}/{maxImages})
                </span>
                <Space>
                  {images.length > 0 && (
                    <Button
                      size="small"
                      onClick={() => handlePreview(images[0]?.url)}
                      icon={<EyeOutlined />}
                    >
                      Preview First
                    </Button>
                  )}
                </Space>
              </div>
            }
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 16
            }}>
              {images.map((image, index) => (
                <DraggableImageCard
                  key={image.id}
                  image={image}
                  index={index}
                  onMove={handleMoveImage}
                  onRemove={handleRemove}
                  onSetPrimary={handleSetPrimary}
                  onUpdateAlt={handleUpdateAlt}
                />
              ))}
            </div>

            {/* Image Statistics */}
            <div style={{
              marginTop: 16,
              padding: 12,
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: 8
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <CameraOutlined style={{ color: '#52c41a' }} />
                  <Text strong>Gallery Statistics:</Text>
                </Space>
                <Space split={<span>|</span>}>
                  <span>Total: {images.length}</span>
                  <span>Primary: {images.filter(img => img.is_primary).length}</span>
                  <span>Ready: {images.filter(img => img.file).length}</span>
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
    </DndProvider>
  )
}

export default ImageUploadManager