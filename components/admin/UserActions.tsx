"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  updateUserRoleAdmin,
  deleteUserAdmin,
} from "@/app/actions/admin.actions";

type UserRole = "USER" | "ADMIN";

interface UserActionsProps {
  userId: string;
  currentRole: UserRole;
  isCurrentUser: boolean;
}

export default function UserActions({
  userId,
  currentRole,
  isCurrentUser,
}: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === selectedRole || loading) return;

    if (isCurrentUser) {
      toast.error("Cannot change your own role");
      return;
    }

    setLoading(true);
    try {
      await updateUserRoleAdmin(userId, newRole);
      setSelectedRole(newRole);
      toast.success(`User role updated to ${newRole}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user role",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (isCurrentUser) {
      toast.error("Cannot delete your own account");
      return;
    }

    toast.warning("Are you sure you want to delete this user?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete User",
        onClick: async () => {
          setLoading(true);
          try {
            await deleteUserAdmin(userId);
            toast.success("User deleted successfully");
            router.push("/admin/users");
            router.refresh();
          } catch (error) {
            console.error("Failed to delete user:", error);
            toast.error(
              error instanceof Error ? error.message : "Failed to delete user",
            );
          } finally {
            setLoading(false);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedRole}
        onChange={(e) => handleRoleChange(e.target.value as UserRole)}
        disabled={loading || isCurrentUser}
        className="px-3 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>

      {!isCurrentUser && (
        <button
          onClick={handleDeleteUser}
          disabled={loading}
          className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Delete"}
        </button>
      )}

      <button
        onClick={() => router.push(`/admin/users/${userId}`)}
        className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        View Details
      </button>
    </div>
  );
}
