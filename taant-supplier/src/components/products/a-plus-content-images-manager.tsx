'use client'

import React, { useState, useCallback } from 'react'
import { Upload, Button, Card, Image, Input, Space, message, Modal, Tooltip, Typography } from 'antd'
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  DragOutlined,
  PlusOutlined,
  CameraOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import { DndProvider, useDrag, useDrop } from 'react-dnd/dist/index'
import { HTML5Backend } from 'react-dnd-html5-backend'
import apiClient from '@/lib/api-client'

const { Text } = Typography

interface APlusContentImage {
  id: string
  url: string
  alt_text: string
  position: number
  is_active: boolean
  file_name?: string
  file_size?: number
  file_type?: string
  width?: number
  height?: number
  created_at: string
  updated_at: string
}

interface APlusContentImagesManagerProps {
  productId: string
  contentImages: APlusContentImage[]
  onChange: (images: APlusContentImage[]) => void
}

// Draggable Content Image Card Component
const DraggableContentImageCard: React.FC<{
  image: APlusContentImage
  index: number
  onMove: (dragIndex: number, hoverIndex: number) => void
  onRemove: (id: string) => void
  onUpdateAlt: (id: string, alt: string) => void
}> = ({ image, index, onMove, onRemove, onUpdateAlt }) => {
  const ref = React.useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag({
    type: 'content-image',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: 'content-image',
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
            height={200}
            style={{ objectFit: 'cover', width: '100%' }}
            fallback="data:image/svg+xml,%3Csvg width='400' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E"
          />

          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
            <Tooltip title="Preview">
              <Button
                size="small"
                type="primary"
                ghost
                icon={<EyeOutlined />}
                onClick={() => {
                  Modal.info({
                    title: 'Content Image Preview',
                    content: <img src={image.url} style={{ width: '100%' }} alt={image.alt_text || 'Content image'} />,
                    width: 800,
                  })
                }}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onRemove(image.id)}
              />
            </Tooltip>
          </div>

          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              background: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <DragOutlined />
            {index + 1}
          </div>
        </div>
      }
    >
      <div style={{ padding: '8px 0' }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          Alt Text / Description
        </Text>
        <Input
          placeholder="Enter alt text for accessibility..."
          value={image.alt_text || ''}
          onChange={(e) => onUpdateAlt(image.id, e.target.value)}
          size="small"
          maxLength={200}
          showCount
        />
        {image.file_size && (
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
            {image.file_name} ({(image.file_size / 1024).toFixed(1)}KB)
          </Text>
        )}
      </div>
    </Card>
  )
}

const APlusContentImagesManager: React.FC<APlusContentImagesManagerProps> = ({ productId, contentImages, onChange }) => {
  const [uploading, setUploading] = useState(false)

  // Move image (for drag and drop)
  const moveImage = useCallback((dragIndex: number, hoverIndex: number) => {
    const newImages = [...contentImages]
    const draggedImage = newImages[dragIndex]
    newImages.splice(dragIndex, 1)
    newImages.splice(hoverIndex, 0, draggedImage)

    // Update positions
    const reorderedImages = newImages.map((image, index) => ({
      ...image,
      position: index,
    }))

    onChange(reorderedImages)

    // Update positions on backend
    const positions = reorderedImages.map((image) => ({
      id: image.id,
      position: image.position,
    }))

    apiClient.updateAPlusContentImagePositions(productId, positions).catch((error) => {
      console.error('Failed to update positions:', error)
      message.error('Failed to update image order')
    })
  }, [contentImages, onChange, productId])

  // Remove image
  const removeImage = useCallback(async (imageId: string) => {
    try {
      await apiClient.deleteAPlusContentImage(productId, imageId)
      onChange(contentImages.filter(img => img.id !== imageId))
      message.success('Content image deleted successfully')
    } catch (error) {
      console.error('Failed to delete content image:', error)
      message.error('Failed to delete content image')
    }
  }, [contentImages, onChange, productId])

  // Update alt text
  const updateAltText = useCallback(async (imageId: string, altText: string) => {
    const imageIndex = contentImages.findIndex(img => img.id === imageId)
    if (imageIndex === -1) return

    const updatedImage = { ...contentImages[imageIndex], alt_text: altText }
    const newImages = [...contentImages]
    newImages[imageIndex] = updatedImage
    onChange(newImages)

    try {
      await apiClient.updateAPlusContentImage(productId, imageId, { alt_text: altText })
    } catch (error) {
      console.error('Failed to update alt text:', error)
      message.error('Failed to update alt text')
    }
  }, [contentImages, onChange, productId])

  // Handle image upload
  const handleImageUpload: UploadProps['beforeUpload'] = async (file) => {
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

    setUploading(true)

    try {
      // Create object URL for preview
      const previewUrl = URL.createObjectURL(file)

      // Get image dimensions
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image()
        img.onload = () => {
          resolve({ width: img.width, height: img.height })
        }
        img.src = previewUrl
      })

      // Create new content image object
      const newContentImage = {
        url: previewUrl,
        alt_text: '',
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        width: dimensions.width,
        height: dimensions.height,
        position: contentImages.length,
      }

      // Call API to create content image
      const createdImage = await apiClient.createAPlusContentImage(productId, newContentImage)

      // Update local state with the created image (replace object URL with server URL)
      const updatedImage = { ...createdImage, url: previewUrl } // Keep preview URL for immediate display
      onChange([...contentImages, updatedImage])

      message.success('Content image uploaded successfully')
      return false // Prevent default upload
    } catch (error) {
      console.error('Failed to upload content image:', error)
      message.error('Failed to upload content image')
      return false
    } finally {
      setUploading(false)
    }
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    showUploadList: false,
    beforeUpload: handleImageUpload,
    accept: 'image/*',
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              A+ Content Images
            </Typography.Title>
            <Text type="secondary">
              Add full-width content images to enhance your product presentation
            </Text>
          </div>
          <Upload {...uploadProps}>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              loading={uploading}
            >
              Upload Content Images
            </Button>
          </Upload>
        </div>

        {/* Info */}
        <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f0f8ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <Text>
              Content images are displayed as full-width sections in your product listing.
              Use high-quality images that showcase your product's features, benefits, and usage scenarios.
            </Text>
          </div>
        </Card>

        {/* Content Images Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {contentImages.map((image, index) => (
            <DraggableContentImageCard
              key={image.id}
              image={image}
              index={index}
              onMove={moveImage}
              onRemove={removeImage}
              onUpdateAlt={updateAltText}
            />
          ))}
        </div>

        {/* Empty State */}
        {contentImages.length === 0 && (
          <Card>
            <div style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }}>
                <CameraOutlined />
              </div>
              <Typography.Title level={4} type="secondary">
                No Content Images Yet
              </Typography.Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                Upload content images to create an engaging product presentation
              </Text>
              <Upload {...uploadProps}>
                <Button type="primary" size="large" icon={<PlusOutlined />} loading={uploading}>
                  Add First Content Image
                </Button>
              </Upload>
            </div>
          </Card>
        )}
      </div>
    </DndProvider>
  )
}

export default APlusContentImagesManager