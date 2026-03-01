"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  updateUserRoleAdmin,
  deleteUserAdmin,
} from "@/app/actions/admin.actions";
import {
  adminDeactivateUserAction,
  adminDeleteUserPermanentlyAction,
  adminReactivateUserAction,
} from "@/app/actions/account.actions";

type UserRole = "USER" | "ADMIN";

interface UserActionsProps {
  userId: string;
  currentRole: UserRole;
  isCurrentUser: boolean;
  isDeactivated?: boolean;
}

export default function UserActions({
  userId,
  currentRole,
  isCurrentUser,
  isDeactivated = false,
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

  const handleDeactivateUser = async () => {
    if (isCurrentUser) {
      toast.error("Cannot deactivate your own account");
      return;
    }

    toast.warning("Deactivate this user account?", {
      description:
        "User can reactivate within 90 days. After 90 days, account will be permanently deleted.",
      action: {
        label: "Deactivate",
        onClick: async () => {
          setLoading(true);
          try {
            await adminDeactivateUserAction(userId);
            toast.success("User account deactivated");
            router.refresh();
          } catch (error) {
            console.error("Failed to deactivate user:", error);
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to deactivate user",
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

  const handlePermanentlyDeleteUser = async () => {
    if (isCurrentUser) {
      toast.error("Cannot delete your own account");
      return;
    }

    toast.error("Permanently delete this user?", {
      description:
        "This immediately anonymizes all personal data and CANNOT be undone.",
      action: {
        label: "Permanently Delete",
        onClick: async () => {
          setLoading(true);
          try {
            await adminDeleteUserPermanentlyAction(userId);
            toast.success("User account permanently deleted");
            router.refresh();
          } catch (error) {
            console.error("Failed to permanently delete user:", error);
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to permanently delete user",
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

  const handleReactivateUser = async () => {
    setLoading(true);
    try {
      const result = await adminReactivateUserAction(userId);
      if (result.success) {
        toast.success("User account reactivated");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to reactivate user");
      }
    } catch (error) {
      console.error("Failed to reactivate user:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reactivate user",
      );
    } finally {
      setLoading(false);
    }
  };

  const [showActionsMenu, setShowActionsMenu] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedRole}
        onChange={(e) => handleRoleChange(e.target.value as UserRole)}
        disabled={loading || isCurrentUser || isDeactivated}
        className="px-3 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>

      {!isCurrentUser && (
        <div className="relative">
          <button
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            onBlur={() => setTimeout(() => setShowActionsMenu(false), 200)}
            disabled={loading}
            className="px-3 py-1 text-sm text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Actions ▾
          </button>
          {showActionsMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-10">
              {isDeactivated ? (
                <button
                  onClick={handleReactivateUser}
                  disabled={loading}
                  className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 disabled:opacity-50"
                >
                  Reactivate Account
                </button>
              ) : (
                <>
                  <button
                    onClick={handleDeactivateUser}
                    disabled={loading}
                    className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                  >
                    Deactivate Account
                  </button>
                  <button
                    onClick={handlePermanentlyDeleteUser}
                    disabled={loading}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 border-t border-slate-200"
                  >
                    Permanently Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => router.push(`/admin/users/${userId}`)}
        className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        View
      </button>
    </div>
  );
}
