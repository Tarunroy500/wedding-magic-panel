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
  Info,
  Loader2,
  Upload
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Album, Image } from '@/types';
import useDragAndDrop from '@/hooks/useDragAndDrop';
import { fetchAlbumImages, uploadImage, updateImage as updateImageApi, deleteImage as deleteImageApi, bulkUploadImages } from '@/api/imageApi';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

interface ImageFormData {
  id?: string;
  url: string;
  alt: string;
  albumId: string;
}

const Images = () => {
  const { albums, images: contextImages, addImage, updateImage, deleteImage, reorderImages } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ImageFormData | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [albumImages, setAlbumImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [bulkUploadAlt, setBulkUploadAlt] = useState('');
  
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

  // Fetch images for the selected album from API
  useEffect(() => {
    if (selectedAlbumId) {
      setIsLoading(true);
      setError(null);
      
      fetchAlbumImages(selectedAlbumId)
        .then((images) => {
          setAlbumImages(images.sort((a, b) => a.order - b.order));
        })
        .catch((err) => {
          console.error('Error fetching album images:', err);
          setError('Failed to load images. Please try again.');
          toast({
            title: 'Error',
            description: 'Could not load album images',
            variant: 'destructive',
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setAlbumImages([]);
    }
  }, [selectedAlbumId, toast]);

  // Get the selected album
  const selectedAlbum = albums.find(album => album.id === selectedAlbumId);
  
  // Get parent category of the selected album
  const parentCategory = selectedAlbum 
    ? albums.find(album => album.id === selectedAlbumId)?.categoryId 
    : null;
  
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
    const image = albumImages.find(img => img.id === id);
    if (!image) return;
    
    setEditingItem({
      id: image.id,
      url: image.url,
      alt: image.alt || '',
      albumId: image.albumId,
    });
    setFormOpen(true);
  };

  // Handle form submission for add/edit with API integration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;
    
    try {
      if (editingItem.id) {
        // Update existing image
        const updatedImage = await updateImageApi(editingItem.id, {
          url: editingItem.url,
          alt: editingItem.alt,
        });
        
        // Update local state
        setAlbumImages(prev => 
          prev.map(img => img.id === editingItem.id 
            ? { ...img, url: updatedImage.url, alt: updatedImage.alt }
            : img
          )
        );
        
        // Also update context
        updateImage(editingItem.id, {
          url: updatedImage.url,
          alt: updatedImage.alt,
        });
        
        toast({
          title: 'Success',
          description: 'Image updated successfully',
        });
      } else {
        // Prepare form data for image upload
        const formData = new FormData();
        
        // If the URL is a base64 string or blob URL from ImageUploader
        if (editingItem.url.startsWith('data:') || editingItem.url.startsWith('blob:')) {
          // Convert to file
          try {
            const response = await fetch(editingItem.url);
            const blob = await response.blob();
            const file = new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' });
            formData.append('image', file);
            console.log('Appended file to FormData:', file);
          } catch (err) {
            console.error('Error converting blob/base64 to file:', err);
            toast({
              title: 'Error',
              description: 'Failed to process the image',
              variant: 'destructive',
            });
            return;
          }
        } else if (editingItem.url) {
          // If it's a regular URL string
          formData.append('url', editingItem.url);
          console.log('Appended URL to FormData:', editingItem.url);
        } else {
          toast({
            title: 'Error',
            description: 'Please select or provide an image',
            variant: 'destructive',
          });
          return;
        }
        
        // Always append these fields
        formData.append('alt', editingItem.alt || '');
        formData.append('albumId', editingItem.albumId);
        
        // Log the FormData contents for debugging
        for (const pair of formData.entries()) {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
        
        // Upload image to API
        const newImage = await uploadImage(formData);
        
        // Update local state
        setAlbumImages(prev => [...prev, newImage]);
        
        // Also update context
        addImage(newImage);
        
        toast({
          title: 'Success',
          description: 'Image added successfully',
        });
      }
      
      setFormOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error submitting image:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the image',
        variant: 'destructive',
      });
    }
  };

  // Handle deleting image with API integration
  const handleDeleteImage = async (id: string) => {
    try {
      await deleteImageApi(id);
      
      // Update local state
      setAlbumImages(prev => prev.filter(img => img.id !== id));
      
      // Also update context
      deleteImage(id);
      
      toast({
        title: 'Success',
        description: 'Image deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the image',
        variant: 'destructive',
      });
    }
  };

  // Handle navigation back to albums
  const handleBackToAlbums = () => {
    if (parentCategory) {
      navigate(`/admin/albums?category=${parentCategory}`);
    } else {
      navigate('/admin/albums');
    }
  };

  // Handle selection of multiple files
  const handleMultipleFiles = (files: File[]) => {
    setSelectedFiles(files);
    setBulkUploadOpen(true);
  };
  
  // Handle bulk upload form submission
  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAlbumId || selectedFiles.length === 0) return;
    
    try {
      setUploadingBulk(true);
      setUploadProgress(0);
      
      // Create form data for bulk upload
      const formData = new FormData();
      formData.append('albumId', selectedAlbumId);
      formData.append('alt', bulkUploadAlt);
      
      // Append each file to the form data
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
      
      // Simulate progress updates (in a real implementation, you might use axios progress)
      const progressUpdater = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 95) {
            clearInterval(progressUpdater);
            return 95;
          }
          return newProgress;
        });
      }, 200);
      
      // Send the bulk upload request
      const uploadedImages = await bulkUploadImages(formData);
      
      // Clear interval and set progress to 100%
      clearInterval(progressUpdater);
      setUploadProgress(100);
      
      // Add the new images to state
      setAlbumImages(prev => [...prev, ...uploadedImages]);
      
      // Add images to context
      uploadedImages.forEach(image => {
        addImage(image);
      });
      
      // Show success message
      toast({
        title: 'Success',
        description: `Successfully uploaded ${uploadedImages.length} images`,
      });
      
      // Reset state after a brief delay to show 100% progress
      setTimeout(() => {
        setBulkUploadOpen(false);
        setSelectedFiles([]);
        setBulkUploadAlt('');
        setUploadingBulk(false);
        setUploadProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Error with bulk upload:', error);
      setUploadingBulk(false);
      setUploadProgress(0);
      
      toast({
        title: 'Error',
        description: 'Failed to upload images',
        variant: 'destructive',
      });
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
        
        <div className="flex gap-2">
          <Button 
            onClick={handleAddNew} 
            className="flex items-center gap-2"
            disabled={!selectedAlbumId || isLoading}
          >
            <Plus size={16} />
            Add Image
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setBulkUploadOpen(true)}
            className="flex items-center gap-2"
            disabled={!selectedAlbumId || isLoading}
          >
            <Upload size={16} />
            Bulk Upload
          </Button>
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading images...</span>
        </div>
      )}
      
      {/* Error State */}
      {error && !isLoading && (
        <div className="rounded-lg border border-destructive p-8 text-center text-destructive">
          <p className="font-medium">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              if (selectedAlbumId) {
                fetchAlbumImages(selectedAlbumId)
                  .then(images => setAlbumImages(images))
                  .catch(err => setError('Failed to reload images.'));
              }
            }}
          >
            Try Again
          </Button>
        </div>
      )}
      
      {/* Images Grid */}
      {!isLoading && !error && selectedAlbumId ? (
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
                            handleDeleteImage(image.id);
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
          
          {/* <div className="space-y-2">
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
          </div> */}
        </div>
      </FormDialog>

      {/* Bulk Upload Dialog */}
      <FormDialog
        title="Bulk Upload Images"
        description="Upload multiple images to this album at once"
        open={bulkUploadOpen}
        onOpenChange={(open) => {
          // Only allow closing if not currently uploading
          if (!uploadingBulk) {
            setBulkUploadOpen(open);
            if (!open) {
              setSelectedFiles([]);
              setBulkUploadAlt('');
            }
          }
        }}
        onSubmit={handleBulkUpload}
      >
        <div className="space-y-4">
          {selectedFiles.length === 0 ? (
            <div className="space-y-2">
              <Label htmlFor="images">Select Images</Label>
              <ImageUploader
                value=""
                onChange={() => {}} // Not used in multiple mode
                label="Select multiple images to upload"
                multiple={true}
                onMultipleFiles={handleMultipleFiles}
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Selected Images</Label>
                <div className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{selectedFiles.length} images selected</span>
                    {!uploadingBulk && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedFiles([])}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="aspect-square relative rounded overflow-hidden border">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Selected ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alt">Alt Text (applies to all images)</Label>
                <Input
                  id="alt"
                  value={bulkUploadAlt}
                  onChange={(e) => setBulkUploadAlt(e.target.value)}
                  placeholder="Optional description for all images"
                  disabled={uploadingBulk}
                />
              </div>
              
              {uploadingBulk && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </>
          )}
        </div>
      </FormDialog>
    </div>
  );
};

export default Images;
