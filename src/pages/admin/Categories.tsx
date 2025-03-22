
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';
import FormDialog from '@/components/common/FormDialog';
import DraggableCard from '@/components/common/DraggableCard';
import ImageUploader from '@/components/common/ImageUploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FolderOpen } from 'lucide-react';
import { Category } from '@/types';
import { useNavigate } from 'react-router-dom';

interface CategoryFormData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
}

const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoryFormData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragItem = useRef<{ id: string, index: number } | null>(null);
  const navigate = useNavigate();
  
  // Open form for adding new category
  const handleAddNew = () => {
    setEditingItem({ name: '', slug: '', description: '', thumbnailUrl: '' });
    setFormOpen(true);
  };

  // Open form for editing existing category
  const handleEdit = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    if (!category) return;
    
    setEditingItem({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      thumbnailUrl: category.thumbnailUrl || '',
    });
    setFormOpen(true);
  };

  // Handle form submission for add/edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;
    
    if (editingItem.id) {
      // Update existing
      updateCategory(editingItem.id, {
        name: editingItem.name,
        slug: editingItem.slug || createSlug(editingItem.name),
        description: editingItem.description,
        thumbnailUrl: editingItem.thumbnailUrl,
      });
    } else {
      // Add new
      addCategory({
        name: editingItem.name,
        slug: editingItem.slug || createSlug(editingItem.name),
        description: editingItem.description,
        thumbnailUrl: editingItem.thumbnailUrl,
      });
    }
    
    setFormOpen(false);
    setEditingItem(null);
  };

  // Generate a URL-friendly slug from a string
  const createSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
  };

  // Auto-generate slug when name changes
  const handleNameChange = (name: string) => {
    setEditingItem(prev => {
      if (!prev) return null;
      
      // Only auto-generate slug if it's a new category or the slug is empty
      const shouldUpdateSlug = !prev.id || !prev.slug;
      
      return {
        ...prev,
        name,
        slug: shouldUpdateSlug ? createSlug(name) : prev.slug,
      };
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.PointerEvent, id: string, index: number) => {
    dragItem.current = { id, index };
    
    // Add event listeners
    document.addEventListener('pointermove', handleDragMove);
    document.addEventListener('pointerup', handleDragEnd);
    
    // Wait a bit before showing dragging state to prevent flashes on click
    setTimeout(() => {
      setIsDragging(true);
    }, 50);
    
    e.stopPropagation();
  };

  const handleDragMove = (e: PointerEvent) => {
    if (!isDragging || !dragItem.current) return;
    
    // Get mouse position
    const { clientX, clientY } = e;
    
    // Get all draggable items
    const items = Array.from(document.querySelectorAll('.category-item'));
    
    // Find the item we're hovering over
    items.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      
      // Check if the mouse is inside this item
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom &&
        index !== dragItem.current!.index
      ) {
        reorderCategories(dragItem.current!.id, index + 1);
        dragItem.current!.index = index;
      }
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    dragItem.current = null;
    
    // Remove event listeners
    document.removeEventListener('pointermove', handleDragMove);
    document.removeEventListener('pointerup', handleDragEnd);
  };

  // Handle clicking on a category to view its albums
  const handleCategoryClick = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    if (category) {
      navigate(`/admin/albums?category=${category.id}`);
    }
  };

  // Sort categories by order
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Category Management</h1>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus size={16} />
          Add Category
        </Button>
      </div>
      
      {/* Categories Grid */}
      {sortedCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {sortedCategories.map((category, index) => (
              <motion.div
                key={category.id}
                layout
                className="category-item"
                style={{ zIndex: isDragging && dragItem.current?.id === category.id ? 10 : 1 }}
              >
                <DraggableCard
                  id={category.id}
                  title={category.name}
                  thumbnailUrl={category.thumbnailUrl}
                  index={index}
                  onDragStart={handleDragStart}
                  onEdit={handleEdit}
                  onDelete={deleteCategory}
                  onClick={handleCategoryClick}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No Categories Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Get started by creating a new category.</p>
          <Button onClick={handleAddNew} className="mt-4">Add Your First Category</Button>
        </div>
      )}
      
      {/* Form Dialog */}
      <FormDialog
        title={editingItem?.id ? "Edit Category" : "Add Category"}
        description="Create or update a category for organizing your wedding albums"
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={editingItem?.name || ''}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Wedding Ceremony"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              value={editingItem?.slug || ''}
              onChange={(e) => setEditingItem(prev => prev ? { ...prev, slug: e.target.value } : null)}
              placeholder="e.g., wedding-ceremony"
            />
            <p className="text-xs text-muted-foreground">
              This will be used in the URL. Leave blank to auto-generate from name.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editingItem?.description || ''}
              onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
              placeholder="A short description of this category"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail Image</Label>
            <ImageUploader
              value={editingItem?.thumbnailUrl}
              onChange={(url) => setEditingItem(prev => prev ? { ...prev, thumbnailUrl: url } : null)}
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default Categories;
