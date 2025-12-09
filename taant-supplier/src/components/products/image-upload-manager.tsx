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
import apiClient from '../../lib/api-client'

const { Text } = Typography

interface ProductImage {
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

interface ImageUploadManagerProps {
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
  maxImages?: number
  productId?: string
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
  maxImages = 10,
  productId
}) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set())
  const [shouldReloadAfterUpload, setShouldReloadAfterUpload] = useState(false)

  // Load product images from database on component mount or productId change
  React.useEffect(() => {
    const loadProductImages = async () => {
      if (!productId) {
        console.log('ImageUploadManager - No productId provided')
        return
      }

      console.log('🔄 ImageUploadManager - Loading product images for:', productId)
      console.log('🔄 ImageUploadManager - Current images in state before API call:', images.length, images.map(img => ({ id: img.id, url: img.url.substring(0, 50) })))
      setIsLoading(true)

      try {
        // Add timestamp to prevent caching
        const timestamp = Date.now()
        console.log('🔍 ImageUploadManager - Fetching images with timestamp:', timestamp)
        const response = await apiClient.getProductImages(productId)
        console.log('✅ ImageUploadManager - Product images loaded from DB:', response.length, response)
        console.log('📋 Current productImages in state before update:', images.length)

        // Convert database images to the expected format
        const formattedImages = response.map(img => ({
          ...img,
          file: undefined, // No file for existing images
          needsSave: false
        }))

        onChange(formattedImages)
      } catch (error) {
        console.error('❌ ImageUploadManager - Failed to load product images:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProductImages()
  }, [productId, shouldReloadAfterUpload]) // Add shouldReloadAfterUpload to trigger reload after uploads

  // Renumber positions when all uploads are complete and processingFiles is empty
  React.useEffect(() => {
    if (processingFiles.size === 0 && images.length > 0) {
      // Sort by current position first, then check if renumbering is needed
      const sortedImages = [...images].sort((a, b) => a.position - b.position)
      const needsRenumbering = sortedImages.some((img, index) => img.position !== index)

      if (needsRenumbering) {
        console.log('🔄 Renumbering image positions after concurrent uploads')
        const renumberedImages = sortedImages.map((img, index) => ({
          ...img,
          position: index
        }))

        // Only update if positions actually changed
        const positionsChanged = renumberedImages.some((img, index) => img.position !== images[index]?.position)
        if (positionsChanged) {
          console.log('📋 Updating image positions in state:', renumberedImages.map(img => `${img.file_name}: ${img.position}`))
          onChange(renumberedImages)

          // If this is an existing product, save the updated positions to database
          if (productId) {
            updatePositionsInDatabase(renumberedImages)
          }
        }
      }
    }
  }, [processingFiles.size, images.length]) // Check when processing completes or images change

  // Function to update positions in database for existing products
  const updatePositionsInDatabase = async (renumberedImages: ProductImage[]) => {
    try {
      const positionUpdates = renumberedImages
        .filter(img => !img.id.startsWith('temp-')) // Only update images that are already in database
        .map(img => ({ id: img.id, position: img.position }))

      if (positionUpdates.length > 0) {
        console.log('💾 Updating image positions in database:', positionUpdates)
        await apiClient.updateProductImagePositions(productId!, positionUpdates)
        console.log('✅ Image positions updated in database successfully')
      }
    } catch (error) {
      console.error('❌ Failed to update image positions in database:', error)
      // Don't show error message to user as this is not critical
    }
  }

  
  // S3 upload function
  const uploadToS3 = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log('Starting product image S3 upload for file:', file.name)
      const response = await apiClient.uploadProductImage(formData)
      console.log('Product image S3 upload response:', response)

      if (response.success) {
        console.log('Product image S3 upload successful, URL:', response.data.url)
        return response.data.url
      } else {
        console.error('Product image S3 upload failed with response:', response)
        throw new Error(response.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Product image S3 upload error details:', error)
      throw error
    }
  }

  // Process a single file upload
  const processSingleFile = async (file: File, positionIndex: number, isPrimary: boolean): Promise<ProductImage | null> => {
    try {
      console.log(`🚀 Processing single file: ${file.name} (primary: ${isPrimary}, position: ${positionIndex})`)
      const s3Url = await uploadToS3(file)
      console.log(`✅ S3 upload complete for: ${file.name}`)

      return {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: s3Url,
        alt_text: file.name.split('.')[0],
        position: positionIndex,
        is_primary: isPrimary,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file,
        needsSave: true
      }
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
      message.error(`Failed to upload ${file.name}`)
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

    // Mark this file as being processed
    setProcessingFiles(prev => new Set(Array.from(prev).concat([fileKey])))

    // Calculate position based on the file's index in the original fileList
    // This preserves the original order the user selected
    const fileIndex = fileList.findIndex(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)
    const calculatedPosition = images.length + fileIndex

    console.log(`📁 File "${file.name}" - Index in fileList: ${fileIndex}, Calculated position: ${calculatedPosition}`)

    try {
      const remainingSlots = maxImages - images.length
      if (remainingSlots <= 0) {
        message.error(`Maximum ${maxImages} images allowed!`)
        return false
      }

      // Validate this single file
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

      setIsUploading(true)

      // Determine if this should be the primary image
      // Only set as primary if there's no existing primary image in the gallery and this is the first file
      const hasExistingPrimary = images.some(img => img.is_primary)
      const shouldThisBePrimary = !hasExistingPrimary && fileIndex === 0

      // Process this single file with calculated position
      const uploadedImage = await processSingleFile(file, calculatedPosition, shouldThisBePrimary)

      if (uploadedImage) {
        console.log(`📝 Processing image: ${uploadedImage.file_name} - S3 complete`)

        // Check if this is a new product (no productId) or existing product
        if (productId) {
          // Existing product - save directly to database
          console.log(`💾 Saving image to database for existing product: ${productId}`)
          try {
            const imageData = {
              url: uploadedImage.url,
              alt_text: uploadedImage.alt_text,
              file_name: uploadedImage.file_name,
              file_size: uploadedImage.file_size,
              file_type: uploadedImage.file_type,
              position: uploadedImage.position,
              is_primary: uploadedImage.is_primary,
            }

            const response = await apiClient.createProductImage(productId, imageData)
            if (response) {
              console.log(`✅ Image saved to database: ${response.id} (replacing temp ID: ${uploadedImage.id})`)

              // Use functional update to ensure we get the latest state
              const finalImage = { ...response, file: uploadedImage.file, needsSave: false }

              // Insert the image at the correct position to maintain order
              const updatedImages = [...images]
              const insertIndex = Math.min(uploadedImage.position, updatedImages.length)
              updatedImages.splice(insertIndex, 0, finalImage)
              onChange(updatedImages)

              message.success(`Image "${uploadedImage.file_name}" uploaded and saved`)
            } else {
              throw new Error('No response from database')
            }
          } catch (error) {
            console.error(`❌ Failed to save image to database: ${uploadedImage.id}`, error)
            // If database save fails, still add the uploaded image to state at correct position
            const updatedImages = [...images]
            const insertIndex = Math.min(uploadedImage.position, updatedImages.length)
            updatedImages.splice(insertIndex, 0, uploadedImage)
            onChange(updatedImages)

            message.warning(`Image uploaded to S3 but failed to save to database`)
          }
        } else {
          // New product - just add to state at correct position, don't save to database yet
          console.log(`📦 New product - adding image to state at position ${uploadedImage.position}: ${uploadedImage.file_name}`)
          const updatedImages = [...images]
          const insertIndex = Math.min(uploadedImage.position, updatedImages.length)
          updatedImages.splice(insertIndex, 0, uploadedImage)
          onChange(updatedImages)
          message.success(`Image "${uploadedImage.file_name}" uploaded successfully`)
        }
      }

      setIsUploading(false)
    } catch (error) {
      console.error('File upload failed:', error)
      message.error('Upload failed. Please try again.')
      setIsUploading(false)
    } finally {
      // Remove the file from processing set after a delay to prevent immediate reprocessing
      setTimeout(() => {
        setProcessingFiles(prev => {
          const newSet = new Set(prev)
          newSet.delete(fileKey)

          // When all uploads are complete, trigger reload to get fresh data from database
          if (newSet.size === 0) {
            setShouldReloadAfterUpload(prev => !prev) // Toggle to trigger useEffect
          }

          return newSet
        })
      }, 100)
    }

    return false // Prevent automatic upload
  }

  // Remove image
  const handleRemove = useCallback(async (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId)
    if (!imageToRemove) return

    try {
      // If image has a real database ID (not temp) and productId exists, delete from database
      if (!imageId.startsWith('temp-') && productId) {
        console.log('🗑️ Deleting image from database:', imageId)
        await apiClient.deleteProductImage(productId, imageId)
        message.success(`Image "${imageToRemove.file_name || 'image'}" deleted from database`)
      } else {
        console.log('🗑️ Removing temp/new product image from state:', imageId)
        message.success(`Image "${imageToRemove.file_name || 'image'}" removed`)
      }

      // Update local state
      const updatedImages = images.filter(img => img.id !== imageId)

      // If primary image was removed, make first image primary
      if (imageToRemove.is_primary && updatedImages.length > 0) {
        updatedImages[0].is_primary = true
      }

      // Update positions
      const repositionedImages = updatedImages.map((img, index) => ({
        ...img,
        position: index
      }))

      onChange(repositionedImages)
    } catch (error) {
      console.error('❌ Failed to delete image:', error)
      if (productId) {
        message.error('Failed to delete image from database')
      } else {
        message.error('Failed to remove image')
      }
    }
  }, [images, onChange, productId])

  // Set primary image
  const handleSetPrimary = useCallback(async (imageId: string) => {
    try {
      const updatedImages = images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      }))
      onChange(updatedImages)

      // Update primary image in database for non-temp images and when productId exists
      if (!imageId.startsWith('temp-') && productId) {
        await apiClient.updateProductImage(productId, imageId, {
          is_primary: true
        })
        message.success('Primary image updated')
      } else {
        message.success('Primary image updated')
      }
    } catch (error) {
      console.error('❌ Failed to update primary image:', error)
      if (productId) {
        message.error('Failed to update primary image')
      } else {
        message.error('Failed to update primary image')
      }
    }
  }, [images, onChange, productId])

  // Update alt text
  const handleUpdateAlt = useCallback(async (imageId: string, altText: string) => {
    try {
      const updatedImages = images.map(img =>
        img.id === imageId ? { ...img, alt_text: altText } : img
      )
      onChange(updatedImages)

      // Update alt text in database for non-temp images and when productId exists
      if (!imageId.startsWith('temp-') && productId) {
        await apiClient.updateProductImage(productId, imageId, {
          alt_text: altText
        })
        message.success('Alt text updated')
      } else {
        message.success('Alt text updated')
      }
    } catch (error) {
      console.error('❌ Failed to update alt text:', error)
      if (productId) {
        message.error('Failed to update alt text')
      } else {
        message.error('Failed to update alt text')
      }
    }
  }, [images, onChange, productId])

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
          <Upload.Dragger {...uploadProps} disabled={isUploading}>
            <div className="ant-upload-drag-icon">
              {isUploading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="loading-spinner" style={{ fontSize: 48, color: '#1890ff' }}>🔄</div>
                </div>
              ) : (
                <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              )}
            </div>
            <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>
              {isUploading ? 'Uploading to S3...' : 'Click or drag images to this area to upload'}
            </p>
            <p className="ant-upload-hint" style={{ color: '#666' }}>
              Support for JPG, PNG, GIF. Maximum {maxImages} images. Individual files must be smaller than 5MB.
            </p>
            <p style={{ color: '#52c41a', fontSize: 12, marginTop: 8 }}>
              📸 Drag to reorder images • ⭐ First image is automatically set as primary • ☁️ Images saved to cloud storage
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
                  <Button
                    size="small"
                    onClick={() => {
                      console.log('🔄 Manual refresh triggered')
                      const loadProductImages = async () => {
                        if (!productId) return
                        setIsLoading(true)
                        try {
                          const response = await apiClient.getProductImages(productId)
                          console.log('🔄 Manual refresh - images loaded:', response.length)
                          const formattedImages = response.map(img => ({
                            ...img,
                            file: undefined,
                            needsSave: false
                          }))
                          onChange(formattedImages)
                        } catch (error) {
                          console.error('Manual refresh failed:', error)
                        } finally {
                          setIsLoading(false)
                        }
                      }
                      loadProductImages()
                    }}
                    icon={<CameraOutlined />}
                  >
                    Refresh
                  </Button>
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