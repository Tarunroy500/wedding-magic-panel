
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '@/context/AdminContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FormDialog from '@/components/common/FormDialog';
import ImageUploader from '@/components/common/ImageUploader';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Trash2, GripVertical, Plus, Image as ImageIcon } from 'lucide-react';
import { HeroImage } from '@/types';

interface HeroFormData {
  id?: string;
  url: string;
  alt: string;
  page: string;
}

const HeroSection = () => {
  const { heroImages, addHeroImage, updateHeroImage, deleteHeroImage, reorderHeroImages } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeroFormData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragItem = useRef<{ id: string, index: number } | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);

  // Open form for adding new hero image
  const handleAddNew = () => {
    setEditingItem({ url: '', alt: '', page: 'home' });
    setFormOpen(true);
  };

  // Open form for editing existing hero image
  const handleEdit = (id: string) => {
    const item = heroImages.find(item => item.id === id);
    if (!item) return;
    
    setEditingItem({
      id: item.id,
      url: item.url,
      alt: item.alt,
      page: item.page
    });
    setFormOpen(true);
  };

  // Handle form submission for add/edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;
    
    if (editingItem.id) {
      // Update existing
      updateHeroImage(editingItem.id, {
        url: editingItem.url,
        alt: editingItem.alt,
        page: editingItem.page
      });
    } else {
      // Add new
      addHeroImage({
        url: editingItem.url,
        alt: editingItem.alt,
        page: editingItem.page
      });
    }
    
    setFormOpen(false);
    setEditingItem(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.PointerEvent, id: string, index: number) => {
    dragItem.current = { id, index };
    dragNode.current = e.target as HTMLDivElement;
    
    // Add event listeners
    document.addEventListener('pointermove', handleDragMove);
    document.addEventListener('pointerup', handleDragEnd);
    
    // Wait a bit before showing dragging state to prevent flashes on click
    setTimeout(() => {
      setIsDragging(true);
    }, 50);
  };

  const handleDragMove = (e: PointerEvent) => {
    if (!isDragging || !dragItem.current) return;
    
    // Get mouse position
    const { clientY } = e;
    
    // Get all draggable items
    const items = Array.from(document.querySelectorAll('.hero-item'));
    
    // Find the item we're hovering over
    items.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const itemMiddle = rect.top + rect.height / 2;
      
      if (clientY < itemMiddle && index < dragItem.current!.index) {
        // Dragging upward
        reorderHeroImages(dragItem.current!.id, index + 1);
        dragItem.current!.index = index;
      } else if (clientY > itemMiddle && index > dragItem.current!.index) {
        // Dragging downward
        reorderHeroImages(dragItem.current!.id, index + 1);
        dragItem.current!.index = index;
      }
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    dragItem.current = null;
    dragNode.current = null;
    
    // Remove event listeners
    document.removeEventListener('pointermove', handleDragMove);
    document.removeEventListener('pointerup', handleDragEnd);
  };

  // Group images by page
  const imagesByPage: Record<string, HeroImage[]> = {};
  heroImages.forEach(image => {
    if (!imagesByPage[image.page]) {
      imagesByPage[image.page] = [];
    }
    imagesByPage[image.page].push(image);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Hero Section Management</h1>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus size={16} />
          Add Hero Image
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {Object.keys(imagesByPage).map(page => (
          <Card key={page} className="overflow-hidden">
            <div className="bg-muted py-2 px-4 border-b border-border">
              <h2 className="text-lg font-medium capitalize">{page} Page Hero Images</h2>
            </div>
            <CardContent className="p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {imagesByPage[page]
                    .sort((a, b) => a.order - b.order)
                    .map((image, index) => (
                      <motion.div
                        key={image.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className={`p-4 bg-card rounded-lg border shadow-sm hero-item relative ${
                          isDragging && dragItem.current?.id === image.id ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="cursor-grab active:cursor-grabbing p-2"
                            onPointerDown={(e) => handleDragStart(e, image.id, index)}
                          >
                            <GripVertical size={20} className="text-muted-foreground" />
                          </div>
                          
                          <div className="w-16 h-16 rounded-md overflow-hidden relative border">
                            <img 
                              src={image.url} 
                              alt={image.alt} 
                              className="object-cover w-full h-full"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-medium truncate">{image.alt}</h3>
                            <p className="text-sm text-muted-foreground truncate">{image.url}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(image.id)}
                              className="hover:bg-muted"
                            >
                              <ImageIcon size={18} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteHeroImage(image.id)}
                              className="hover:bg-destructive hover:text-white"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                  ))}
                </AnimatePresence>
                
                {imagesByPage[page].length === 0 && (
                  <div className="py-8 flex flex-col items-center justify-center text-center text-muted-foreground">
                    <ImageIcon size={48} className="mb-2 opacity-30" />
                    <p>No hero images for this page yet.</p>
                    <Button variant="outline" className="mt-4" onClick={handleAddNew}>
                      Add Hero Image
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Form Dialog */}
      <FormDialog
        title={editingItem?.id ? "Edit Hero Image" : "Add Hero Image"}
        description="Upload and configure a hero image for your website"
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
              aspectRatio="wide"
              label="Upload Hero Image"
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="page">Page</Label>
            <Input
              id="page"
              value={editingItem?.page || 'home'}
              onChange={(e) => setEditingItem(prev => prev ? { ...prev, page: e.target.value } : null)}
              placeholder="e.g., home, about, contact"
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default HeroSection;
