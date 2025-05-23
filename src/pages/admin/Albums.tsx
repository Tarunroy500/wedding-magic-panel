import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';
import FormDialog from '@/components/common/FormDialog';
import DraggableCard from '@/components/common/DraggableCard';
import ImageUploader from '@/components/common/ImageUploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Layers, ArrowLeft, Loader2 } from 'lucide-react';
import { Category, Album } from '@/types';
import { useLocation, useNavigate } from 'react-router-dom';
import useDragAndDrop from '@/hooks/useDragAndDrop';

interface AlbumFormData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  categoryId: string;
}

const Albums = () => {
  const { categories, albums, addAlbum, updateAlbum, deleteAlbum, reorderAlbums, loading } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AlbumFormData | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Define a wrapper function to match the hook's expected signature
  const handleReorderAlbum = (albumId: string, newOrder: number, categoryId?: string) => {
    if (categoryId) {
      reorderAlbums(albumId, categoryId, newOrder);
    }
  };
  
  const { isDragging, dragItem, handleDragStart } = useDragAndDrop<string>({
    onReorder: handleReorderAlbum,
    additionalInfo: selectedCategoryId || '',
    selector: '.album-item',
  });
  
  // Parse category ID from URL query parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryId = params.get('category');
    if (categoryId) {
      setSelectedCategoryId(categoryId === 'all' ? 'all' : categoryId);
    } else if (categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [location.search, categories]);

  // Change selected category
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    navigate(`/admin/albums?category=${categoryId}`);
  };

  // Get the selected category
  const selectedCategory = selectedCategoryId !== 'all' 
    ? categories.find(cat => cat.id === selectedCategoryId)
    : null;
  
  // Get albums for the selected category or all albums
  const categoryAlbums = selectedCategoryId === 'all'
    ? [...albums].sort((a, b) => a.name.localeCompare(b.name))
    : albums
      .filter(album => album.categoryId === selectedCategoryId)
      .sort((a, b) => a.order - b.order);
  
  // Open form for adding new album
  const handleAddNew = () => {
    if (!selectedCategoryId || selectedCategoryId === 'all') {
      // If "All Albums" is selected, open form with no pre-selected category
      setEditingItem({ 
        name: '', 
        slug: '', 
        description: '', 
        thumbnailUrl: '', 
        categoryId: categories.length > 0 ? categories[0].id : ''
      });
    } else {
      setEditingItem({ 
        name: '', 
        slug: '', 
        description: '', 
        thumbnailUrl: '', 
        categoryId: selectedCategoryId
      });
    }
    setFormOpen(true);
  };

  // Open form for editing existing album
  const handleEdit = (id: string) => {
    const album = albums.find(album => album.id === id);
    if (!album) return;
    
    setEditingItem({
      id: album.id,
      name: album.name,
      slug: album.slug,
      description: album.description || '',
      thumbnailUrl: album.thumbnailUrl || '',
      categoryId: album.categoryId,
    });
    setFormOpen(true);
  };

  // Handle form submission for add/edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;
    
    if (editingItem.id) {
      // Update existing
      updateAlbum(editingItem.id, {
        name: editingItem.name,
        slug: editingItem.slug || createSlug(editingItem.name),
        description: editingItem.description,
        thumbnailUrl: editingItem.thumbnailUrl,
        categoryId: editingItem.categoryId,
      });
    } else {
      console.log(editingItem);
      
      // Add new
      addAlbum({
        name: editingItem.name,
        slug: editingItem.slug || createSlug(editingItem.name),
        description: editingItem.description,
        thumbnailUrl: editingItem.thumbnailUrl,
        categoryId: editingItem.categoryId,
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
      
      // Only auto-generate slug if it's a new album or the slug is empty
      const shouldUpdateSlug = !prev.id || !prev.slug;
      
      return {
        ...prev,
        name,
        slug: shouldUpdateSlug ? createSlug(name) : prev.slug,
      };
    });
  };

  // Navigate to the album's images
  const handleAlbumClick = (id: string) => {
    navigate(`/admin/images?album=${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/admin/categories')}
              className="h-8 w-8"
            >
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-2xl font-semibold">Album Management</h1>
          </div>
          {selectedCategory && (
            <p className="text-muted-foreground mt-1">
              Category: <span className="font-medium text-foreground">{selectedCategory.name}</span>
            </p>
          )}
          {selectedCategoryId === 'all' && (
            <p className="text-muted-foreground mt-1">
              Showing: <span className="font-medium text-foreground">All Albums</span>
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select
            value={selectedCategoryId || ''}
            onValueChange={handleCategoryChange}
            disabled={loading.categories}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Albums</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleAddNew} 
            className="flex items-center gap-2"
            disabled={loading.albums}
          >
            {loading.albums ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Add Album
          </Button>
        </div>
      </div>
      
      {/* Loading State */}
      {loading.albums && categoryAlbums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={40} className="animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading albums...</p>
        </div>
      ) : (
        /* Albums Grid */
        categoryAlbums.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {categoryAlbums.map((album, index) => (
                <motion.div
                  key={album.id}
                  layout
                  className="album-item"
                  style={{ zIndex: isDragging && dragItem.current?.id === album.id ? 10 : 1 }}
                >
                  <DraggableCard
                    id={album.id}
                    title={album.name}
                    thumbnailUrl={album.thumbnailUrl}
                    subtitle={selectedCategoryId === 'all' ? 
                      categories.find(c => c.id === album.categoryId)?.name : undefined}
                    index={index}
                    onDragStart={selectedCategoryId !== 'all' ? handleDragStart : undefined}
                    onEdit={handleEdit}
                    onDelete={deleteAlbum}
                    onClick={handleAlbumClick}
                    isLoading={loading.albums}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          selectedCategoryId === 'all' ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <Layers className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No Albums Found</h3>
              <p className="mt-2 text-sm text-muted-foreground">Get started by creating a new album.</p>
              <Button onClick={handleAddNew} className="mt-4" disabled={loading.albums}>
                Add Your First Album
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <Layers className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No Albums in This Category</h3>
              <p className="mt-2 text-sm text-muted-foreground">Get started by creating a new album.</p>
              <Button onClick={handleAddNew} className="mt-4" disabled={loading.albums}>
                Add Your First Album
              </Button>
            </div>
          )
        )
      )}
      
      {/* Form Dialog */}
      <FormDialog
        title={editingItem?.id ? "Edit Album" : "Add Album"}
        description="Create or update an album for your wedding photos"
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        loading={loading.albums}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={editingItem?.categoryId || ''}
              onValueChange={(value) => setEditingItem(prev => prev ? { ...prev, categoryId: value } : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Album Name</Label>
            <Input
              id="name"
              value={editingItem?.name || ''}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Wedding Reception"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              value={editingItem?.slug || ''}
              onChange={(e) => setEditingItem(prev => prev ? { ...prev, slug: e.target.value } : null)}
              placeholder="e.g., wedding-reception"
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
              placeholder="A short description of this album"
              rows={3}
            />
          </div>
{/*           
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail Image</Label>
            <ImageUploader
              value={editingItem?.thumbnailUrl}
              onChange={(url) => setEditingItem(prev => prev ? { ...prev, thumbnailUrl: url } : null)}
            />
          </div> */}
        </div>
      </FormDialog>
    </div>
  );
};

export default Albums;
