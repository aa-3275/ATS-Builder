"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function SignOutButton() {
  const router = useRouter();
  const { signOutUser } = useAuth();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="button-secondary"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await signOutUser();
          router.replace("/login");
          router.refresh();
        });
      }}
      type="button"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
