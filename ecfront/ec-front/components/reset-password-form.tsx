"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { cn } from "@/lib/utils";
import axios from "@/lib/axiosConfig";
import { useRouter, useSearchParams } from "next/navigation";

const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain uppercase, lowercase, and number"
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [loading, setLoading] = useState(false);
    const [validatingToken, setValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
    });

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setValidatingToken(false);
                return;
            }

            try {
                await axios.post(`/api/auth/validate-reset-token?token=${token}`);
                setTokenValid(true);
            } catch (error) {
                toast.error("This password reset link is invalid or has expired");
            } finally {
                setValidatingToken(false);
            }
        };

        validateToken();
    }, [token]);

    const onSubmit = async (data: ResetPasswordFormValues) => {
        if (!token) return;

        try {
            setLoading(true);
            await axios.post("/api/auth/reset-password", {
                token,
                password: data.password,
            });

            setSuccess(true);
            toast.success("Password has been reset successfully");
        } catch (error) {
            toast.error("Failed to reset password. The link may be expired or invalid.");
        } finally {
            setLoading(false);
        }
    };

    if (validatingToken) {
        return (
            <div className={cn("flex flex-col gap-2", className)} {...props}>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p>Validating reset link...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!token || !tokenValid) {
        return (
            <div className={cn("flex flex-col gap-2", className)} {...props}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Invalid Reset Link</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-center text-muted-foreground">
                            The password reset link is invalid or has expired.
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/forgot-password">Request a new link</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className={cn("flex flex-col gap-2", className)} {...props}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Password Reset Complete</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-center text-muted-foreground">
                            Your password has been successfully reset.
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/login">Sign in with new password</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col gap-2", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
                    <CardDescription>Create a new password for your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password")}
                                    placeholder="New password"
                                    disabled={loading}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    {...register("confirmPassword")}
                                    placeholder="Confirm your password"
                                    disabled={loading}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-500">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting password...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}