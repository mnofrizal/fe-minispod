"use client";

import { useState, useEffect } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  Home,
  Server,
  CreditCard,
  Users,
  BarChart3,
  Package,
  Shield,
  User,
  LogOut,
} from "lucide-react";

// Cookie utility functions
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
};

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const [sidebarOpen, setSidebarOpen] = useState(null); // Start with null to prevent flickering
  const [isLoaded, setIsLoaded] = useState(false);

  // Load sidebar state from cookies on mount
  useEffect(() => {
    const savedState = getCookie("sidebar-state");
    if (savedState !== null) {
      setSidebarOpen(savedState === "true");
    } else {
      setSidebarOpen(true); // Default to true if no saved state
    }
    setIsLoaded(true);
  }, []);

  // Save sidebar state to cookies when it changes
  const handleSidebarOpenChange = (open) => {
    setSidebarOpen(open);
    setCookie("sidebar-state", open.toString());
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Map routes to breadcrumb data
  const getBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: Home,
        isActive: pathname === "/dashboard",
      },
    ];

    // Add additional breadcrumbs based on path
    if (pathSegments.includes("services")) {
      breadcrumbs.push({
        href: "/dashboard/services",
        label: "Services",
        icon: Server,
        isActive: pathname === "/dashboard/services",
      });
    }

    if (pathSegments.includes("billing")) {
      breadcrumbs.push({
        href: "/dashboard/billing",
        label: "Billing",
        icon: CreditCard,
        isActive: pathname === "/dashboard/billing",
      });
    }

    if (pathSegments.includes("settings")) {
      breadcrumbs.push({
        href: "/dashboard/settings",
        label: "Settings",
        icon: CreditCard,
        isActive: pathname === "/dashboard/settings",
      });
    }

    if (pathSegments.includes("my-apps")) {
      breadcrumbs.push({
        href: "/dashboard/my-apps",
        label: "My Apps",
        icon: Package,
        isActive: pathname === "/dashboard/my-apps",
      });

      // Handle dynamic app detail route
      const myAppsIndex = pathSegments.indexOf("my-apps");
      if (myAppsIndex !== -1 && pathSegments[myAppsIndex + 1]) {
        const appId = pathSegments[myAppsIndex + 1];
        breadcrumbs.push({
          href: `/dashboard/my-apps/${appId}`,
          label: `App Details`,
          icon: Server,
          isActive: pathname === `/dashboard/my-apps/${appId}`,
        });
      }
    }

    // Admin routes
    if (pathSegments.includes("admin")) {
      if (pathSegments.includes("users")) {
        breadcrumbs.push({
          href: "/dashboard/admin/users",
          label: "User Management",
          icon: Users,
          isActive: pathname === "/dashboard/admin/users",
        });
      }
      if (pathSegments.includes("analytics")) {
        breadcrumbs.push({
          href: "/dashboard/admin/analytics",
          label: "Analytics",
          icon: BarChart3,
          isActive: pathname === "/dashboard/admin/analytics",
        });
      }
      if (pathSegments.includes("subscriptions")) {
        breadcrumbs.push({
          href: "/dashboard/admin/subscriptions",
          label: "Subscriptions",
          icon: Package,
          isActive: pathname === "/dashboard/admin/subscriptions",
        });
      }
      if (pathSegments.includes("security")) {
        breadcrumbs.push({
          href: "/dashboard/admin/security",
          label: "Security",
          icon: Shield,
          isActive: pathname === "/dashboard/admin/security",
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Don't render until we've loaded the sidebar state
  if (!isLoaded) {
    return (
      <div className="h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-950">
      <SidebarProvider
        open={sidebarOpen}
        onOpenChange={handleSidebarOpenChange}
        defaultOpen={sidebarOpen}
      >
        <div className="flex h-screen w-full">
          <DashboardSidebar />
          <SidebarInset className="flex-1 ">
            {/* Main Content Card */}
            <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              {/* Header with sidebar trigger and breadcrumbs */}
              <header className="flex h-12 shrink-0 items-center gap-2 px-4 border-b border-gray-200 dark:border-gray-800 rounded-t-xl">
                <div className="flex items-center gap-2 flex-1">
                  <SidebarTrigger className="-ml-1 border-0 shadow-none cursor-pointer" />
                  <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <Breadcrumb>
                    <BreadcrumbList>
                      {breadcrumbs.map((breadcrumb, index) => {
                        const isLast = index === breadcrumbs.length - 1;

                        return (
                          <div
                            key={breadcrumb.href}
                            className="flex items-center"
                          >
                            <BreadcrumbItem>
                              {isLast ? (
                                <BreadcrumbPage>
                                  {breadcrumb.label}
                                </BreadcrumbPage>
                              ) : (
                                <BreadcrumbLink
                                  href={breadcrumb.href}
                                  className="hover:text-gray-900 dark:hover:text-gray-100"
                                >
                                  {breadcrumb.label}
                                </BreadcrumbLink>
                              )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                          </div>
                        );
                      })}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                {/* User Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 p-1.5  hover:bg-gray-100 rounded-full dark:hover:bg-gray-800 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user?.name} />
                      <AvatarFallback className="text-xs font-semibold">
                        {user?.name
                          ?.split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className=" cursor-pointer">
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center "
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400  cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </header>

              <main className="flex-1 overflow-y-auto p-4 px-8">
                {children}
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
