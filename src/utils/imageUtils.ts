import exifr from 'exifr';
import { logger } from '@/utils/logger';

export interface ImageMetadata {
  file: File;
  preview: string;
  latitude?: number;
  longitude?: number;
  timestamp?: Date;
}

/**
 * Extract EXIF GPS data from image file
 */
export const extractGPSData = async (file: File): Promise<{ latitude?: number; longitude?: number; timestamp?: Date }> => {
  try {
    const exifData = await exifr.parse(file, {
      gps: true,
      pick: ['latitude', 'longitude', 'DateTimeOriginal', 'CreateDate']
    });

    if (!exifData) {
      return {};
    }

    return {
      latitude: exifData.latitude,
      longitude: exifData.longitude,
      timestamp: exifData.DateTimeOriginal || exifData.CreateDate
    };
  } catch (error) {
    logger.error('Error extracting EXIF data:', error);
    return {};
  }
};

/**
 * Compress image file for upload
 */
export const compressImage = async (file: File, maxSizeMB: number = 2): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Calculate new dimensions while maintaining aspect ratio
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          'image/jpeg',
          0.85
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 */
export const validateImage = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a valid image file (JPEG, PNG, or WebP)' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }
  
  return { valid: true };
};
