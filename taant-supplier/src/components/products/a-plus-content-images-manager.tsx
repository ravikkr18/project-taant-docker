'use client'

import React, { useState, useCallback } from 'react'
import { Upload, Button, Card, Image, Input, Space, message, Modal, Tooltip, Typography, Table, Tag } from 'antd'
const { TextArea } = Input
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
import apiClient from '../../lib/api-client'

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
  needsSave?: boolean // Add this property
  file?: File // Add local file storage
}

interface APlusContentImagesManagerProps {
  productId: string
  onChange: (images: APlusContentImage[]) => void
}

// Debounced alt text input hook
const useDebouncedAltText = (initialAlt: string, onUpdateAlt: (id: string, alt: string) => void, imageId: string, delay: number = 500) => {
  const [localAlt, setLocalAlt] = useState(initialAlt)
  const [isTyping, setIsTyping] = useState(false)

  React.useEffect(() => {
    setLocalAlt(initialAlt)
  }, [initialAlt])

  React.useEffect(() => {
    if (!isTyping) return

    const timer = setTimeout(() => {
      onUpdateAlt(imageId, localAlt)
      setIsTyping(false)
    }, delay)

    return () => clearTimeout(timer)
  }, [localAlt, isTyping, onUpdateAlt, imageId, delay])

  const handleChange = (value: string) => {
    setLocalAlt(value)
    setIsTyping(true)
  }

  return { value: localAlt, onChange: handleChange, isTyping }
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

  // Use debounced alt text to prevent re-renders while typing
  const { value: altText, onChange: handleAltTextChange, isTyping } = useDebouncedAltText(
    image.alt_text || '',
    onUpdateAlt,
    image.id
  )

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
            onError={(error) => console.error('Image failed to load:', { id: image.id, url: image.url, error })}
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
        <TextArea
          placeholder="Enter detailed alt text or description for this image..."
          value={altText}
          onChange={(e) => handleAltTextChange(e.target.value)}
          rows={3}
          maxLength={500}
          showCount
          style={{ fontSize: '12px' }}
        />
        {isTyping && (
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
            Typing... (will auto-save)
          </Text>
        )}
        {image.file_size && (
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
            {image.file_name} ({(image.file_size / 1024).toFixed(1)}KB)
          </Text>
        )}
      </div>
    </Card>
  )
}

const APlusContentImagesManager: React.FC<APlusContentImagesManagerProps> = ({ productId, onChange }) => {
  const [uploading, setUploading] = useState(false)
  const [localImages, setLocalImages] = useState<APlusContentImage[]>([])
  const [isUploading, setIsUploading] = useState(false) // Track upload state to prevent duplicates
    const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Load content images fresh every time component mounts or productId changes
  React.useEffect(() => {
    const loadContentImages = async () => {
      if (!productId) {
        console.log('APlusContentImagesManager - No productId provided')
        setLocalImages([])
        setHasLoaded(true)
        return
      }

      console.log('🔄 APlusContentImagesManager - Loading fresh content images for product:', productId)
      setIsLoading(true)

      try {
        const response = await apiClient.getAPlusContentImages(productId)
        console.log('✅ APlusContentImagesManager - Fresh content images loaded:', response.length, response)
        setLocalImages(response)
        // Also update parent state
        if (onChange) {
          onChange(response)
        }
      } catch (error) {
        console.error('❌ APlusContentImagesManager - Failed to load fresh content images:', error)
        setLocalImages([])
      } finally {
        setIsLoading(false)
        setHasLoaded(true)
      }
    }

    loadContentImages()
  }, [productId])

  // Remove the second useEffect to prevent race conditions
  // The first useEffect already handles state updates properly

  
  // Save any unsaved temp images (cleanup mechanism) - FIXED: Only run on mount, not on every state change
  React.useEffect(() => {
    const saveUnsavedImages = async () => {
      const unsavedImages = localImages.filter(img => img.needsSave && img.id.startsWith('temp-'))

      if (unsavedImages.length > 0) {
        console.log('Found unsaved images, attempting to save:', unsavedImages.length)

        for (const image of unsavedImages) {
          try {
            const imageData = {
              url: image.url,
              alt_text: image.alt_text,
              file_name: image.file_name,
              file_size: image.file_size,
              file_type: image.file_type,
              position: image.position,
              is_active: image.is_active,
            }

            const response = await apiClient.createAPlusContentImage(productId, imageData)
            if (response.success) {
              console.log('Unsaved image saved to DB:', response.data)

              // Update the temp image with real DB data
              setLocalImages(prev => prev.map(img =>
                img.id === image.id
                  ? { ...response.data, file: img.file, needsSave: false }
                  : img
              ))
            }
          } catch (error) {
            console.error('Failed to save unsaved image:', image.id, error)
          }
        }
      }
    }

    // Only run once on mount with a delay to avoid race conditions
    const timeoutId = setTimeout(saveUnsavedImages, 1000)
    return () => clearTimeout(timeoutId)
  }, []) // Empty dependency array - only run on mount

  // S3 upload function
  const uploadToS3 = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log('Starting S3 upload for file:', file.name)
      const response = await apiClient.uploadAPlusImage(formData)
      console.log('S3 upload response:', response)

      if (response.success) {
        console.log('S3 upload successful, URL:', response.data.url)
        return response.data.url
      } else {
        console.error('S3 upload failed with response:', response)
        throw new Error(response.message || 'Upload failed')
      }
    } catch (error) {
      console.error('S3 upload error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      })
      throw error
    }
  }

  // Convert existing blob URLs to S3 URLs
  const convertBlobToS3 = async (blobUrl: string, fileName: string): Promise<string> => {
    try {
      const response = await apiClient.convertBlobToS3(blobUrl, fileName)

      if (response.success) {
        return response.data.s3Url
      } else {
        throw new Error(response.message || 'Conversion failed')
      }
    } catch (error) {
      console.error('Blob to S3 conversion error:', error)
      throw error
    }
  }

  // Cleanup blob URLs when component unmounts
  React.useEffect(() => {
    return () => {
      // Clean up blob URLs when component unmounts
      localImages.forEach(image => {
        if (image.url && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url)
        }
      })
    }
  }, [localImages])

  // Move image (for drag and drop)
  const moveImage = useCallback((dragIndex: number, hoverIndex: number) => {
    const newImages = [...localImages]
    const draggedImage = newImages[dragIndex]
    newImages.splice(dragIndex, 1)
    newImages.splice(hoverIndex, 0, draggedImage)

    // Update positions
    const reorderedImages = newImages.map((image, index) => ({
      ...image,
      position: index,
    }))

    // Update local state immediately
    setLocalImages(reorderedImages)
    onChange(reorderedImages)

    // Only update positions on backend for server-stored images (not temp images)
    const serverImages = reorderedImages.filter(img => !img.id.startsWith('temp-'))
    if (serverImages.length > 0) {
      const positions = serverImages.map((image) => ({
        id: image.id,
        position: image.position,
      }))

      apiClient.updateAPlusContentImagePositions(productId, positions).catch((error) => {
        console.error('Failed to update positions:', error)
        message.error('Failed to update image order')
      })
    }
  }, [localImages, onChange, productId])

  // Remove image
  const removeImage = useCallback(async (imageId: string) => {
    const imageToRemove = localImages.find(img => img.id === imageId)

    // If it's a local temporary image, clean up blob URL and remove it from state
    if (imageToRemove?.id.startsWith('temp-')) {
      // Clean up blob URL if it exists
      if (imageToRemove.url && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url)
      }
      const updatedImages = localImages.filter(img => img.id !== imageId)
      setLocalImages(updatedImages)
      onChange(updatedImages)
      message.success('Content image removed successfully')
      return
    }

    // If it's a server-stored image, call API to delete it
    try {
      await apiClient.deleteAPlusContentImage(productId, imageId)
      const updatedImages = localImages.filter(img => img.id !== imageId)
      setLocalImages(updatedImages)
      onChange(updatedImages)
      message.success('Content image deleted successfully')
    } catch (error) {
      console.error('Failed to delete content image:', error)
      message.error('Failed to delete content image')
    }
  }, [localImages, onChange, productId])

  // Update alt text
  const updateAltText = useCallback(async (imageId: string, altText: string) => {
    const imageIndex = localImages.findIndex(img => img.id === imageId)
    if (imageIndex === -1) return

    const updatedImage = { ...localImages[imageIndex], alt_text: altText }
    const newImages = [...localImages]
    newImages[imageIndex] = updatedImage

    // Update local state immediately
    setLocalImages(newImages)
    onChange(newImages)

    // Only update on backend for server-stored images (not temp images)
    if (!imageId.startsWith('temp-')) {
      try {
        await apiClient.updateAPlusContentImage(productId, imageId, { alt_text: altText })
      } catch (error) {
        console.error('Failed to update alt text:', error)
        message.error('Failed to update alt text')
      }
    }
  }, [localImages, onChange, productId])

  // Handle image upload
  const handleImageUpload: UploadProps['beforeUpload'] = async (file, fileList) => {
    // Prevent multiple simultaneous uploads
    if (isUploading) {
      message.warning('Upload in progress, please wait...')
      return false
    }

    console.log('A+ Content image upload started:', { file: file.name, currentImages: localImages.length })

    // Process all files at once when the first file is processed
    if (fileList.length > 0) {
      setIsUploading(true)
      setUploading(true)

      // FIXED: Enhanced duplicate prevention using file hash and existing URLs
      const validFiles = fileList.filter(file => {
        const isImage = file.type.startsWith('image/')
        const isSizeValid = file.size / 1024 / 1024 < 50 // 50MB limit

        // Check for exact duplicates using file name, size, and type
        const isDuplicate = localImages.some(existingImage =>
          existingImage.file_name === file.name &&
          existingImage.file_size === file.size &&
          existingImage.file_type === file.type
        )

        if (!isImage) {
          message.error(`${file.name} is not a valid image file`)
          return false
        }
        if (!isSizeValid) {
          message.error(`${file.name} is too large (max 50MB)`)
          return false
        }
        if (isDuplicate) {
          message.warning(`${file.name} already exists`)
          return false
        }
        return true
      })

      console.log('Valid files for upload:', validFiles.length)

      if (validFiles.length === 0) {
        setIsUploading(false)
        setUploading(false)
        return false
      }

      try {
        const newImages = await Promise.all(
          validFiles.map(async (file, index) => {
            try {
              // Upload to S3 first
              const s3Url = await uploadToS3(file)
              console.log('Uploaded to S3:', s3Url, 'for file:', file.name)

              // Create image data for instant DB saving
              const imageData = {
                url: s3Url,
                alt_text: file.name.split('.')[0], // Use filename as default alt text
                file_name: file.name,
                file_size: file.size,
                file_type: file.type,
                position: localImages.length + index,
                is_active: true,
              }

              // Save to database immediately - FIXED: Remove fallback to prevent duplication
              try {
                const response = await apiClient.createAPlusContentImage(productId, imageData)
                if (response.success) {
                  console.log('Image saved to DB:', response.data)
                  return {
                    ...response.data,
                    file: file // Keep file reference for duplicate detection
                  }
                } else {
                  throw new Error(`Database save failed: ${response.message || 'Unknown error'}`)
                }
              } catch (dbError) {
                console.error('Database save failed:', dbError)
                throw new Error(`Database save failed: ${dbError.message}`)
              }
            } catch (error) {
              console.error('Failed to upload file to S3:', file.name, error)
              throw error // Re-throw to handle in outer catch
            }
          })
        )

        if (newImages.length > 0) {
          const updatedImages = [...localImages, ...newImages]
          console.log('Adding', newImages.length, 'new images to total of', updatedImages.length)

          // FIXED: Batch state updates to prevent cascading re-renders
          setLocalImages(updatedImages)
          // Use setTimeout to defer parent state update and prevent immediate re-render cascade
          setTimeout(() => onChange(updatedImages), 0)
        }

        message.success(`${validFiles.length} content image${validFiles.length > 1 ? 's' : ''} uploaded and saved successfully`)
      } catch (error) {
        console.error('Error during image upload:', error)
        // FIXED: Provide more specific error messages
        if (error.message.includes('S3') || error.message.includes('uploadAPlusImage')) {
          message.error('Failed to upload image to storage')
        } else if (error.message.includes('database') || error.message.includes('createAPlusContentImage')) {
          message.error('Image uploaded to storage but failed to save to database')
        } else {
          message.error('Failed to upload images')
        }
      } finally {
        setIsUploading(false)
        setUploading(false)
      }
    }
    return false // Prevent automatic upload
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
          <Space>
              <Upload {...uploadProps}>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                loading={uploading}
              >
                Upload Content Images
              </Button>
            </Upload>
          </Space>
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

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <div style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }}>
                <CameraOutlined />
              </div>
              <Typography.Title level={4} type="secondary">
                Loading Content Images...
              </Typography.Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                Fetching your content images from the server
              </Text>
            </div>
          </Card>
        ) : (
          <>
            {/* Content Images Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {localImages.map((image, index) => (
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
            {localImages.length === 0 && (
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
          </>
        )}
      </div>
    </DndProvider>
  )
}

export default APlusContentImagesManager