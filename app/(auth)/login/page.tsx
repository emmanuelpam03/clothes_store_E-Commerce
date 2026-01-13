"use client";

import { LoginForm } from "@/components/auth/login-form";
// import { useEffect } from "react";
// import { toast } from "sonner";

export default function Page() {
  // useEffect(() => {
  //   const cookie = document.cookie
  //     .split("; ")
  //     .find((c) => c.startsWith("flash="));

  //   if (cookie) {
  //     const message = decodeURIComponent(cookie.split("=")[1]);
  //     toast.success(message);

  //     // delete flash immediately
  //     document.cookie = "flash=; Max-Age=0; path=/";
  //   }
  // }, []);
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
