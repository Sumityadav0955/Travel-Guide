import type { Photo } from '../types';
import { API_ENDPOINTS, APP_CONFIG, ERROR_MESSAGES } from '../constants';
import { api, uploadFile, ApiError } from '../utils/api';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  photo?: Photo;
  error?: string;
}

class MediaService {

  /**
   * Upload a single photo file
   */
  async uploadPhoto(
    file: File,
    entityType: 'location' | 'review',
    entityId: string,
    caption?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      const additionalData: Record<string, string> = {
        entityType,
        entityId,
      };
      
      if (caption) {
        additionalData.caption = caption;
      }

      const response = await uploadFile(
        API_ENDPOINTS.MEDIA.UPLOAD,
        file,
        additionalData,
        onProgress
      );

      return { success: true, photo: response.data };
    } catch (error) {
      console.error('Photo upload error:', error);
      return {
        success: false,
        error: error instanceof ApiError ? error.message : ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Upload multiple photos
   */
  async uploadPhotos(
    files: File[],
    entityType: 'location' | 'review',
    entityId: string,
    captions?: string[],
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    let totalUploaded = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const caption = captions?.[i];

      const result = await this.uploadPhoto(
        file,
        entityType,
        entityId,
        caption,
        (fileProgress) => {
          if (onProgress) {
            const overallProgress = {
              loaded: totalUploaded + fileProgress.loaded,
              total: files.reduce((sum, f) => sum + f.size, 0),
              percentage: Math.round(
                ((totalUploaded + fileProgress.loaded) / 
                 files.reduce((sum, f) => sum + f.size, 0)) * 100
              )
            };
            onProgress(overallProgress);
          }
        }
      );

      results.push(result);
      totalUploaded += file.size;
    }

    return results;
  }

  /**
   * Delete a photo
   */
  async deletePhoto(photoId: string): Promise<boolean> {
    try {
      await api.delete(API_ENDPOINTS.MEDIA.DELETE(photoId));
      return true;
    } catch (error) {
      console.error('Photo deletion error:', error);
      return false;
    }
  }

  /**
   * Get photos for an entity
   */
  async getPhotos(entityType: 'location' | 'review', entityId: string): Promise<Photo[]> {
    try {
      const response = await api.get<Photo[]>(API_ENDPOINTS.MEDIA.BY_ENTITY(entityType, entityId));
      return response.data;
    } catch (error) {
      console.error('Error fetching photos:', error);
      return [];
    }
  }

  /**
   * Update photo caption
   */
  async updatePhotoCaption(photoId: string, caption: string): Promise<boolean> {
    try {
      await api.patch(API_ENDPOINTS.MEDIA.BY_ID(photoId), { caption });
      return true;
    } catch (error) {
      console.error('Error updating photo caption:', error);
      return false;
    }
  }

  /**
   * Generate optimized image URL with transformations
   */
  getOptimizedImageUrl(
    filePath: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    } = {}
  ): string {
    const params = new URLSearchParams();
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);

    const queryString = params.toString();
    return queryString ? `${filePath}?${queryString}` : filePath;
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File, maxSizeMB = APP_CONFIG.MAX_FILE_SIZE_MB): { valid: boolean; error?: string } {
    if (!APP_CONFIG.SUPPORTED_IMAGE_TYPES.includes(file.type as any)) {
      return {
        valid: false,
        error: ERROR_MESSAGES.INVALID_FILE_TYPE
      };
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return {
        valid: false,
        error: ERROR_MESSAGES.FILE_TOO_LARGE
      };
    }

    return { valid: true };
  }

  /**
   * Create thumbnail from image file
   */
  async createThumbnail(
    file: File,
    maxWidth = 200,
    maxHeight = 200,
    quality = 0.8
  ): Promise<Blob | null> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate thumbnail dimensions
        let { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        
        width *= ratio;
        height *= ratio;

        canvas.width = width;
        canvas.height = height;

        // Draw thumbnail
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(resolve, file.type, quality);
      };

      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Extract EXIF data from image (basic implementation)
   */
  async extractImageMetadata(file: File): Promise<{
    width?: number;
    height?: number;
    size: number;
    type: string;
    lastModified: number;
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        });
      };

      img.onerror = () => {
        resolve({
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        });
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

export const mediaService = new MediaService();