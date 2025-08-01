import { useCallback } from 'react';

export const useImageCleanup = () => {
  const deleteUnusedImages = useCallback(async (oldContent: string, newContent: string) => {
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
      
      console.log('Image cleanup check:', {
        oldImages: oldImages.length,
        newImages: newImages.length,
        removedImages: removedImages.length,
        removed: removedImages
      });
      
      // Delete removed images from storage
      for (const imageUrl of removedImages) {
        if (imageUrl.includes('supabase.co')) {
          try {
            // Get authentication token
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(
              import.meta.env.VITE_SUPABASE_URL,
              import.meta.env.VITE_SUPABASE_ANON_KEY
            );
            
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            const response = await fetch('/api/delete-image', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
              },
              body: JSON.stringify({ url: imageUrl }),
            });
            
            if (response.ok) {
              console.log(`✅ Successfully deleted unused image: ${imageUrl}`);
            } else {
              console.error(`❌ Failed to delete image: ${response.statusText}`);
            }
          } catch (error) {
            console.error('Failed to delete image:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error during image cleanup:', error);
    }
  }, []);
  
  return { deleteUnusedImages };
};