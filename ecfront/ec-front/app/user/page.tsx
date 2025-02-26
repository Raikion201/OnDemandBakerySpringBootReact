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
import { Loader2Icon } from "lucide-react";

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.users);

  console.log(users)
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  console.log(error)
  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Users List</h1>
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