"use client";

import { usePathname } from "next/navigation";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // Check if we're on a dashboard route
  const isDashboardRoute = pathname?.startsWith("/dashboard");
  
  if (isDashboardRoute) {
    // Dashboard routes handle their own layout
    return children;
  }
  
  // Non-dashboard routes need the flex layout for navbar
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
}