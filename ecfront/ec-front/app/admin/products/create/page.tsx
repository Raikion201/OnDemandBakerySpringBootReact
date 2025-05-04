"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { createProduct,updateProduct } from "@/lib/features/products/productSlice";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft } from "lucide-react";
import { ImageUploadDialog } from "@/components/admin/ImageUploadDialog";
import axios from "axios";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  quantity: z.coerce.number().int().min(0, "Quantity must be a positive number"),
  imageUrl: z.string().optional()
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Add a state for the selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      imageUrl: ""
    },
  });

  const imageUrl = watch("imageUrl");

  const handleImageUploaded = (url: string, file?: File) => {
    setValue("imageUrl", url);
    
    if (file) {
      setSelectedFile(file);
      // If we have a file, create a local preview using FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (url) {
      // If we have a URL but no file, it might be a server URL
      setPreviewImage(null); // Clear any existing preview
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    try {
      // If productId exists, update the product instead of creating a new one
      if (productId) {
        await dispatch(updateProduct({
          id: productId,
          productData: {
            name: data.name,
            description: data.description || "",
            price: data.price,
            quantity: data.quantity
          }
        })).unwrap();
        
        // If we have a selected file, upload the image
        if (selectedFile) {
          const formData = new FormData();
          formData.append("file", selectedFile);
          
          try {
            const imageResponse = await axios.post(`/api/products/${productId}/image`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            
            // Get the correct image URL from the response
            const imageUrl = imageResponse.data.imageUrl;
            setValue("imageUrl", imageUrl);
            
            console.log("Image uploaded, URL:", imageUrl);
          } catch (imageError) {
            console.error("Failed to upload image:", imageError);
          }
        }
      } 
      // Create new product if productId doesn't exist
      else {
        const result = await dispatch(createProduct({
          name: data.name,
          description: data.description || "",
          price: data.price,
          quantity: data.quantity
        })).unwrap();
        
        setProductId(result.id);
        
        // If we have a selected file and a product ID, upload the image
        if (selectedFile && result.id) {
          const formData = new FormData();
          formData.append("file", selectedFile);
          
          try {
            const imageResponse = await axios.post(`/api/products/${result.id}/image`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            
            // Get the correct image URL from the response
            const imageUrl = imageResponse.data.imageUrl;
            setValue("imageUrl", imageUrl);
            
            console.log("Image uploaded, URL:", imageUrl);
          } catch (imageError) {
            console.error("Failed to upload image:", imageError);
          }
        }
      } // Added the missing closing brace here
    } catch (error) {
      // Remove toast notification
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.push("/admin/products")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Create New Product</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    disabled={loading}
                  />
                  <div className="min-h-[20px]">
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    disabled={loading}
                    rows={4}
                  />
                  <div className="min-h-[20px]">
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register("price")}
                      disabled={loading}
                    />
                    <div className="min-h-[20px]">
                      {errors.price && (
                        <p className="text-sm text-red-500">{errors.price.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity in Stock</Label>
                    <Input
                      id="quantity"
                      type="number"
                      {...register("quantity")}
                      disabled={loading}
                    />
                    <div className="min-h-[20px]">
                      {errors.quantity && (
                        <p className="text-sm text-red-500">{errors.quantity.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Product Image</Label>
                  <div className="flex items-center gap-4">
                    <ImageUploadDialog 
                      productId={productId} 
                      onImageUploaded={handleImageUploaded}
                      disabled={loading}
                    />
                    {imageUrl && (
                      <div className="text-sm text-muted-foreground">
                        Image {productId ? "uploaded" : "selected"} successfully
                      </div>
                    )}
                  </div>
                  {(imageUrl || previewImage) && (
                    <div className="mt-2 border rounded-md p-2">
                      <img 
                        src={previewImage || 
                          (imageUrl && imageUrl.startsWith('data:') 
                            ? imageUrl 
                            : imageUrl 
                              ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`
                              : '')}
                        alt="Product image" 
                        className="h-40 object-contain mx-auto"
                        onError={(e) => {
                          console.error("Image failed to load");
                          // Use a placeholder image
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                          // Prevent further error events
                          (e.target as HTMLImageElement).onerror = null;
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push("/admin/products")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : productId ? "Update Product" : "Save Product"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminRoute>
  );
}
