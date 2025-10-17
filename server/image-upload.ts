import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from "dotenv";
config(); // Load environment variables from .env file
// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads (memory storage for Supabase uploads)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Track recent uploads to prevent duplicates
const recentUploads = new Map<string, { timestamp: number; url: string }>();
const DUPLICATE_WINDOW_MS = 2000; // 2 second window to detect duplicates

export const uploadImage = upload.single('image');

export const handleImageUpload = async (req: Request, res: Response) => {
  try {
    console.log('📸 Image upload request received:', {
      hasFile: !!req.file,
      filename: req.file?.originalname,
      size: req.file?.size,
      timestamp: new Date().toISOString()
    });

    if (!req.file) {
      return res.status(400).json({
        success: 0,
        message: 'No file uploaded'
      });
    }

    // Check for duplicate uploads within the time window
    const uploadKey = `${req.file.originalname}-${req.file.size}`;
    const now = Date.now();
    const recent = recentUploads.get(uploadKey);
    
    if (recent && (now - recent.timestamp) < DUPLICATE_WINDOW_MS) {
      console.log('📸 Duplicate upload detected, returning cached result:', uploadKey);
      return res.json({
        success: 1,
        file: {
          url: recent.url
        }
      });
    }

    // Generate fallback filename for local storage
    const fallbackFilename = `${Date.now()}-${req.file.originalname}`;
    let fileUrl = `/uploads/${fallbackFilename}`;
    
    // Upload to Supabase Storage if available
    const { supabase } = await import('./auth-middleware');
    if (supabase) {
      try {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const { data, error } = await supabase.storage
          .from('content-images')
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true
          });

        if (error) {
          console.error('Supabase storage upload error:', error);
        } else {
          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('content-images')
            .getPublicUrl(fileName);
          
          if (publicUrlData.publicUrl) {
            fileUrl = publicUrlData.publicUrl;
            console.log(`📸 Editor image uploaded to Supabase: ${fileUrl}`);
          }
        }
      } catch (storageError) {
        console.error('Storage error:', storageError);
        // Continue with local storage as fallback
      }
    }
    
    // Cache this upload to prevent duplicates
    recentUploads.set(uploadKey, { timestamp: now, url: fileUrl });
    
    // Clean up old entries periodically
    if (recentUploads.size > 100) {
      const cutoff = now - DUPLICATE_WINDOW_MS;
      const keysToDelete: string[] = [];
      recentUploads.forEach((value, key) => {
        if (value.timestamp < cutoff) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => recentUploads.delete(key));
    }

    console.log(`📸 Responding with upload success: ${fileUrl}`);
    res.json({
      success: 1,
      file: {
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: 0,
      message: 'Failed to upload image'
    });
  }
};

export const handleImageUploadByUrl = async (req: Request, res: Response) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({
      success: 0,
      message: 'URL is required'
    });
  }

  try {
    // For now, just return the URL as-is
    // In a production app, you might want to download and validate the image
    res.json({
      success: 1,
      file: {
        url: url
      }
    });
  } catch (error) {
    res.status(500).json({
      success: 0,
      message: 'Failed to process image URL'
    });
  }
};