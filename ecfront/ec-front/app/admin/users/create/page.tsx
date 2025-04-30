"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // Updated import
import axios from "@/lib/axiosConfig";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Must be a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roles: z.array(z.string()).min(1, "At least one role must be selected"),
});

type UserFormValues = z.infer<typeof userSchema>;

interface Role {
  id: number;
  name: string;
}

export default function CreateUserPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      roles: [],
    },
  });

  const selectedRoles = watch("roles");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get("/api/admin/roles");
        setRoles(response.data);
        console.log(response.data)
      } catch (error) {
        toast.error("Failed to fetch roles");
        router.push("/admin/dashboard");
      }
    };

    fetchRoles();
  }, [router]);

  const handleRoleChange = (checked: boolean, role: string) => {
    if (checked) {
      setValue("roles", [...selectedRoles, role]);
    } else {
      setValue(
        "roles",
        selectedRoles.filter((r) => r !== role)
      );
    }
  };

  const onSubmit = async (data: UserFormValues) => {
    setLoading(true);
    try {
      await axios.post("/api/admin/create-user", data);
      toast.success("User created successfully");
      router.push("/admin/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => router.push("/admin/dashboard")}
      >
        ← Back to Dashboard
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...register("username")}
                  disabled={loading}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Roles</Label>
                <div className="flex flex-col gap-2">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedRoles.includes(role.name)}
                        onCheckedChange={(checked) => 
                          handleRoleChange(checked as boolean, role.name)
                        }
                      />
                      <Label htmlFor={`role-${role.id}`} className="cursor-pointer">
                        {role.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.roles && (
                  <p className="text-sm text-red-500">{errors.roles.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
