"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProductById, updateProduct, clearProductState } from "@/lib/features/products/productSlice";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft } from "lucide-react";
import { ImageUploadDialog } from "@/components/admin/ImageUploadDialog";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  quantity: z.coerce.number().int().min(0, "Quantity must be a positive number"),
  imageUrl: z.string().optional()
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Unwrap params with React.use() to handle both Promise and direct object cases
  const unwrappedParams = 'then' in params ? React.use(params) : params;
  const productId = parseInt(unwrappedParams.id);
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { product, loading, error } = useAppSelector((state) => state.products);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
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

  useEffect(() => {
    dispatch(fetchProductById(productId));

    return () => {
      dispatch(clearProductState());
    };
  }, [dispatch, productId]);

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || "",
        price: product.price,
        quantity: product.quantity,
        imageUrl: product.imageUrl || ""
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    setSubmitting(true);
    try {
      await dispatch(updateProduct({
        id: productId,
        productData: {
          name: data.name,
          description: data.description,
          price: data.price,
          quantity: data.quantity
        }
      })).unwrap();
      
      toast.success("Product updated successfully");
    } catch (error) {
      toast.error(typeof error === 'string' ? error : "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUploaded = (url: string, file?: File) => {
    setValue("imageUrl", url);
    
    if (file) {
      setImageFile(file);
      // Create a preview from the file
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading && !product) {
    return (
      <AdminRoute>
        <div className="flex justify-center items-center h-screen">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminRoute>
    );
  }

  if (error) {
    return (
      <AdminRoute>
        <div className="p-8">
          <div className="text-center text-red-500">
            <h2 className="text-2xl font-bold">Error Loading Product</h2>
            <p>{error}</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/admin/products")}
            >
              Back to Products
            </Button>
          </div>
        </div>
      </AdminRoute>
    );
  }

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
          <h1 className="text-2xl font-bold">Edit Product</h1>
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                      disabled={submitting}
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
                      disabled={submitting}
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
                      disabled={false}
                    />
                    {imageUrl && (
                      <div className="text-sm text-muted-foreground">
                        Image displayed successfully
                      </div>
                    )}
                  </div>
                  {(imageUrl || previewImage) && (
                    <div className="mt-2 border rounded-md p-2">
                      <img 
                        src={previewImage || 
                          (imageUrl?.startsWith('data:') 
                            ? imageUrl 
                            : `http://localhost:8080${imageUrl?.startsWith('/') ? imageUrl : '/' + imageUrl}`)}
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
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Update Product"}
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
