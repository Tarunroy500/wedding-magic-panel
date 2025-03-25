import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ImagePlus, X, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
  label?: string;
  multiple?: boolean;
  onMultipleFiles?: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  className,
  aspectRatio = 'square',
  label = 'Upload Image',
  multiple = false,
  onMultipleFiles,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Aspect ratio classes
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-[9/16]',
    wide: 'aspect-[16/9]',
  };
  
  // Handle file change for both single and multiple uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsLoading(true);
    
    // Handle multiple file selection
    if (multiple && files.length > 1 && onMultipleFiles) {
      const fileArray = Array.from(files);
      onMultipleFiles(fileArray);
      setIsLoading(false);
      return;
    }
    
    // Handle single file (original behavior)
    const file = files[0];
    
    // Simulate file upload delay (for demo)
    setTimeout(() => {
      // Create a local object URL (would be a server URL in production)
      const localUrl = URL.createObjectURL(file);
      onChange(localUrl);
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg overflow-hidden flex flex-col items-center justify-center text-center p-4 transition-all bg-muted/50",
          aspectRatioClasses[aspectRatio],
          value ? "border-muted bg-transparent" : "border-muted-foreground/20",
          isLoading && "opacity-50"
        )}
      >
        {value ? (
          <div className="absolute inset-0">
            <img
              src={value}
              alt="Uploaded image"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="p-4">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/90 hover:bg-white"
                  onClick={() => onChange('')}
                  disabled={isLoading}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {isLoading ? (
              <div className="flex flex-col items-center space-y-4 p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Uploading image...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 p-8">
                {multiple ? (
                  <Upload className="h-10 w-10 text-muted-foreground" />
                ) : (
                  <ImagePlus className="h-10 w-10 text-muted-foreground" />
                )}
                <p className="text-sm text-muted-foreground">
                  {multiple ? `${label} (select multiple)` : label}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isLoading}
                >
                  {multiple ? 'Select Images' : 'Select Image'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isLoading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        multiple={multiple}
      />
    </div>
  );
};

export default ImageUploader;
