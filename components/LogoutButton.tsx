"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LogoutButtonProps = {
  className?: string;
  onDone?: () => void;
};

export function LogoutButton({ className, onDone }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const client = createClient();
        await client.auth.signOut();
        onDone?.();
        router.push("/");
        router.refresh();
        setLoading(false);
      }}
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
