'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Upload, Button, Card, Image, Tag, Input, Space, message, Modal, Tooltip, Typography } from 'antd'
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarOutlined,
  PlusOutlined,
  CameraOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
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

export default function VariantImageUploadManager({
  images,
  onChange,
  maxImages = 10,
  variantId
}: VariantImageUploadManagerProps) {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')
  const [uploading, setUploading] = useState(false)

  // Load existing variant images on mount
  useEffect(() => {
    const loadVariantImages = async () => {
      if (!variantId || images.length > 0) {
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
  }, [variantId])

  const handleUpload = async (file: File) => {
    if (!variantId) {
      message.error('Variant ID is required for image upload')
      return false
    }

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)

      // Upload to backend using apiClient
      const result = await apiClient.uploadVariantImage(variantId, formData)

      if (result.success) {
        // Add new image to the list
        const newImage: VariantImage = {
          id: result.data.id || result.data.key || `new-${Date.now()}`,
          url: result.data.url,
          alt_text: result.data.originalName || '',
          position: result.data.position || images.length,
          is_primary: result.data.is_primary || (images.length === 0), // First image is primary by default
          file_name: result.data.originalName,
          file_size: result.data.size,
          file_type: result.data.mimetype,
        }

        onChange([...images, newImage])
        message.success(`Variant image "${file.name}" uploaded successfully`)
        return false // Prevent default upload behavior
      } else {
        message.error(result.message || 'Failed to upload image')
        return false
      }
    } catch (error) {
      console.error('Upload error:', error)
      message.error(`Failed to upload image "${file.name}"`)
      return false
    }
  }

  const handleMultipleUpload = async (fileList: File[]) => {
    if (!variantId) {
      message.error('Variant ID is required for image upload')
      return
    }

    const totalFiles = fileList.length
    const availableSlots = maxImages - images.length

    if (totalFiles > availableSlots) {
      message.error(`Can only upload ${availableSlots} more images (max: ${maxImages})`)
      return
    }

    setUploading(true)
    let successCount = 0
    let errorCount = 0

    try {
      // Process files one by one to avoid overwhelming the server
      for (const file of fileList) {
        try {
          const formData = new FormData()
          formData.append('file', file)

          const result = await apiClient.uploadVariantImage(variantId, formData)

          if (result.success) {
            const newImage: VariantImage = {
              id: result.data.id || result.data.key || `new-${Date.now()}-${Math.random()}`,
              url: result.data.url,
              alt_text: result.data.originalName || '',
              position: result.data.position || (images.length + successCount),
              is_primary: result.data.is_primary || (images.length === 0 && successCount === 0),
              file_name: result.data.originalName,
              file_size: result.data.size,
              file_type: result.data.mimetype,
            }

            // Update images list immediately
            onChange(prev => [...prev, newImage])
            successCount++
          } else {
            errorCount++
            console.error(`Upload failed for ${file.name}:`, result.message)
          }
        } catch (error) {
          errorCount++
          console.error(`Upload error for ${file.name}:`, error)
        }
      }

      // Show final status
      if (successCount > 0 && errorCount === 0) {
        message.success(`Successfully uploaded ${successCount} images`)
      } else if (successCount > 0 && errorCount > 0) {
        message.warning(`Uploaded ${successCount} images, ${errorCount} failed`)
      } else {
        message.error(`Failed to upload all ${totalFiles} images`)
      }
    } catch (error) {
      message.error('Upload process failed')
      console.error('Multiple upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    if (!variantId) {
      message.error('Variant ID is required')
      return
    }

    try {
      // Update all images to non-primary
      const updatedImages = images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      }))

      onChange(updatedImages)

      // If image needs to be saved, update backend
      const imageToSave = updatedImages.find(img => img.id === imageId)
      if (imageToSave && !imageToSave.id.startsWith('new-')) {
        const result = await apiClient.updateVariantImagePrimary(variantId, imageId)
        if (result.success) {
          message.success('Primary image updated successfully')
        } else {
          message.error(result.message || 'Failed to update primary image')
        }
      } else {
        message.success('Primary image updated')
      }
    } catch (error) {
      console.error('Primary image error:', error)
      message.error('Failed to update primary image')
    }
  }

  const handleRemove = async (imageId: string) => {
    if (!variantId) {
      message.error('Variant ID is required')
      return
    }

    // If image is primary and there are other images, don't allow removal
    const imageToRemove = images.find(img => img.id === imageId)
    if (imageToRemove?.is_primary && images.length > 1) {
      message.error('Cannot remove primary image. Please set another image as primary first.')
      return
    }

    try {
      // If image needs to be saved, delete from backend
      if (imageToRemove && !imageToRemove.id.startsWith('new-')) {
        const result = await apiClient.deleteVariantImage(variantId, imageId)
        if (!result.success) {
          message.error(result.message || 'Failed to delete image')
          return
        }
      }

      // Remove from local state
      const updatedImages = images.filter(img => img.id !== imageId)

      // If we removed the primary image and there are other images, set the first one as primary
      if (imageToRemove?.is_primary && updatedImages.length > 0) {
        updatedImages[0].is_primary = true
      }

      onChange(updatedImages)
      message.success('Image deleted successfully')
    } catch (error) {
      console.error('Delete error:', error)
      message.error('Failed to delete image')
    }
  }

  const handlePreview = (image: VariantImage) => {
    setPreviewImage(image.url)
    setPreviewTitle(image.alt_text || 'Image Preview')
    setPreviewVisible(true)
  }

  const handleAltTextChange = (imageId: string, altText: string) => {
    const updatedImages = images.map(img =>
      img.id === imageId ? { ...img, alt_text: altText, needsSave: true } : img
    )
    onChange(updatedImages)
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    accept: 'image/*',
    beforeUpload: (file, fileList) => {
      if (images.length >= maxImages) {
        message.error(`Maximum ${maxImages} images allowed`)
        return false
      }

      // Check file size (10MB max)
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error('Image must be smaller than 10MB')
        return false
      }

      // Handle multiple files at once
      // Only process the first file's fileList to avoid duplicate processing
      if (fileList.length > 0 && file === fileList[0]) {
        const validFiles = fileList.filter(f => {
          const isValidSize = f.size / 1024 / 1024 < 10
          const isValidType = f.type.startsWith('image/')
          return isValidSize && isValidType
        })

        if (validFiles.length > 0) {
          handleMultipleUpload(validFiles)
        }
      }

      return false // Prevent default upload behavior
    },
    fileList: [],
    showUploadList: false,
  }

  const getPrimaryImage = () => {
    const primaryImage = images.find(img => img.is_primary)
    if (primaryImage) {
      return (
        <div style={{ marginBottom: 16 }}>
          <Text strong>Primary Image:</Text>
          <div style={{ marginTop: 8, border: '2px solid #1890ff', borderRadius: 8, padding: 8, backgroundColor: '#f6ffed' }}>
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text}
              height={200}
              style={{ width: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      {getPrimaryImage()}

      <Upload.Dragger
        {...uploadProps}
        disabled={uploading || images.length >= maxImages}
        style={{
          marginBottom: 16,
          border: images.length >= maxImages ? '2px dashed #d9d9d9' : undefined
        }}
      >
        <p className="ant-upload-drag-icon">
          <CameraOutlined />
        </p>
        <p className="ant-upload-text">
          {uploading ? 'Uploading...' : 'Click or drag image files here to upload'}
        </p>
        <p className="ant-upload-hint">
          Support JPG, PNG, GIF, WebP (Max {maxImages} images, 10MB each)
        </p>
        {images.length >= maxImages && (
          <p style={{ color: '#ff4d4f' }}>
            Maximum image limit reached ({maxImages}/{maxImages})
          </p>
        )}
      </Upload.Dragger>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {images.map((image, index) => (
          <Card
            key={image.id}
            size="small"
            cover={
              <div style={{ position: 'relative' }}>
                <Image
                  src={image.url}
                  alt={image.alt_text}
                  height={150}
                  style={{ objectFit: 'cover', cursor: 'pointer' }}
                  fallback="data:image/svg+xml,%3Csvg width='200' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='200' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E"
                  onClick={() => handlePreview(image)}
                />

                {image.is_primary && (
                  <Tag color="gold" style={{ position: 'absolute', top: 8, left: 8 }}>
                    <StarOutlined /> Primary
                  </Tag>
                )}

                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
                  {!image.is_primary && (
                    <Tooltip title="Set as primary">
                      <Button
                        type="primary"
                        size="small"
                        icon={<StarOutlined />}
                        onClick={() => handleSetPrimary(image.id)}
                      />
                    </Tooltip>
                  )}
                  <Tooltip title="Preview">
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(image)}
                    />
                  </Tooltip>
                  <Tooltip title="Delete">
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemove(image.id)}
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
                onChange={(e) => handleAltTextChange(image.id, e.target.value)}
                size="small"
              />
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <img alt={previewTitle} style={{ width: '100%' }} src={previewImage} />
      </Modal>

      {images.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 40,
          color: '#999',
          backgroundColor: '#fafafa',
          borderRadius: 8,
          marginTop: 16
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
  )
}