"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { fetchUsers } from "@/lib/features/todos/userSlice";
// ...other imports

export default function UsersPage() {
  const dispatch = useAppDispatch();
  // Make sure this selector matches the name in your store configuration
  const { users, loading, error } = useAppSelector(state => state.user);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // ...component code
}
