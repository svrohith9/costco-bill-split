
// This file contains image processing utilities including OCR functionality

import * as Tesseract from 'tesseract.js';

// Function to convert an image to base64
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Function to compress an image
export const compressImage = (base64: string, maxWidth = 1200, maxHeight = 1600, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round(height * maxWidth / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round(width * maxHeight / height);
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with compression
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.onerror = () => reject(new Error('Image loading error'));
  });
};

// Function to perform OCR on an image
export const performOCR = async (imageUrl: string): Promise<string> => {
  try {
    console.log('Starting OCR process...');
    
    // Fix: Use proper worker options object instead of just language string
    const worker = await Tesseract.createWorker({
      logger: m => console.log(m),
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      gzip: false
    });
    
    // Set language to English
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    // Set parameters to improve OCR on receipts
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,$%:/ -',
      preserve_interword_spaces: '1',
    });
    
    const ret = await worker.recognize(imageUrl);
    const text = ret.data.text;
    
    console.log('OCR completed successfully');
    await worker.terminate();
    
    return text;
  } catch (error) {
    console.error('OCR failed:', error);
    throw new Error('Failed to extract text from image');
  }
};
