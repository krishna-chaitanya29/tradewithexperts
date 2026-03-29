import { requireUser } from "@/lib/auth";
import { ReactNode } from "react";

export async function AuthGuard({ children }: { children: ReactNode }) {
  await requireUser();
  return <>{children}</>;
}
