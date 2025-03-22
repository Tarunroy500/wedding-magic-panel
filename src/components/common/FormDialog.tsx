
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FormDialogProps {
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  isSubmitting?: boolean;
  submitText?: string;
  cancelText?: string;
}

const FormDialog: React.FC<FormDialogProps> = ({
  title,
  description,
  open,
  onOpenChange,
  onSubmit,
  children,
  isSubmitting = false,
  submitText = 'Save',
  cancelText = 'Cancel',
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader className="flex flex-row items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X size={18} />
            </Button>
          </DialogHeader>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
          
          <DialogFooter className="p-6 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mr-2"
            >
              {cancelText}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormDialog;
