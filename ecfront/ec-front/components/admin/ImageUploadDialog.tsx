"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import axios from "@/lib/axiosConfig";

interface ImageUploadDialogProps {
  productId?: number | null;
  onImageUploaded: (imageUrl: string, file?: File) => void;  // Update to accept a File parameter
  disabled?: boolean;
}

export function ImageUploadDialog({ productId, onImageUploaded, disabled = false }: ImageUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setIsUploading(true);

    try {
      // If we have a productId, upload to product endpoint
      if (productId) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(`/api/products/${productId}/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log("Image upload response:", response.data);
        
        // Extract the correct image URL from the response
        const imageUrl = response.data.imageUrl;
        
        if (!imageUrl) {
          console.error("Image URL not found in response:", response.data);
          toast.error("Image uploaded but URL not returned correctly");
        } else {
          toast.success("Image uploaded successfully");
          // Check if imageUrl already has the server URL prefix
          const fullImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
          onImageUploaded(fullImageUrl, file);
        }
      } else {
        // If no productId, just provide the preview data URL to parent component
        toast.success("Image selected successfully");
        onImageUploaded(preview || "", file); // preview is already a data URL
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          disabled={disabled}
          title="Select a product image"
        >
          <ImageIcon className="h-4 w-4" />
          {productId ? "Upload Image" : "Select Image"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{productId ? "Upload Product Image" : "Select Product Image"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {preview ? (
            <div className="relative rounded-md overflow-hidden">
              <img src={preview} alt="Image preview" className="w-full h-48 object-contain bg-muted" />
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2 h-6 w-6 rounded-full"
                onClick={clearFile}
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center">
              <Label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-8 w-8" />
                <span>Click to select or drop an image</span>
                <Input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </Label>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? "Uploading..." : productId ? "Upload" : "Select"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
