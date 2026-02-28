import { Suspense } from "react";
import CreateUserForm from "@/components/admin/CreateUserForm";

export const metadata = {
  title: "Create User - Admin",
};

export default function CreateUserPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New User</h1>
        <p className="text-muted-foreground mt-2">
          Create a new user account with a temporary password
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <CreateUserForm />
      </Suspense>
    </div>
  );
}
