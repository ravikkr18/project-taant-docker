import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor() {
    this.region = process.env.SUPABASE_S3_REGION || 'ap-southeast-2';
    this.bucketName = process.env.SUPABASE_S3_BUCKET || 'taant-content';

    this.s3Client = new S3Client({
      region: this.region,
      endpoint: process.env.SUPABASE_S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY || '',
        secretAccessKey: process.env.SUPABASE_S3_SECRET_KEY || '',
      },
      forcePathStyle: true, // Required for Supabase S3
    });
  }

  /**
   * Upload a file buffer to S3
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string,
    folder: string = 'a-plus-content'
  ): Promise<{ url: string; key: string }> {
    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      ACL: 'public-read', // Make files publicly accessible
    });

    try {
      await this.s3Client.send(command);

      // Construct the public URL for Supabase S3
      const publicUrl = `${process.env.SUPABASE_S3_ENDPOINT?.replace('/storage/v1/s3', '/storage/v1/object/public')}/${this.bucketName}/${key}`;

      return {
        url: publicUrl,
        key,
      };
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Get a pre-signed URL for uploading directly from frontend
   */
  async getUploadSignedUrl(
    fileName: string,
    contentType: string,
    folder: string = 'a-plus-content'
  ): Promise<{ url: string; key: string; publicUrl: string }> {
    const key = `${folder}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
    });

    try {
      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

      // Construct the public URL
      const publicUrl = `${process.env.SUPABASE_S3_ENDPOINT?.replace('/storage/v1/s3', '/storage/v1/object/public')}/${this.bucketName}/${key}`;

      return {
        url: signedUrl,
        key,
        publicUrl,
      };
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Convert blob URL to S3 URL by uploading the file
   */
  async convertBlobUrlToS3(blobUrl: string, fileName: string): Promise<string> {
    try {
      // Fetch the blob data
      const response = await fetch(blobUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      // Extract file extension from blob URL or generate one
      const extension = this.getFileExtensionFromBlob(blobUrl, contentType);
      const finalFileName = fileName.includes('.') ? fileName : `${fileName}${extension}`;

      // Upload to S3
      const result = await this.uploadFile(buffer, finalFileName, contentType);

      return result.url;
    } catch (error) {
      throw new Error(`Failed to convert blob URL to S3: ${error.message}`);
    }
  }

  /**
   * Extract file extension from blob URL or content type
   */
  private getFileExtensionFromBlob(blobUrl: string, contentType: string): string {
    // Try to extract from blob URL first
    const urlMatch = blobUrl.match(/blob:.*\/.*\.([a-zA-Z0-9]+)/);
    if (urlMatch) {
      return `.${urlMatch[1]}`;
    }

    // Fall back to content type
    const typeMap: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
    };

    return typeMap[contentType] || '.jpg';
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectsCommand({
      Bucket: this.bucketName,
      Delete: {
        Objects: [{ Key: key }],
        Quiet: false,
      },
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * List all files in a specific S3 folder
   */
  async listS3Files(prefix: string = ''): Promise<Array<{ key: string; size?: number; lastModified?: Date }>> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
    });

    try {
      const response = await this.s3Client.send(command);

      return (response.Contents || []).map(obj => ({
        key: obj.Key || '',
        size: obj.Size,
        lastModified: obj.LastModified,
      }));
    } catch (error) {
      throw new Error(`Failed to list S3 files: ${error.message}`);
    }
  }

  /**
   * Delete multiple files from S3
   */
  async deleteMultipleFiles(keys: string[]): Promise<string[]> {
    if (keys.length === 0) return [];

    const command = new DeleteObjectsCommand({
      Bucket: this.bucketName,
      Delete: {
        Objects: keys.map(key => ({ Key: key })),
        Quiet: false,
      },
    });

    try {
      const response = await this.s3Client.send(command);
      return response.Deleted?.map(deleted => deleted.Key || '') || [];
    } catch (error) {
      throw new Error(`Failed to delete multiple files: ${error.message}`);
    }
  }

  /**
   * Upload product image to S3 with proper folder structure
   */
  async uploadProductImage(
    file: Express.Multer.File,
    userId: string
  ): Promise<string> {
    try {
      // Create unique filename with timestamp
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileExtension = file.originalname.split('.').pop() || 'jpg';
      const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;

      // Upload to product-images folder with user subfolder
      const result = await this.uploadFile(
        file.buffer,
        uniqueFileName,
        file.mimetype,
        `product-images/${userId}`
      );

      return result.url;
    } catch (error) {
      throw new Error(`Failed to upload product image: ${error.message}`);
    }
  }

  /**
   * Upload variant image to S3 with proper folder structure
   */
  async uploadVariantImage(
    file: Express.Multer.File,
    userId: string,
    variantId: string
  ): Promise<string> {
    try {
      // Create unique filename with timestamp
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileExtension = file.originalname.split('.').pop() || 'jpg';
      const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;

      // Upload to variant-images folder with user and variant subfolders
      const result = await this.uploadFile(
        file.buffer,
        uniqueFileName,
        file.mimetype,
        `variant-images/${userId}/${variantId}`
      );

      return result.url;
    } catch (error) {
      throw new Error(`Failed to upload variant image: ${error.message}`);
    }
  }

  /**
   * Upload review media (image/video) to S3 with proper folder structure
   */
  async uploadReviewMedia(
    file: Express.Multer.File,
    reviewId: string
  ): Promise<string> {
    try {
      // Create unique filename with timestamp
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileExtension = file.originalname.split('.').pop() || 'jpg';
      const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;

      // Upload to review-media folder with review subfolder
      const result = await this.uploadFile(
        file.buffer,
        uniqueFileName,
        file.mimetype,
        `review-media/${reviewId}`
      );

      return result.url;
    } catch (error) {
      throw new Error(`Failed to upload review media: ${error.message}`);
    }
  }

  /**
   * Get signed URL for direct review media upload from frontend
   */
  async getReviewMediaUploadSignedUrl(
    reviewId: string,
    fileName: string,
    contentType: string
  ): Promise<{ url: string; key: string; publicUrl: string }> {
    return this.getUploadSignedUrl(fileName, contentType, `review-media/${reviewId}`);
  }

  /**
   * Get signed URL for direct review media upload from frontend (with timestamp)
   */
  async getReviewMediaUploadSignedUrlWithTimestamp(
    reviewId: string,
    fileName: string,
    contentType: string
  ): Promise<{ url: string; key: string; publicUrl: string }> {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = fileName.split('.').pop() || 'jpg';
    const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;

    const key = `review-media/${reviewId}/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
    });

    try {
      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

      // Construct the public URL
      const publicUrl = `${process.env.SUPABASE_S3_ENDPOINT?.replace('/storage/v1/s3', '/storage/v1/object/public')}/${this.bucketName}/${key}`;

      return {
        url: signedUrl,
        key,
        publicUrl,
      };
    } catch (error) {
      throw new Error(`Failed to generate review media signed URL: ${error.message}`);
    }
  }

  /**
   * Delete review media from S3
   */
  async deleteReviewMedia(reviewId: string, fileName: string): Promise<void> {
    const key = `review-media/${reviewId}/${fileName}`;
    return this.deleteFile(key);
  }

  /**
   * Delete all media for a specific review
   */
  async deleteAllReviewMedia(reviewId: string): Promise<string[]> {
    try {
      // List all files in the review media folder
      const files = await this.listS3Files(`review-media/${reviewId}/`);

      if (files.length === 0) return [];

      // Delete all files
      const keys = files.map(file => file.key);
      return this.deleteMultipleFiles(keys);
    } catch (error) {
      throw new Error(`Failed to delete review media: ${error.message}`);
    }
  }
}