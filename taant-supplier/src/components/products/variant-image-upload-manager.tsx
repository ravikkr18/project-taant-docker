'use client'

import React, { useState, useCallback, useMemo } from 'react'
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
import apiClient from '../../lib/api-client'

const { Text } = Typography

interface VariantImage {
  id: string
  url: string
  alt_text: string
  position: number
  is_primary: boolean
  file_name?: string
  file_size?: number
  file_type?: string
  file?: File
  needsSave?: boolean
}

interface VariantImageUploadManagerProps {
  images: VariantImage[]
  onChange: (images: VariantImage[]) => void
  maxImages?: number
  variantId?: string
}

// Draggable Image Card Component
const DraggableImageCard: React.FC<{
  image: VariantImage
  index: number
  onMove: (dragIndex: number, hoverIndex: number) => void
  onRemove: (id: string) => void
  onSetPrimary: (id: string) => void
  onUpdateAlt: (id: string, alt: string) => void
}> = ({ image, index, onMove, onRemove, onSetPrimary, onUpdateAlt }) => {
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

  const ref = React.useRef<HTMLDivElement>(null)
  drag(drop(ref))

  return (
    <Card
      ref={ref}
      size="small"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        marginBottom: 8,
      }}
      cover={
        <div style={{ position: 'relative' }}>
          <Image
            src={image.url}
            alt={image.alt_text}
            height={150}
            style={{ objectFit: 'cover', cursor: 'pointer' }}
            fallback="data:image/svg+xml,%3Csvg width='200' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='200' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E"
          />

          {image.is_primary && (
            <Tag color="gold" style={{ position: 'absolute', top: 8, left: 8 }}>
              <StarOutlined /> Primary
            </Tag>
          )}

          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 4
          }}>
            {!image.is_primary && (
              <Tooltip title="Set as primary">
                <Button
                  type="default"
                  size="small"
                  icon={<StarOutlined />}
                  onClick={() => onSetPrimary(image.id)}
                />
              </Tooltip>
            )}
            <Tooltip title="Preview">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  Modal.info({
                    title: 'Image Preview',
                    content: (
                      <img
                        src={image.url}
                        alt={image.alt_text}
                        style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                      />
                    ),
                    width: 800,
                    centered: true,
                  })
                }}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onRemove(image.id)}
              />
            </Tooltip>
          </div>
        </div>
      }
    >
      <div style={{ padding: 8 }}>
        <Input
          placeholder="Alt text (description)"
          value={image.alt_text}
          onChange={(e) => onUpdateAlt(image.id, e.target.value)}
          size="small"
        />
      </div>
    </Card>
  )
}

const VariantImageUploadManager: React.FC<VariantImageUploadManagerProps> = ({
  images = [],
  onChange,
  maxImages = 10,
  variantId
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set())
  const [uploadCounter, setUploadCounter] = useState(0)

  // Helper function to safely access images and ensure only one primary
  const safeImages = useMemo(() => {
    if (!Array.isArray(images)) return []

    // Find all primary images
    const primaryImages = images.filter(img => img.is_primary)

    // If multiple images are marked as primary, only keep the first one as primary
    if (primaryImages.length > 1) {
      console.log('🔧 Fixing multiple primary images, keeping first one:', primaryImages.length)
      return images.map((img, index) => ({
        ...img,
        is_primary: img.is_primary && primaryImages.indexOf(img) === 0 // Only first primary stays true
      }))
    }

    return images
  }, [images])
  const imagesCount = safeImages.length

  // Load existing variant images on mount
  React.useEffect(() => {
    const loadVariantImages = async () => {
      if (!variantId || imagesCount > 0) {
        return // Don't reload if we already have images or no variantId
      }

      try {
        const result = await apiClient.getVariantImages(variantId)
        if (result.success && result.data.length > 0) {
          const loadedImages: VariantImage[] = result.data.map((img: any) => ({
            id: img.id,
            url: img.url,
            alt_text: img.alt_text || '',
            position: img.position,
            is_primary: img.is_primary,
            file_name: img.file_name,
            file_size: img.file_size,
            file_type: img.file_type,
          }))
          onChange(loadedImages)
        }
      } catch (error) {
        console.error('Failed to load variant images:', error)
      }
    }

    loadVariantImages()
  }, [variantId, imagesCount, onChange])

  // Move image to new position
  const moveImage = useCallback((dragIndex: number, hoverIndex: number) => {
    const draggedImage = safeImages[dragIndex]
    const newImages = [...safeImages]
    newImages.splice(dragIndex, 1)
    newImages.splice(hoverIndex, 0, draggedImage)
    // Update positions
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      position: index,
    }))
    onChange(updatedImages)
  }, [safeImages, onChange])

  // Remove image
  const removeImage = useCallback((id: string) => {
    const imageToRemove = safeImages.find(img => img.id === id)
    if (imageToRemove?.is_primary && imagesCount > 1) {
      message.error('Cannot remove primary image. Please set another image as primary first.')
      return
    }

    const updatedImages = safeImages.filter(img => img.id !== id)
    // If we removed the primary image and there are other images, set the first one as primary
    if (imageToRemove?.is_primary && updatedImages.length > 0) {
      updatedImages[0].is_primary = true
    }
    onChange(updatedImages)

    // Delete from backend if it has a real ID
    if (imageToRemove && !imageToRemove.id.startsWith('temp-')) {
      apiClient.deleteVariantImage(variantId!, id).catch(error => {
        console.error('Failed to delete image:', error)
        message.error('Failed to delete image from server')
      })
    }
  }, [safeImages, onChange, variantId])

  // Set primary image
  const setPrimaryImage = useCallback((id: string) => {
    console.log('🌟 Setting primary image:', id)
    const updatedImages = safeImages.map(img => ({
      ...img,
      is_primary: img.id === id
    }))
    console.log('✅ Updated images with primary status:', updatedImages.map(img => ({ id: img.id, file_name: img.file_name, is_primary: img.is_primary })))
    onChange(updatedImages)

    // Update backend if it has a real ID
    const imageToSet = safeImages.find(img => img.id === id)
    if (imageToSet && !imageToSet.id.startsWith('temp-')) {
      apiClient.updateVariantImagePrimary(variantId!, id).catch(error => {
        console.error('Failed to set primary image:', error)
        message.error('Failed to set primary image on server')
      })
    }
  }, [safeImages, onChange, variantId])

  // Update alt text
  const updateAltText = useCallback((id: string, alt: string) => {
    const updatedImages = safeImages.map(img =>
      img.id === id ? { ...img, alt_text: alt } : img
    )
    onChange(updatedImages)
  }, [safeImages, onChange])

  // Process single file
  const processSingleFile = async (file: File, position: number, isPrimary: boolean): Promise<VariantImage | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await apiClient.uploadVariantImage(variantId!, formData)

      if (result.success) {
        return {
          id: result.data.id,
          url: result.data.url,
          alt_text: result.data.originalName || file.name,
          position: result.data.position,
          is_primary: result.data.is_primary,
          file_name: result.data.originalName,
          file_size: result.data.size,
          file_type: result.data.mimetype,
          file: file,
          needsSave: false
        }
      }
      return null
    } catch (error) {
      console.error('Error uploading file:', error)
      return null
    }
  }

  // Handle file upload
  const handleUpload: UploadProps['beforeUpload'] = async (file, fileList) => {
    // Create a unique identifier for this file based on name, size, and last modified time
    const fileKey = `${file.name}-${file.size}-${file.lastModified}`

    // Check if this file is already being processed
    if (processingFiles.has(fileKey)) {
      console.log(`⏭️ File ${file.name} is already being processed, skipping...`)
      return false
    }

    // Mark this file as being processed and increment upload counter
    const currentUploadCounter = uploadCounter
    setProcessingFiles(prev => new Set([...prev, fileKey]))
    setUploadCounter(prev => prev + 1)

    try {
      const remainingSlots = maxImages - imagesCount
      if (remainingSlots <= 0) {
        message.error(`Maximum ${maxImages} images allowed!`)
        return false
      }

      // Validate this single file
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5
      const isDuplicate = safeImages.some(img =>
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

      setIsUploading(true)

      // Get current images length and add offset for concurrent uploads
      const currentImagesLength = imagesCount + processingFiles.size

      // Determine if this should be the primary image
      // Only set as primary if there's no existing primary image in the gallery
      const hasExistingPrimary = safeImages.some(img => img.is_primary)
      const shouldThisBePrimary = !hasExistingPrimary && processingFiles.size === 0 && currentUploadCounter === 0

      // Process this single file with explicit primary status
      const uploadedImage = await processSingleFile(file, currentImagesLength, shouldThisBePrimary)

      if (uploadedImage) {
        console.log(`📝 Processing image: ${uploadedImage.file_name} - S3 complete, saved to database`)

        try {
          // Use functional update to ensure we get the latest state
          const finalImage = { ...uploadedImage, needsSave: false }

          onChange(prevImages => {
            // Check if this image is already in the state (avoid duplicates)
            const alreadyExists = prevImages.some(img =>
              img.file_name === finalImage.file_name ||
              img.id === finalImage.id
            )

            if (alreadyExists) {
              console.log(`⏭️ Image ${finalImage.file_name} already exists in state, skipping...`)
              return prevImages
            }

            // Check if there's already a primary image in the current state
            const hasPrimaryInState = prevImages.some(img => img.is_primary)

            // If there's already a primary and this image is marked as primary, remove primary flag
            if (hasPrimaryInState && finalImage.is_primary) {
              console.log(`🔄 Removing primary flag from ${finalImage.file_name} - primary already exists`)
              finalImage.is_primary = false
            }

            console.log(`➕ Adding image ${finalImage.file_name} to state (primary: ${finalImage.is_primary})`)
            return [...prevImages, finalImage]
          })

          message.success(`Image "${uploadedImage.file_name}" uploaded and saved`)
        } catch (error) {
          console.error(`Failed to update state for ${file.name}:`, error)
          message.error(`Failed to update image gallery`)
        }
      }

      return false // Prevent default upload behavior
    } catch (error) {
      console.error('Upload error:', error)
      message.error('Upload failed')
      return false
    } finally {
      // Always remove this file from processing set and reset uploading state
      setProcessingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(fileKey)
        return newSet
      })

      // Reset uploading state when all files are done processing
      setTimeout(() => {
        setProcessingFiles(current => {
          if (current.size === 0) {
            setIsUploading(false)
          }
          return current
        })
      }, 100)
    }
  }

  // Sort images by position with useMemo for performance and reactivity
  const sortedImages = useMemo(() => {
    console.log('🔄 VariantImageUploadManager: safeImages changed, re-sorting', safeImages.length, 'images')
    const primaryImages = safeImages.filter(img => img.is_primary)
    console.log('🎯 Primary images found:', primaryImages.length, primaryImages.map(img => ({ id: img.id, file_name: img.file_name })))
    return [...safeImages].sort((a, b) => a.position - b.position)
  }, [safeImages])

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <Upload.Dragger
          name="file"
          multiple
          accept="image/*"
          beforeUpload={handleUpload}
          showUploadList={false}
          disabled={isUploading || imagesCount >= maxImages}
          style={{
            marginBottom: 16,
            border: imagesCount >= maxImages ? '2px dashed #d9d9d9' : undefined,
          }}
        >
          <p className="ant-upload-drag-icon">
            <CameraOutlined />
          </p>
          <p className="ant-upload-text">
            {isUploading ? 'Uploading images...' : 'Click or drag image files here to upload'}
          </p>
          <p className="ant-upload-hint">
            Support for JPG, PNG, GIF, WebP. Maximum {maxImages} images, 5MB each.
          </p>
          {imagesCount >= maxImages && (
            <p style={{ color: '#ff4d4f' }}>
              Maximum image limit reached ({imagesCount}/{maxImages})
            </p>
          )}
        </Upload.Dragger>

        {sortedImages.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ marginBottom: 8, display: 'block' }}>
              Image Gallery ({sortedImages.length}/{maxImages})
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {sortedImages.map((image, index) => (
                <DraggableImageCard
                  key={image.id}
                  image={image}
                  index={index}
                  onMove={moveImage}
                  onRemove={removeImage}
                  onSetPrimary={setPrimaryImage}
                  onUpdateAlt={updateAltText}
                />
              ))}
            </div>
          </div>
        )}

        {sortedImages.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 40,
            color: '#999',
            backgroundColor: '#fafafa',
            borderRadius: 8,
          }}>
            <InfoCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <div>
              <Text>No images uploaded yet</Text>
              <div style={{ fontSize: '12px', marginTop: 8 }}>
                Upload images to showcase this variant (up to {maxImages} images)
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  )
}

export default VariantImageUploadManager