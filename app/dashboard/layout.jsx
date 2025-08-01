"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRootLayout({ children }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      redirect("/auth/login");
    }
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return children;
}