// PhotoGallery component for displaying image collections
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Photo } from '../../types';
import { mediaService } from '../../services/mediaService';

interface PhotoGalleryProps {
  photos: Photo[];
  title?: string;
  maxVisible?: number;
  showCaptions?: boolean;
  layout?: 'grid' | 'carousel';
  enableLazyLoading?: boolean;
  carouselAutoplay?: boolean;
  carouselInterval?: number;
}

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

// Lazy loading image component
const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className={`lazy-image-container ${className || ''}`} onClick={onClick}>
      {isInView && (
        <>
          <img
            src={mediaService.getOptimizedImageUrl(src, { width: 400, quality: 80 })}
            alt={alt}
            onLoad={handleLoad}
            className={`lazy-image ${isLoaded ? 'loaded' : 'loading'}`}
          />
          {!isLoaded && (
            <div className="image-placeholder">
              <div className="placeholder-spinner"></div>
            </div>
          )}
        </>
      )}
      {!isInView && (
        <div className="image-placeholder">
          <div className="placeholder-icon">📷</div>
        </div>
      )}
    </div>
  );
};

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  title,
  maxVisible = 6,
  showCaptions = true,
  layout = 'grid',
  enableLazyLoading = true,
  carouselAutoplay = false,
  carouselInterval = 5000
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<number | null>(null);

  const openLightbox = useCallback((photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  const navigatePhoto = useCallback((direction: 'prev' | 'next') => {
    if (!selectedPhoto) return;
    
    let newIndex = currentIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    } else {
      newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    }
    
    setCurrentIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  }, [selectedPhoto, currentIndex, photos]);

  const navigateCarousel = useCallback((direction: 'prev' | 'next') => {
    let newIndex = carouselIndex;
    if (direction === 'prev') {
      newIndex = carouselIndex > 0 ? carouselIndex - 1 : photos.length - 1;
    } else {
      newIndex = carouselIndex < photos.length - 1 ? carouselIndex + 1 : 0;
    }
    setCarouselIndex(newIndex);
  }, [carouselIndex, photos.length]);

  const goToSlide = useCallback((index: number) => {
    setCarouselIndex(index);
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (layout === 'carousel' && carouselAutoplay && photos.length > 1) {
      autoplayRef.current = window.setInterval(() => {
        navigateCarousel('next');
      }, carouselInterval);

      return () => {
        if (autoplayRef.current) {
          window.clearInterval(autoplayRef.current);
        }
      };
    }
  }, [layout, carouselAutoplay, carouselInterval, navigateCarousel, photos.length]);

  // Pause autoplay on hover
  const pauseAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      window.clearInterval(autoplayRef.current);
    }
  }, []);

  const resumeAutoplay = useCallback(() => {
    if (layout === 'carousel' && carouselAutoplay && photos.length > 1) {
      autoplayRef.current = window.setInterval(() => {
        navigateCarousel('next');
      }, carouselInterval);
    }
  }, [layout, carouselAutoplay, carouselInterval, navigateCarousel, photos.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      navigatePhoto('prev');
    } else if (e.key === 'ArrowRight') {
      navigatePhoto('next');
    }
  }, [closeLightbox, navigatePhoto]);

  if (photos.length === 0) {
    return (
      <div className="photo-gallery-empty">
        <div className="empty-state">
          <span className="empty-icon">📷</span>
          <p>No photos available</p>
        </div>
      </div>
    );
  }

  if (layout === 'carousel') {
    return (
      <div className="photo-gallery photo-carousel">
        {title && <h3 className="photo-gallery-title">{title}</h3>}
        
        <div 
          className="carousel-container"
          onMouseEnter={pauseAutoplay}
          onMouseLeave={resumeAutoplay}
        >
          <div 
            ref={carouselRef}
            className="carousel-track"
            style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
          >
            {photos.map((photo, index) => (
              <div key={photo.id} className="carousel-slide">
                {enableLazyLoading ? (
                  <LazyImage
                    src={photo.filePath}
                    alt={photo.caption || `Photo ${index + 1}`}
                    className="carousel-image"
                    onClick={() => openLightbox(photo, index)}
                  />
                ) : (
                  <img
                    src={mediaService.getOptimizedImageUrl(photo.filePath, { width: 800, quality: 85 })}
                    alt={photo.caption || `Photo ${index + 1}`}
                    className="carousel-image"
                    onClick={() => openLightbox(photo, index)}
                  />
                )}
                {showCaptions && photo.caption && (
                  <div className="carousel-caption">
                    {photo.caption}
                  </div>
                )}
              </div>
            ))}
          </div>

          {photos.length > 1 && (
            <>
              <button 
                className="carousel-nav carousel-prev" 
                onClick={() => navigateCarousel('prev')}
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button 
                className="carousel-nav carousel-next" 
                onClick={() => navigateCarousel('next')}
                aria-label="Next photo"
              >
                ›
              </button>
            </>
          )}

          {/* Carousel indicators */}
          {photos.length > 1 && (
            <div className="carousel-indicators">
              {photos.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-indicator ${index === carouselIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid layout (default)
  const visiblePhotos = photos.slice(0, maxVisible);
  const remainingCount = photos.length - maxVisible;

  return (
    <div className="photo-gallery">
      {title && <h3 className="photo-gallery-title">{title}</h3>}
      
      <div className="photo-grid">
        {visiblePhotos.map((photo, index) => (
          <div 
            key={photo.id} 
            className={`photo-item ${index === 0 ? 'featured' : ''}`}
            onClick={() => openLightbox(photo, index)}
          >
            {enableLazyLoading ? (
              <LazyImage
                src={photo.filePath}
                alt={photo.caption || `Photo ${index + 1}`}
              />
            ) : (
              <img 
                src={mediaService.getOptimizedImageUrl(photo.filePath, { width: 400, quality: 80 })}
                alt={photo.caption || `Photo ${index + 1}`}
                loading="lazy"
              />
            )}
            {showCaptions && photo.caption && (
              <div className="photo-caption">
                {photo.caption}
              </div>
            )}
            {index === maxVisible - 1 && remainingCount > 0 && (
              <div className="photo-overlay">
                <span className="remaining-count">+{remainingCount}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
          className="lightbox-overlay" 
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="lightbox-close" 
              onClick={closeLightbox}
              aria-label="Close"
            >
              ×
            </button>
            
            {photos.length > 1 && (
              <>
                <button 
                  className="lightbox-nav lightbox-prev" 
                  onClick={() => navigatePhoto('prev')}
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button 
                  className="lightbox-nav lightbox-next" 
                  onClick={() => navigatePhoto('next')}
                  aria-label="Next photo"
                >
                  ›
                </button>
              </>
            )}
            
            <img 
              src={mediaService.getOptimizedImageUrl(selectedPhoto.filePath, { width: 1200, quality: 90 })}
              alt={selectedPhoto.caption || 'Photo'}
            />
            
            {showCaptions && selectedPhoto.caption && (
              <div className="lightbox-caption">
                {selectedPhoto.caption}
              </div>
            )}
            
            <div className="lightbox-counter">
              {currentIndex + 1} of {photos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;