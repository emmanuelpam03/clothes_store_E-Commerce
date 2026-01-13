"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function FlashToaster({
  message,
}: {
  message: string | null;
}) {
  useEffect(() => {
    if (!message) return;

    toast.success(message);

    document.cookie = "flash=; Max-Age=0; path=/"
  }, [message]);

  return null;
}
