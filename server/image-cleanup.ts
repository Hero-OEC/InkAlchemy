import { supabase } from './auth-middleware';
import { config } from "dotenv";
config(); // Load environment variables from .env file
export async function deleteImageFromStorage(imageUrl: string): Promise<boolean> {
  if (!imageUrl || !imageUrl.includes('supabase.co') || !supabase) {
    return false;
  }

  try {
    // Extract full path from URL for proper folder-aware deletion
    const urlParts = imageUrl.split('/storage/v1/object/public/');
    if (urlParts.length < 2) {
      console.error('Invalid Supabase storage URL format');
      return false;
    }
    
    const pathParts = urlParts[1].split('/');
    const bucketName = pathParts[0];
    const filePath = pathParts.slice(1).join('/');
    
    console.log(`Attempting to delete: ${filePath} from bucket: ${bucketName}`);
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([decodeURIComponent(filePath)]);
      
    if (error) {
      console.error('Supabase storage deletion error:', error);
      return false;
    }
    
    console.log(`Successfully deleted image from ${bucketName}: ${filePath}`);
    
    // Try to clean up empty folder if this was in a character-specific or user-specific folder
    if (filePath.includes('/') && bucketName === 'character-images') {
      await cleanupEmptyFolder(bucketName, filePath);
    }
    
    return true;
  } catch (error) {
    console.error('Image deletion error:', error);
    return false;
  }
}

async function cleanupEmptyFolder(bucketName: string, filePath: string): Promise<void> {
  if (!supabase) {
    return;
  }
  
  try {
    const folderPath = filePath.substring(0, filePath.lastIndexOf('/'));
    
    // List remaining files in the folder
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath);
    
    if (error) {
      console.log(`Could not check folder contents for cleanup: ${error.message}`);
      return;
    }
    
    // If folder is empty, try to remove it (this might not work in all storage systems)
    if (!files || files.length === 0) {
      console.log(`Folder ${folderPath} is empty after file deletion, but Supabase doesn't support folder deletion`);
      // Note: Supabase Storage doesn't support deleting empty folders
      // They are automatically cleaned up over time or remain as empty containers
    }
  } catch (error) {
    console.log('Folder cleanup check failed:', error);
  }
}

export async function cleanupContentImages(oldContent: string, newContent: string): Promise<void> {
  try {
    console.log('🧹 Starting content image cleanup:', {
      oldContentLength: oldContent?.length || 0,
      newContentLength: newContent?.length || 0,
      hasOldContent: !!oldContent,
      hasNewContent: !!newContent
    });

    // Parse old and new content to find images
    const getImagesFromContent = (content: string) => {
      if (!content) return [];
      try {
        const data = JSON.parse(content);
        const images: string[] = [];
        
        if (data.blocks) {
          data.blocks.forEach((block: any) => {
            if (block.type === 'image' && block.data?.file?.url) {
              images.push(block.data.file.url);
            }
          });
        }
        
        return images;
      } catch (parseError) {
        console.error('Failed to parse content for image cleanup:', parseError);
        return [];
      }
    };
    
    const oldImages = getImagesFromContent(oldContent);
    const newImages = getImagesFromContent(newContent);
    
    // Find images that were removed
    const removedImages = oldImages.filter(url => !newImages.includes(url));
    
    console.log('Content image cleanup analysis:', {
      oldImages: oldImages.length,
      newImages: newImages.length,
      removedImages: removedImages.length,
      removedImagesList: removedImages
    });
    
    // Delete removed images from storage
    for (const imageUrl of removedImages) {
      try {
        const success = await deleteImageFromStorage(imageUrl);
        if (success) {
          console.log(`✅ Cleaned up unused content image: ${imageUrl}`);
        } else {
          console.log(`⚠️ Failed to clean up image: ${imageUrl}`);
        }
      } catch (deleteError) {
        console.error(`❌ Error deleting image ${imageUrl}:`, deleteError);
      }
    }
    
    console.log('🧹 Content image cleanup completed');
  } catch (error) {
    console.error('❌ Error during content image cleanup:', error);
    throw error; // Re-throw to help identify the issue in the parent function
  }
}