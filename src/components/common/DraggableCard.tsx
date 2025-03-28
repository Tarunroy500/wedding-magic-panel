import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Pencil, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DraggableCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string;
  subtitle?: string;
  index: number;
  onDragStart: (e: React.PointerEvent, id: string, index: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (id: string) => void;
  isLoading?: boolean;
}

const DraggableCard = ({
  id,
  title,
  thumbnailUrl,
  subtitle,
  index,
  onDragStart,
  onEdit,
  onDelete,
  onClick,
  isLoading = false,
}: DraggableCardProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleClick = () => {
    if (onClick && !isLoading) {
      onClick(id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoading) {
      onEdit(id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoading) {
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    onDelete(id);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card
        className={`overflow-hidden cursor-pointer group transition-shadow hover:shadow-md ${
          isLoading ? 'opacity-70 pointer-events-none' : ''
        }`}
        onClick={handleClick}
      >
        {thumbnailUrl && (
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="cursor-grab active:cursor-grabbing p-1 -ml-1 opacity-50 group-hover:opacity-100"
              onPointerDown={(e) => !isLoading && onDragStart(e, id, index)}
            >
              <GripVertical size={20} className="shrink-0" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-medium truncate">{title}</h3>
              {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent rounded-full h-7 w-7"
                  onClick={handleEdit}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-destructive hover:text-destructive-foreground rounded-full h-7 w-7"
                  onClick={handleDeleteClick}
                >
                  <Trash2 size={14} />
                </Button>
                {onClick && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-accent rounded-full h-7 w-7"
                  >
                    <ChevronRight size={16} />
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{title}" and all of its contents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DraggableCard;
