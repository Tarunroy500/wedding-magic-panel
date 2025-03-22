
import { useState, useRef } from 'react';

interface DragItem {
  id: string;
  index: number;
}

interface UseDragAndDropProps<T> {
  onReorder: (id: string, newOrder: number, additionalInfo?: T) => void;
  additionalInfo?: T;
  selector: string;
}

const useDragAndDrop = <T>({ onReorder, additionalInfo, selector }: UseDragAndDropProps<T>) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragItem = useRef<DragItem | null>(null);
  
  const handleDragStart = (e: React.PointerEvent, id: string, index: number) => {
    e.preventDefault(); // Prevent default behavior
    dragItem.current = { id, index };
    
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
    const { clientX, clientY } = e;
    
    // Get all draggable items
    const items = Array.from(document.querySelectorAll(selector));
    
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
        onReorder(dragItem.current!.id, index + 1, additionalInfo);
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

  return {
    isDragging,
    dragItem,
    handleDragStart,
  };
};

export default useDragAndDrop;
