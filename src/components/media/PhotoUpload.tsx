import React, { useState, useCallback, useRef } from 'react';
import type { Photo } from '../../types';
import { APP_CONFIG, ERROR_MESSAGES } from '../../constants';
import { mediaService } from '../../services/mediaService';

interface PhotoUploadProps {
  onPhotosChange: (photos: File[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
  acceptedTypes?: string[];
  existingPhotos?: Photo[];
  disabled?: boolean;
}

interface PreviewPhoto {
  file: File;
  preview: string;
  id: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotosChange,
  maxFiles = APP_CONFIG.MAX_FILES_PER_UPLOAD,
  maxSizePerFile = APP_CONFIG.MAX_FILE_SIZE_MB,
  acceptedTypes = [...APP_CONFIG.SUPPORTED_IMAGE_TYPES],
  existingPhotos = [],
  disabled = false
}) => {
  const [previewPhotos, setPreviewPhotos] = useState<PreviewPhoto[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return ERROR_MESSAGES.INVALID_FILE_TYPE;
    }
    
    if (file.size > maxSizePerFile * 1024 * 1024) {
      return ERROR_MESSAGES.FILE_TOO_LARGE;
    }
    
    return null;
  };

  const compressImage = async (file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const processFiles = async (files: FileList | File[]) => {
    setError(null);
    setIsProcessing(true);
    
    const fileArray = Array.from(files);
    const totalFiles = previewPhotos.length + existingPhotos.length + fileArray.length;
    
    if (totalFiles > maxFiles) {
      setError(`Maximum ${maxFiles} photos allowed. You can add ${maxFiles - previewPhotos.length - existingPhotos.length} more.`);
      setIsProcessing(false);
      return;
    }
    
    const validFiles: File[] = [];
    const newPreviews: PreviewPhoto[] = [];
    
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setIsProcessing(false);
        return;
      }
      
      try {
        // Validate file first
        const validation = mediaService.validateImageFile(file);
        if (!validation.valid) {
          setError(validation.error || 'Invalid file');
          setIsProcessing(false);
          return;
        }

        // Compress the image
        const compressedFile = await compressImage(file);
        validFiles.push(compressedFile);
        
        // Create preview
        const preview = URL.createObjectURL(compressedFile);
        newPreviews.push({
          file: compressedFile,
          preview,
          id: `${Date.now()}-${Math.random()}`
        });
      } catch (error) {
        console.error('Error processing file:', error);
        setError('Error processing image. Please try again.');
        setIsProcessing(false);
        return;
      }
    }
    
    const updatedPreviews = [...previewPhotos, ...newPreviews];
    setPreviewPhotos(updatedPreviews);
    
    // Notify parent component
    const allFiles = updatedPreviews.map(p => p.file);
    onPhotosChange(allFiles);
    
    setIsProcessing(false);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const removePhoto = useCallback((photoId: string) => {
    const updatedPreviews = previewPhotos.filter(p => p.id !== photoId);
    setPreviewPhotos(updatedPreviews);
    
    // Clean up object URL
    const photoToRemove = previewPhotos.find(p => p.id === photoId);
    if (photoToRemove) {
      URL.revokeObjectURL(photoToRemove.preview);
    }
    
    // Notify parent component
    const allFiles = updatedPreviews.map(p => p.file);
    onPhotosChange(allFiles);
  }, [previewPhotos, onPhotosChange]);

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      previewPhotos.forEach(photo => {
        URL.revokeObjectURL(photo.preview);
      });
    };
  }, []);

  const canAddMore = previewPhotos.length + existingPhotos.length < maxFiles;

  return (
    <div className="photo-upload">
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`upload-area ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={disabled}
          />
          
          <div className="upload-content">
            {isProcessing ? (
              <>
                <div className="upload-spinner"></div>
                <p>Processing images...</p>
              </>
            ) : (
              <>
                <div className="upload-icon">📷</div>
                <p className="upload-text">
                  Drag and drop photos here, or <span className="upload-link">click to browse</span>
                </p>
                <p className="upload-info">
                  Max {maxFiles} photos • {maxSizePerFile}MB per file • JPEG, PNG, WebP
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="upload-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Photo Previews */}
      {(previewPhotos.length > 0 || existingPhotos.length > 0) && (
        <div className="photo-previews">
          <h4>Photos ({previewPhotos.length + existingPhotos.length}/{maxFiles})</h4>
          
          <div className="preview-grid">
            {/* Existing Photos */}
            {existingPhotos.map((photo) => (
              <div key={photo.id} className="preview-item existing">
                <img src={photo.filePath} alt={photo.caption || 'Existing photo'} />
                <div className="preview-overlay">
                  <span className="existing-badge">Existing</span>
                </div>
              </div>
            ))}
            
            {/* New Photo Previews */}
            {previewPhotos.map((photo) => (
              <div key={photo.id} className="preview-item">
                <img src={photo.preview} alt="Preview" />
                <div className="preview-overlay">
                  <button
                    type="button"
                    className="remove-photo"
                    onClick={() => removePhoto(photo.id)}
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
                <div className="preview-info">
                  <span className="file-name">{photo.file.name}</span>
                  <span className="file-size">
                    {(photo.file.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;