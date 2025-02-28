'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchUsers } from '@/lib/features/todos/userSlice';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button"; 
import { Loader2Icon } from "lucide-react";
import axios from '@/lib/axiosConfig';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { users, loading, error } = useAppSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleRemoveAccess = async () => {
    try {
      await axios.post('/api/auth/removeAccess');
      toast.success('Access token removed successfully');
    } catch (error) {
      toast.error('Failed to remove access token');
      console.error('Error removing access token:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      toast.success('Logged out successfully');
      router.push('/login'); // Redirect to login page
    } catch (error) {
      toast.error('Failed to logout');
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users List</h1>
        <div className="space-x-4">
          <Button 
            variant="outline" 
            onClick={handleRemoveAccess}
          >
            Remove Access
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.username}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}