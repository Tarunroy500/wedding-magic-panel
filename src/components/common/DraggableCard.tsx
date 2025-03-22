
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DraggableCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string;
  index: number;
  onDragStart: (e: React.PointerEvent, id: string, index: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (id: string) => void;
  className?: string;
}

const DraggableCard: React.FC<DraggableCardProps> = ({
  id,
  title,
  thumbnailUrl,
  index,
  onDragStart,
  onEdit,
  onDelete,
  onClick,
  className,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn("relative", className)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300 cursor-pointer shadow-card hover:shadow-card-hover",
          className
        )}
        onClick={() => onClick?.(id)}
      >
        <div 
          className="absolute top-2 right-2 z-10 flex gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-primary hover:text-white"
            onClick={() => onEdit(id)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-destructive hover:text-white"
            onClick={() => onDelete(id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
        <div 
          className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => onDragStart(e, id, index)}
        >
          <div className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center">
            <GripVertical size={14} className="text-gray-500" />
          </div>
        </div>
        
        {thumbnailUrl && (
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}
        
        <CardContent className={cn(
          "p-4",
          !thumbnailUrl && "pt-12"
        )}>
          <h3 className="font-medium text-lg truncate">{title}</h3>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DraggableCard;
