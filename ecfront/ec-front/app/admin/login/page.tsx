"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import axios from "@/lib/axiosConfig";

// Form schema
const formSchema = z.object({
  loginID: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"), 
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loginID: "",
      password: "",
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/admin/login', data);
      
      // Store admin user in localStorage or state management
      if (response.data) {
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Removed the Logo Section that was positioned in top left */}
      
      {/* Center the login card */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="loginID">Username</Label>
                  <Input
                    id="loginID"
                    {...register("loginID")}
                    placeholder="Enter your username"
                    disabled={loading}
                  />
                  {errors.loginID && (
                    <p className="text-sm text-destructive">{errors.loginID.message}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-center text-sm text-muted-foreground">
              This area is restricted to authorized personnel only
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
