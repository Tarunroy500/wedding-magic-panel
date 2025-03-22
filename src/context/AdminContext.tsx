
import React, { createContext, useContext, useState, useEffect } from 'react';
import { HeroImage, Category, Album, Image } from '@/types';
import { getInitialData } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';

interface AdminContextType {
  heroImages: HeroImage[];
  categories: Category[];
  albums: Album[];
  images: Image[];
  
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
  const { toast } = useToast();

  useEffect(() => {
    const data = getInitialData();
    setHeroImages(data.heroImages);
    setCategories(data.categories);
    setAlbums(data.albums);
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

  // Category Methods
  const addCategory = (category: Omit<Category, 'id' | 'order' | 'albums'>) => {
    const newCategory: Category = {
      ...category,
      id: generateId(),
      order: categories.length + 1,
      albums: [],
    };
    setCategories([...categories, newCategory]);
    toast({
      title: "Success",
      description: "Category added successfully!",
    });
  };

  const updateCategory = (id: string, updates: Partial<Omit<Category, 'albums'>>) => {
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
  };

  const deleteCategory = (id: string) => {
    // First, delete all albums in this category
    const albumsInCategory = albums.filter(album => album.categoryId === id);
    albumsInCategory.forEach(album => {
      deleteAlbum(album.id);
    });
    
    // Then delete the category
    const filteredCategories = categories.filter(cat => cat.id !== id);
    // Reorder remaining categories
    const reorderedCategories = filteredCategories.map((cat, index) => ({
      ...cat,
      order: index + 1,
    }));
    setCategories(reorderedCategories);
    toast({
      title: "Success",
      description: "Category and all its content deleted successfully!",
    });
  };

  const reorderCategories = (categoryId: string, newOrder: number) => {
    const categoryToMove = categories.find(cat => cat.id === categoryId);
    if (!categoryToMove) return;

    const oldOrder = categoryToMove.order;
    
    // Adjust orders of all affected categories
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
    toast({
      title: "Success",
      description: "Categories reordered successfully!",
    });
  };

  // Album Methods
  const addAlbum = (album: Omit<Album, 'id' | 'order' | 'images'>) => {
    const categoryAlbums = albums.filter(a => a.categoryId === album.categoryId);
    const newAlbum: Album = {
      ...album,
      id: generateId(),
      order: categoryAlbums.length + 1,
      images: [],
    };
    
    const updatedAlbums = [...albums, newAlbum];
    setAlbums(updatedAlbums);
    
    // Update categories with new albums
    const updatedCategories = categories.map(cat => {
      if (cat.id === album.categoryId) {
        return {
          ...cat,
          albums: [...cat.albums, newAlbum],
        };
      }
      return cat;
    });
    setCategories(updatedCategories);
    
    toast({
      title: "Success",
      description: "Album added successfully!",
    });
  };

  const updateAlbum = (id: string, updates: Partial<Omit<Album, 'images'>>) => {
    const updatedAlbums = albums.map(album => {
      if (album.id === id) {
        return { ...album, ...updates };
      }
      return album;
    });
    
    setAlbums(updatedAlbums);
    
    // Update categories with the updated album
    const updatedCategories = categories.map(cat => {
      const albumIndex = cat.albums.findIndex(album => album.id === id);
      if (albumIndex !== -1) {
        const updatedCategoryAlbums = [...cat.albums];
        updatedCategoryAlbums[albumIndex] = {
          ...updatedCategoryAlbums[albumIndex],
          ...updates,
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
      description: "Album updated successfully!",
    });
  };

  const deleteAlbum = (id: string) => {
    // First, delete all images in this album
    setImages(images.filter(img => img.albumId !== id));
    
    const albumToDelete = albums.find(album => album.id === id);
    if (!albumToDelete) return;
    
    const categoryId = albumToDelete.categoryId;
    
    // Delete the album
    const filteredAlbums = albums.filter(album => album.id !== id);
    
    // Reorder remaining albums in the same category
    const categoryAlbums = filteredAlbums.filter(album => album.categoryId === categoryId);
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
  };

  const reorderAlbums = (albumId: string, categoryId: string, newOrder: number) => {
    const albumToMove = albums.find(album => album.id === albumId);
    if (!albumToMove) return;

    const oldOrder = albumToMove.order;
    
    // Adjust orders of all affected albums in the same category
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
    
    // Update the categories with reordered albums
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        const categoryAlbums = reorderedAlbums.filter(album => album.categoryId === categoryId);
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
