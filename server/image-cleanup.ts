import { supabase } from './auth-middleware';

export async function deleteImageFromStorage(imageUrl: string): Promise<boolean> {
  if (!imageUrl || !imageUrl.includes('supabase.co') || !supabase) {
    return false;
  }

  try {
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    // Determine which bucket based on URL
    let bucketName = 'content-images';
    if (imageUrl.includes('character-images')) {
      bucketName = 'character-images';
    } else if (imageUrl.includes('profile-images')) {
      bucketName = 'profile-images';
    }
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([decodeURIComponent(fileName)]);
      
    if (error) {
      console.error('Supabase storage deletion error:', error);
      return false;
    }
    
    console.log(`Successfully deleted image from ${bucketName}: ${fileName}`);
    return true;
  } catch (error) {
    console.error('Image deletion error:', error);
    return false;
  }
}

export async function cleanupContentImages(oldContent: string, newContent: string): Promise<void> {
  try {
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
      } catch {
        return [];
      }
    };
    
    const oldImages = getImagesFromContent(oldContent);
    const newImages = getImagesFromContent(newContent);
    
    // Find images that were removed
    const removedImages = oldImages.filter(url => !newImages.includes(url));
    
    console.log('Content image cleanup:', {
      oldImages: oldImages.length,
      newImages: newImages.length,
      removedImages: removedImages.length
    });
    
    // Delete removed images from storage
    for (const imageUrl of removedImages) {
      const success = await deleteImageFromStorage(imageUrl);
      if (success) {
        console.log(`✅ Cleaned up unused content image: ${imageUrl}`);
      }
    }
  } catch (error) {
    console.error('Error during content image cleanup:', error);
  }
}