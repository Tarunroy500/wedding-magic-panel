
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';
import FormDialog from '@/components/common/FormDialog';
import ImageUploader from '@/components/common/ImageUploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Plus, 
  ImageIcon, 
  ArrowLeft, 
  Trash2, 
  GripVertical, 
  Info 
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Album, Image } from '@/types';
import useDragAndDrop from '@/hooks/useDragAndDrop';

interface ImageFormData {
  id?: string;
  url: string;
  alt: string;
  albumId: string;
}

const Images = () => {
  const { albums, images, addImage, updateImage, deleteImage, reorderImages } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ImageFormData | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Define a wrapper function to match the hook's expected signature
  const handleReorderImage = (imageId: string, newOrder: number, albumId?: string) => {
    if (albumId) {
      reorderImages(imageId, albumId, newOrder);
    }
  };
  
  const { isDragging, dragItem, handleDragStart } = useDragAndDrop<string>({
    onReorder: handleReorderImage,
    additionalInfo: selectedAlbumId || '',
    selector: '.image-item',
  });
  
  // Parse album ID from URL query parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const albumId = params.get('album');
    if (albumId) {
      setSelectedAlbumId(albumId);
    }
  }, [location.search]);

  // Get the selected album
  const selectedAlbum = albums.find(album => album.id === selectedAlbumId);
  
  // Get parent category of the selected album
  const parentCategory = selectedAlbum 
    ? albums.find(album => album.id === selectedAlbumId)?.categoryId 
    : null;
  
  // Get images for the selected album
  const albumImages = images
    .filter(image => image.albumId === selectedAlbumId)
    .sort((a, b) => a.order - b.order);
  
  // Open form for adding new image
  const handleAddNew = () => {
    if (!selectedAlbumId) return;
    
    setEditingItem({ 
      url: '', 
      alt: '', 
      albumId: selectedAlbumId 
    });
    setFormOpen(true);
  };

  // Open form for editing existing image
  const handleEdit = (id: string) => {
    const image = images.find(img => img.id === id);
    if (!image) return;
    
    setEditingItem({
      id: image.id,
      url: image.url,
      alt: image.alt || '',
      albumId: image.albumId,
    });
    setFormOpen(true);
  };

  // Handle form submission for add/edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;
    
    if (editingItem.id) {
      // Update existing
      updateImage(editingItem.id, {
        url: editingItem.url,
        alt: editingItem.alt,
      });
    } else {
      // Add new
      addImage({
        url: editingItem.url,
        alt: editingItem.alt,
        albumId: editingItem.albumId,
      });
    }
    
    setFormOpen(false);
    setEditingItem(null);
  };

  // Handle navigation back to albums
  const handleBackToAlbums = () => {
    if (parentCategory) {
      navigate(`/admin/albums?category=${parentCategory}`);
    } else {
      navigate('/admin/albums');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBackToAlbums}
              className="h-8 w-8"
            >
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-2xl font-semibold">Image Management</h1>
          </div>
          {selectedAlbum && (
            <p className="text-muted-foreground mt-1">
              Album: <span className="font-medium text-foreground">{selectedAlbum.name}</span>
            </p>
          )}
        </div>
        
        <Button 
          onClick={handleAddNew} 
          className="flex items-center gap-2"
          disabled={!selectedAlbumId}
        >
          <Plus size={16} />
          Add Images
        </Button>
      </div>
      
      {/* Images Grid */}
      {selectedAlbumId ? (
        albumImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {albumImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="image-item relative group"
                  style={{ zIndex: isDragging && dragItem.current?.id === image.id ? 10 : 1 }}
                >
                  <div className={`
                    relative rounded-lg overflow-hidden border shadow-sm transition-all
                    ${isDragging && dragItem.current?.id === image.id ? 'opacity-50 scale-95' : ''}
                  `}>
                    <div className="aspect-square bg-muted">
                      <img
                        src={image.url}
                        alt={image.alt || ''}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Image hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="rounded-full h-8 w-8 bg-white hover:bg-white/90 text-gray-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(image.id);
                          }}
                        >
                          <ImageIcon size={14} />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="rounded-full h-8 w-8 bg-white hover:bg-destructive hover:text-white text-gray-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImage(image.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Drag handle */}
                    <div 
                      className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                      onPointerDown={(e) => handleDragStart(e, image.id, index)}
                    >
                      <div className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center">
                        <GripVertical size={14} className="text-gray-500" />
                      </div>
                    </div>
                    
                    {/* ALT text tooltip */}
                    {image.alt && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center">
                                <Info size={14} className="text-gray-500" />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>{image.alt}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">No Images in This Album</h3>
            <p className="mt-2 text-sm text-muted-foreground">Get started by uploading new images.</p>
            <Button onClick={handleAddNew} className="mt-4">Add Your First Image</Button>
          </div>
        )
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-medium">No Album Selected</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Please select an album to view or manage its images.
          </p>
          <Button onClick={handleBackToAlbums} className="mt-4">Go to Albums</Button>
        </div>
      )}
      
      {/* Form Dialog */}
      <FormDialog
        title={editingItem?.id ? "Edit Image" : "Add Image"}
        description={editingItem?.id 
          ? "Update image properties" 
          : "Upload a new image to this album"
        }
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <ImageUploader
              value={editingItem?.url}
              onChange={(url) => setEditingItem(prev => prev ? { ...prev, url } : null)}
              label="Select or drop an image here"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="alt">Alt Text</Label>
            <Input
              id="alt"
              value={editingItem?.alt || ''}
              onChange={(e) => setEditingItem(prev => prev ? { ...prev, alt: e.target.value } : null)}
              placeholder="A descriptive text for the image"
            />
            <p className="text-xs text-muted-foreground">
              Describe the image for better accessibility and SEO.
            </p>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default Images;
