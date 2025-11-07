import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Photo } from '../../types';
import { mediaService } from '../../services/mediaService';

interface ImageCarouselProps {
  photos: Photo[];
  autoplay?: boolean;
  interval?: number;
  showIndicators?: boolean;
  showNavigation?: boolean;
  showCaptions?: boolean;
  aspectRatio?: string;
  onPhotoClick?: (photo: Photo, index: number) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  photos,
  autoplay = false,
  interval = 5000,
  showIndicators = true,
  showNavigation = true,
  showCaptions = true,
  aspectRatio = '16/9',
  onPhotoClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    let newIndex = currentIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    } else {
      newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    }
    setCurrentIndex(newIndex);
  }, [currentIndex, photos.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (isPlaying && photos.length > 1) {
      intervalRef.current = window.setInterval(() => {
        navigate('next');
      }, interval);

      return () => {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
        }
      };
    }
  }, [isPlaying, interval, navigate, photos.length]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
  }, []);

  const play = useCallback(() => {
    if (photos.length > 1) {
      setIsPlaying(true);
    }
  }, [photos.length]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  // Touch/swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      navigate('next');
    } else if (isRightSwipe) {
      navigate('prev');
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      navigate('prev');
    } else if (e.key === 'ArrowRight') {
      navigate('next');
    } else if (e.key === ' ') {
      e.preventDefault();
      togglePlayPause();
    }
  }, [navigate, togglePlayPause]);

  if (photos.length === 0) {
    return (
      <div className="image-carousel-empty">
        <div className="empty-state">
          <span className="empty-icon">📷</span>
          <p>No images to display</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="image-carousel"
      style={{ aspectRatio }}
      onMouseEnter={pause}
      onMouseLeave={play}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={carouselRef}
    >
      <div 
        className="carousel-viewport"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {photos.map((photo, index) => (
            <div key={photo.id} className="carousel-slide">
              <img
                src={mediaService.getOptimizedImageUrl(photo.filePath, { 
                  width: 800, 
                  quality: 85 
                })}
                alt={photo.caption || `Image ${index + 1}`}
                className="carousel-image"
                onClick={() => onPhotoClick?.(photo, index)}
                style={{ cursor: onPhotoClick ? 'pointer' : 'default' }}
              />
              {showCaptions && photo.caption && (
                <div className="carousel-caption">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {showNavigation && photos.length > 1 && (
        <>
          <button 
            className="carousel-nav carousel-prev" 
            onClick={() => navigate('prev')}
            aria-label="Previous image"
          >
            ‹
          </button>
          <button 
            className="carousel-nav carousel-next" 
            onClick={() => navigate('next')}
            aria-label="Next image"
          >
            ›
          </button>
        </>
      )}

      {/* Play/Pause button */}
      {autoplay && photos.length > 1 && (
        <button 
          className="carousel-play-pause"
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
      )}

      {/* Indicators */}
      {showIndicators && photos.length > 1 && (
        <div className="carousel-indicators">
          {photos.map((_, index) => (
            <button
              key={index}
              className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {photos.length > 1 && (
        <div className="carousel-counter">
          {currentIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;