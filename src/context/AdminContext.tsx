import React, { createContext, useContext, useState, useEffect } from 'react';
import { HeroImage, Category, Album, Image } from '@/types';
import { getInitialData } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';
import { categoryAPI, albumAPI } from '@/services/api';

interface AdminContextType {
  heroImages: HeroImage[];
  categories: Category[];
  albums: Album[];
  images: Image[];
  loading: {
    categories: boolean;
    albums: boolean;
    images: boolean;
    heroImages: boolean;
  };
  
  // Hero Section Methods
  addHeroImage: (image: Omit<HeroImage, 'id' | 'order'>) => void;
  updateHeroImage: (id: string, updates: Partial<HeroImage>) => void;
  deleteHeroImage: (id: string) => void;
  reorderHeroImages: (imageId: string, newOrder: number) => void;
  
  // Category Methods
  addCategory: (category: Omit<Category, 'id' | 'order' | 'albums'>) => void;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'albums'>>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categoryId: string, newOrder: number) => void;
  
  // Album Methods
  addAlbum: (album: Omit<Album, 'id' | 'order' | 'images'>) => void;
  updateAlbum: (id: string, updates: Partial<Omit<Album, 'images'>>) => void;
  deleteAlbum: (id: string) => void;
  reorderAlbums: (albumId: string, categoryId: string, newOrder: number) => void;
  
  // Image Methods
  addImage: (image: Omit<Image, 'id' | 'order'>) => void;
  updateImage: (id: string, updates: Partial<Image>) => void;
  deleteImage: (id: string) => void;
  reorderImages: (imageId: string, albumId: string, newOrder: number) => void;
  
  // Helper Methods
  getAlbumsByCategory: (categoryId: string) => Album[];
  getImagesByAlbum: (albumId: string) => Image[];
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState({
    categories: false,
    albums: false,
    images: false,
    heroImages: false,
  });
  const { toast } = useToast();

  // Fetch categories from the API
  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      const response = await categoryAPI.getAll();
      
      // Transform backend data to match frontend structure
      const transformedCategories = response.data.map(category => ({
        id: category._id,
        name: category.name,
        slug: category.name.toLowerCase().replace(/\s+/g, '-'),
        description: category.description || '',
        thumbnailUrl: category.thumbnailUrl || '',
        order: category.order,
        albums: [],
      }));
      
      setCategories(transformedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  // Fetch albums from the API
  const fetchAlbums = async (categoryId?: string) => {
    try {
      setLoading(prev => ({ ...prev, albums: true }));
      const response = await albumAPI.getAll(categoryId);
      
      // Transform backend data to match frontend structure
      const transformedAlbums = response.data.map(album => ({
        id: album._id,
        name: album.name,
        slug: album.name.toLowerCase().replace(/\s+/g, '-'),
        description: album.description || '',
        thumbnailUrl: album.coverImage || '',
        categoryId: album.categoryId,
        order: album.order,
        images: [],
      }));
      
      setAlbums(transformedAlbums);
    } catch (error) {
      console.error('Error fetching albums:', error);
      toast({
        title: "Error",
        description: "Failed to load albums",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, albums: false }));
    }
  };

  // Initial data load from API
  useEffect(() => {
    fetchCategories();
    fetchAlbums();
    
    // Temporarily use mock data for other entities until they're connected
    const data = getInitialData();
    setHeroImages(data.heroImages);
    setImages(data.images);
  }, []);

  // Helper function to generate a unique ID
  const generateId = () => Math.random().toString(36).substring(2, 11);

  // Hero Section Methods
  const addHeroImage = (image: Omit<HeroImage, 'id' | 'order'>) => {
    const newImage: HeroImage = {
      ...image,
      id: generateId(),
      order: heroImages.length + 1,
    };
    setHeroImages([...heroImages, newImage]);
    toast({
      title: "Success",
      description: "Hero image added successfully!",
    });
  };

  const updateHeroImage = (id: string, updates: Partial<HeroImage>) => {
    setHeroImages(heroImages.map(img => 
      img.id === id ? { ...img, ...updates } : img
    ));
    toast({
      title: "Success",
      description: "Hero image updated successfully!",
    });
  };

  const deleteHeroImage = (id: string) => {
    const filteredImages = heroImages.filter(img => img.id !== id);
    // Reorder remaining images
    const reorderedImages = filteredImages.map((img, index) => ({
      ...img,
      order: index + 1,
    }));
    setHeroImages(reorderedImages);
    toast({
      title: "Success",
      description: "Hero image deleted successfully!",
    });
  };

  const reorderHeroImages = (imageId: string, newOrder: number) => {
    const imageToMove = heroImages.find(img => img.id === imageId);
    if (!imageToMove) return;

    const oldOrder = imageToMove.order;
    
    // Adjust orders of all affected images
    const reorderedImages = heroImages.map(img => {
      if (img.id === imageId) {
        return { ...img, order: newOrder };
      } else if (oldOrder < newOrder && img.order > oldOrder && img.order <= newOrder) {
        return { ...img, order: img.order - 1 };
      } else if (oldOrder > newOrder && img.order < oldOrder && img.order >= newOrder) {
        return { ...img, order: img.order + 1 };
      }
      return img;
    });
    
    setHeroImages(reorderedImages);
    toast({
      title: "Success",
      description: "Hero images reordered successfully!",
    });
  };

  // Category Methods - Updated to use API
  const addCategory = async (category: Omit<Category, 'id' | 'order' | 'albums'>) => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      
      // Determine next order value
      const nextOrder = categories.length > 0 
        ? Math.max(...categories.map(cat => cat.order)) + 1 
        : 1;
      
      // API call to create
      const response = await categoryAPI.create({
        name: category.name,
        order: nextOrder,
        // Add other fields as needed by your backend
      });
      
      // Transform and add to local state
      const newCategory: Category = {
        id: response.data._id,
        name: response.data.name,
        slug: category.slug || createSlug(category.name),
        description: category.description || '',
        thumbnailUrl: category.thumbnailUrl || '',
        order: response.data.order,
        albums: [],
      };
      
      setCategories([...categories, newCategory]);
      
      toast({
        title: "Success",
        description: "Category added successfully!",
      });
      
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const updateCategory = async (id: string, updates: Partial<Omit<Category, 'albums'>>) => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      
      // API call to update
      await categoryAPI.update(id, {
        name: updates.name,
        // Add other fields as needed
      });
      
      // Update local state
      setCategories(
        categories.map(cat => {
          if (cat.id === id) {
            return { ...cat, ...updates };
          }
          return cat;
        })
      );
      
      toast({
        title: "Success",
        description: "Category updated successfully!",
      });
      
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      
      // API call to delete
      await categoryAPI.delete(id);
      
      // First, delete all albums in this category (on frontend only)
      const albumsInCategory = albums.filter(album => album.categoryId === id);
      albumsInCategory.forEach(album => {
        // Remove images for this album
        setImages(prevImages => prevImages.filter(img => img.albumId !== album.id));
      });
      
      // Remove albums for this category
      setAlbums(prevAlbums => prevAlbums.filter(album => album.categoryId !== id));
      
      // Then delete the category from local state
      const filteredCategories = categories.filter(cat => cat.id !== id);
      
      // Reorder remaining categories (frontend only)
      const reorderedCategories = filteredCategories.map((cat, index) => ({
        ...cat,
        order: index + 1,
      }));
      
      setCategories(reorderedCategories);
      
      toast({
        title: "Success",
        description: "Category and all its content deleted successfully!",
      });
      
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const reorderCategories = async (categoryId: string, newOrder: number) => {
    try {
      const categoryToMove = categories.find(cat => cat.id === categoryId);
      if (!categoryToMove) return;

      const oldOrder = categoryToMove.order;
      
      // Optimistically update the UI first
      const reorderedCategories = categories.map(cat => {
        if (cat.id === categoryId) {
          return { ...cat, order: newOrder };
        } else if (oldOrder < newOrder && cat.order > oldOrder && cat.order <= newOrder) {
          return { ...cat, order: cat.order - 1 };
        } else if (oldOrder > newOrder && cat.order < oldOrder && cat.order >= newOrder) {
          return { ...cat, order: cat.order + 1 };
        }
        return cat;
      });
      
      setCategories(reorderedCategories);
      
      // Then update via API
      await categoryAPI.update(categoryId, { order: newOrder });
      
      // Update orders for affected categories
      const affectedCategories = categories.filter(cat => {
        if (oldOrder < newOrder) {
          return cat.order > oldOrder && cat.order <= newOrder && cat.id !== categoryId;
        } else {
          return cat.order < oldOrder && cat.order >= newOrder && cat.id !== categoryId;
        }
      });
      
      // Update each affected category
      for (const cat of affectedCategories) {
        const newCatOrder = oldOrder < newOrder ? cat.order - 1 : cat.order + 1;
        await categoryAPI.update(cat.id, { order: newCatOrder });
      }
      
      toast({
        title: "Success",
        description: "Categories reordered successfully!",
      });
      
    } catch (error) {
      console.error('Error reordering categories:', error);
      toast({
        title: "Error",
        description: "Failed to reorder categories",
        variant: "destructive",
      });
      
      // Revert to original order by re-fetching
      fetchCategories();
    }
  };

  // Generate a URL-friendly slug from a string
  const createSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
  };

  // Album Methods - Updated to use API
  const addAlbum = async (album: Omit<Album, 'id' | 'order' | 'images'>) => {
    try {
      setLoading(prev => ({ ...prev, albums: true }));
      
      // Determine next order value for this category
      const categoryAlbums = albums.filter(a => a.categoryId === album.categoryId);
      const nextOrder = categoryAlbums.length > 0 
        ? Math.max(...categoryAlbums.map(a => a.order)) + 1 
        : 1;
      
      // API call to create
      const response = await albumAPI.create({
        name: album.name,
        categoryId: album.categoryId,
        coverImage: album.thumbnailUrl,
        description: album.description, // Include description field
        order: nextOrder,
      });
      
      // Transform and add to local state
      const newAlbum: Album = {
        id: response.data._id,
        name: response.data.name,
        slug: album.slug || createSlug(album.name),
        description: album.description || '',
        thumbnailUrl: response.data.coverImage || '',
        categoryId: response.data.categoryId,
        order: response.data.order,
        images: [],
      };
      
      setAlbums(prev => [...prev, newAlbum]);
      
      // Update categories with new album reference
      setCategories(prev => 
        prev.map(cat => 
          cat.id === album.categoryId
            ? { ...cat, albums: [...cat.albums, newAlbum] }
            : cat
        )
      );
      
      toast({
        title: "Success",
        description: "Album added successfully!",
      });
      
    } catch (error: any) {
      console.error('Error adding album:', error);
      
      // Handle specific error messages
      const errorMessage = 
        error.response?.data?.message || error.response?.data?.error || 
        error.message || "Failed to add album";
      
      if (errorMessage.includes("Access Denied") || error.response?.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to add albums. Please login with an admin account.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(prev => ({ ...prev, albums: false }));
    }
  };

  const updateAlbum = async (id: string, updates: Partial<Omit<Album, 'images'>>) => {
    try {
      setLoading(prev => ({ ...prev, albums: true }));
      
      // Get the current album to compare changes
      const currentAlbum = albums.find(a => a.id === id);
      if (!currentAlbum) {
        throw new Error("Album not found");
      }
      
      // Prepare update data for the API
      const updateData = {
        name: updates.name,
        categoryId: updates.categoryId,
        coverImage: updates.thumbnailUrl,
        description: updates.description, // Include description field
        order: updates.order,
      };
      
      // API call to update
      await albumAPI.update(id, updateData);
      
      // Handle category change - need to update the order for both categories
      let updatedAlbums = [...albums];
      
      if (updates.categoryId && updates.categoryId !== currentAlbum.categoryId) {
        // If album moved to a different category:
        // 1. Determine new order in the target category
        const targetCategoryAlbums = albums.filter(a => a.categoryId === updates.categoryId);
        const newOrder = targetCategoryAlbums.length + 1;
        
        // 2. Update album's order in the new category
        await albumAPI.update(id, { order: newOrder });
        
        // 3. Reorder albums in the old category
        const oldCategoryAlbums = albums
          .filter(a => a.categoryId === currentAlbum.categoryId && a.id !== id)
          .sort((a, b) => a.order - b.order);
          
        for (let i = 0; i < oldCategoryAlbums.length; i++) {
          if (oldCategoryAlbums[i].order > currentAlbum.order) {
            await albumAPI.update(oldCategoryAlbums[i].id, { order: oldCategoryAlbums[i].order - 1 });
            updatedAlbums = updatedAlbums.map(a => 
              a.id === oldCategoryAlbums[i].id ? { ...a, order: a.order - 1 } : a
            );
          }
        }
      }
      
      // Update local state
      updatedAlbums = updatedAlbums.map(album => {
        if (album.id === id) {
          return { 
            ...album, 
            ...updates,
            order: updates.categoryId !== currentAlbum.categoryId ? 
              // If category changed, use the last position in new category
              albums.filter(a => a.categoryId === updates.categoryId).length + 1 : 
              album.order
          };
        }
        return album;
      });
      
      setAlbums(updatedAlbums);
      
      // Update categories with the updated album
      const updatedCategories = [...categories];
      
      // If category changed, remove album from old category and add to new one
      if (updates.categoryId && updates.categoryId !== currentAlbum.categoryId) {
        // Remove from old category
        const oldCategoryIndex = updatedCategories.findIndex(c => c.id === currentAlbum.categoryId);
        if (oldCategoryIndex !== -1) {
          updatedCategories[oldCategoryIndex] = {
            ...updatedCategories[oldCategoryIndex],
            albums: updatedCategories[oldCategoryIndex].albums.filter(a => a.id !== id)
          };
        }
        
        // Add to new category
        const newCategoryIndex = updatedCategories.findIndex(c => c.id === updates.categoryId);
        if (newCategoryIndex !== -1) {
          const updatedAlbum = {
            ...currentAlbum,
            ...updates,
            order: updatedAlbums.filter(a => a.categoryId === updates.categoryId).length
          };
          
          updatedCategories[newCategoryIndex] = {
            ...updatedCategories[newCategoryIndex],
            albums: [...updatedCategories[newCategoryIndex].albums, updatedAlbum]
          };
        }
      } else {
        // Just update the album in its current category
        updatedCategories.forEach((category, index) => {
          const albumIndex = category.albums.findIndex(a => a.id === id);
          if (albumIndex !== -1) {
            const updatedCategoryAlbums = [...category.albums];
            updatedCategoryAlbums[albumIndex] = {
              ...updatedCategoryAlbums[albumIndex],
              ...updates
            };
            updatedCategories[index] = {
              ...category,
              albums: updatedCategoryAlbums
            };
          }
        });
      }
      
      setCategories(updatedCategories);
      
      toast({
        title: "Success",
        description: "Album updated successfully!",
      });
      
    } catch (error: any) {
      console.error('Error updating album:', error);
      
      const errorMessage = 
        error.response?.data?.message || error.response?.data?.error || 
        error.message || "Failed to update album";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, albums: false }));
    }
  };

  const deleteAlbum = async (id: string) => {
    try {
      setLoading(prev => ({ ...prev, albums: true }));
      
      const albumToDelete = albums.find(album => album.id === id);
      if (!albumToDelete) return;
      
      // API call to delete
      await albumAPI.delete(id);
      
      // Delete all images in this album (this should be handled by backend cascade delete)
      // But we'll update our local state too
      setImages(prevImages => prevImages.filter(img => img.albumId !== id));
      
      const categoryId = albumToDelete.categoryId;
      
      // Remove album from local state
      const filteredAlbums = albums.filter(album => album.id !== id);
      
      // Reorder remaining albums in the same category (frontend only)
      const categoryAlbums = filteredAlbums
        .filter(album => album.categoryId === categoryId)
        .sort((a, b) => a.order - b.order);
        
      // Update order for remaining albums
      const reorderedAlbums = filteredAlbums.map(album => {
        if (album.categoryId === categoryId) {
          const newOrder = categoryAlbums.findIndex(a => a.id === album.id) + 1;
          return { ...album, order: newOrder };
        }
        return album;
      });
      
      setAlbums(reorderedAlbums);
      
      // Update the categories
      const updatedCategories = categories.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            albums: cat.albums.filter(album => album.id !== id)
                              .map((album, index) => ({ ...album, order: index + 1 })),
          };
        }
        return cat;
      });
      
      setCategories(updatedCategories);
      
      toast({
        title: "Success",
        description: "Album and all its images deleted successfully!",
      });
      
    } catch (error: any) {
      console.error('Error deleting album:', error);
      
      const errorMessage = 
        error.response?.data?.message || error.response?.data?.error || 
        error.message || "Failed to delete album";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, albums: false }));
    }
  };

  const reorderAlbums = async (albumId: string, categoryId: string, newOrder: number) => {
    try {
      const albumToMove = albums.find(album => album.id === albumId);
      if (!albumToMove) return;

      const oldOrder = albumToMove.order;
      
      // Optimistically update the UI first
      const reorderedAlbums = albums.map(album => {
        if (album.categoryId !== categoryId) return album;
        
        if (album.id === albumId) {
          return { ...album, order: newOrder };
        } else if (oldOrder < newOrder && album.order > oldOrder && album.order <= newOrder) {
          return { ...album, order: album.order - 1 };
        } else if (oldOrder > newOrder && album.order < oldOrder && album.order >= newOrder) {
          return { ...album, order: album.order + 1 };
        }
        return album;
      });
      
      setAlbums(reorderedAlbums);
      
      // Then update via API
      await albumAPI.reorder(albumId, categoryId, newOrder);
      
      // Update the categories with reordered albums
      const updatedCategories = categories.map(cat => {
        if (cat.id === categoryId) {
          // Get the updated albums for this category
          const categoryAlbums = reorderedAlbums
            .filter(album => album.categoryId === categoryId)
            .sort((a, b) => a.order - b.order);
            
          return {
            ...cat,
            albums: categoryAlbums,
          };
        }
        return cat;
      });
      
      setCategories(updatedCategories);
      
      toast({
        title: "Success",
        description: "Albums reordered successfully!",
      });
      
    } catch (error: any) {
      console.error('Error reordering albums:', error);
      
      const errorMessage = 
        error.response?.data?.message || error.response?.data?.error || 
        error.message || "Failed to reorder albums";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Revert to original order by re-fetching
      fetchAlbums();
    }
  };

  // Image Methods
  const addImage = (image: Omit<Image, 'id' | 'order'>) => {
    const albumImages = images.filter(img => img.albumId === image.albumId);
    const newImage: Image = {
      ...image,
      id: generateId(),
      order: albumImages.length + 1,
    };
    
    const updatedImages = [...images, newImage];
    setImages(updatedImages);
    
    // Update albums with new image
    const updatedAlbums = albums.map(album => {
      if (album.id === image.albumId) {
        return {
          ...album,
          images: [...album.images, newImage],
        };
      }
      return album;
    });
    setAlbums(updatedAlbums);
    
    // Update categories with updated albums
    const updatedCategories = categories.map(cat => {
      const albumIndex = cat.albums.findIndex(album => album.id === image.albumId);
      if (albumIndex !== -1) {
        const updatedCategoryAlbums = [...cat.albums];
        updatedCategoryAlbums[albumIndex] = {
          ...updatedCategoryAlbums[albumIndex],
          images: [...updatedCategoryAlbums[albumIndex].images, newImage],
        };
        return {
          ...cat,
          albums: updatedCategoryAlbums,
        };
      }
      return cat;
    });
    
    setCategories(updatedCategories);
    
    toast({
      title: "Success",
      description: "Image added successfully!",
    });
  };

  const updateImage = (id: string, updates: Partial<Image>) => {
    const imageToUpdate = images.find(img => img.id === id);
    if (!imageToUpdate) return;
    
    const albumId = imageToUpdate.albumId;
    
    const updatedImages = images.map(img => {
      if (img.id === id) {
        return { ...img, ...updates };
      }
      return img;
    });
    
    setImages(updatedImages);
    
    // Update albums with updated image
    const updatedAlbums = albums.map(album => {
      if (album.id === albumId) {
        return {
          ...album,
          images: album.images.map(img => 
            img.id === id ? { ...img, ...updates } : img
          ),
        };
      }
      return album;
    });
    
    setAlbums(updatedAlbums);
    
    // Update categories with updated albums
    const updatedCategories = categories.map(cat => {
      const albumIndex = cat.albums.findIndex(album => album.id === albumId);
      if (albumIndex !== -1) {
        const updatedCategoryAlbums = [...cat.albums];
        updatedCategoryAlbums[albumIndex] = {
          ...updatedCategoryAlbums[albumIndex],
          images: updatedCategoryAlbums[albumIndex].images.map(img => 
            img.id === id ? { ...img, ...updates } : img
          ),
        };
        return {
          ...cat,
          albums: updatedCategoryAlbums,
        };
      }
      return cat;
    });
    
    setCategories(updatedCategories);
    
    toast({
      title: "Success",
      description: "Image updated successfully!",
    });
  };

  const deleteImage = (id: string) => {
    const imageToDelete = images.find(img => img.id === id);
    if (!imageToDelete) return;
    
    const albumId = imageToDelete.albumId;
    
    // Delete the image
    const filteredImages = images.filter(img => img.id !== id);
    
    // Reorder remaining images in the same album
    const albumImages = filteredImages.filter(img => img.albumId === albumId);
    const reorderedImages = filteredImages.map(img => {
      if (img.albumId === albumId) {
        const newOrder = albumImages.findIndex(i => i.id === img.id) + 1;
        return { ...img, order: newOrder };
      }
      return img;
    });
    
    setImages(reorderedImages);
    
    // Update albums with deleted image
    const updatedAlbums = albums.map(album => {
      if (album.id === albumId) {
        return {
          ...album,
          images: album.images.filter(img => img.id !== id)
                              .map((img, index) => ({ ...img, order: index + 1 })),
        };
      }
      return album;
    });
    
    setAlbums(updatedAlbums);
    
    // Update categories with updated albums
    const updatedCategories = categories.map(cat => {
      const albumIndex = cat.albums.findIndex(album => album.id === albumId);
      if (albumIndex !== -1) {
        const updatedCategoryAlbums = [...cat.albums];
        updatedCategoryAlbums[albumIndex] = {
          ...updatedCategoryAlbums[albumIndex],
          images: updatedCategoryAlbums[albumIndex].images.filter(img => img.id !== id)
                                                 .map((img, index) => ({ ...img, order: index + 1 })),
        };
        return {
          ...cat,
          albums: updatedCategoryAlbums,
        };
      }
      return cat;
    });
    
    setCategories(updatedCategories);
    
    toast({
      title: "Success",
      description: "Image deleted successfully!",
    });
  };

  const reorderImages = (imageId: string, albumId: string, newOrder: number) => {
    const imageToMove = images.find(img => img.id === imageId);
    if (!imageToMove) return;

    const oldOrder = imageToMove.order;
    
    // Adjust orders of all affected images in the same album
    const reorderedImages = images.map(img => {
      if (img.albumId !== albumId) return img;
      
      if (img.id === imageId) {
        return { ...img, order: newOrder };
      } else if (oldOrder < newOrder && img.order > oldOrder && img.order <= newOrder) {
        return { ...img, order: img.order - 1 };
      } else if (oldOrder > newOrder && img.order < oldOrder && img.order >= newOrder) {
        return { ...img, order: img.order + 1 };
      }
      return img;
    });
    
    setImages(reorderedImages);
    
    // Update albums with reordered images
    const updatedAlbums = albums.map(album => {
      if (album.id === albumId) {
        const albumImages = reorderedImages.filter(img => img.albumId === albumId);
        return {
          ...album,
          images: albumImages,
        };
      }
      return album;
    });
    
    setAlbums(updatedAlbums);
    
    // Update categories with updated albums
    const updatedCategories = categories.map(cat => {
      const albumIndex = cat.albums.findIndex(album => album.id === albumId);
      if (albumIndex !== -1) {
        const updatedCategoryAlbums = [...cat.albums];
        updatedCategoryAlbums[albumIndex] = {
          ...updatedCategoryAlbums[albumIndex],
          images: reorderedImages.filter(img => img.albumId === albumId),
        };
        return {
          ...cat,
          albums: updatedCategoryAlbums,
        };
      }
      return cat;
    });
    
    setCategories(updatedCategories);
    
    toast({
      title: "Success",
      description: "Images reordered successfully!",
    });
  };

  // Helper Methods
  const getAlbumsByCategory = (categoryId: string) => {
    return albums.filter(album => album.categoryId === categoryId)
                 .sort((a, b) => a.order - b.order);
  };

  const getImagesByAlbum = (albumId: string) => {
    return images.filter(image => image.albumId === albumId)
                 .sort((a, b) => a.order - b.order);
  };

  return (
    <AdminContext.Provider value={{
      heroImages,
      categories,
      albums,
      images,
      loading,
      
      // Hero Section Methods
      addHeroImage,
      updateHeroImage,
      deleteHeroImage,
      reorderHeroImages,
      
      // Category Methods
      addCategory,
      updateCategory,
      deleteCategory,
      reorderCategories,
      
      // Album Methods
      addAlbum,
      updateAlbum,
      deleteAlbum,
      reorderAlbums,
      
      // Image Methods
      addImage,
      updateImage,
      deleteImage,
      reorderImages,
      
      // Helper Methods
      getAlbumsByCategory,
      getImagesByAlbum,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
