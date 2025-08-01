"use client";

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

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

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

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-950">
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <DashboardSidebar />
          <SidebarInset className="flex-1">
            {/* Main Content Card */}
            <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              {/* Header with sidebar trigger and breadcrumbs */}
              <header className="flex h-12 shrink-0 items-center gap-2 px-4 border-b border-gray-200 dark:border-gray-800 rounded-t-xl">
                <div className="flex items-center gap-2 flex-1">
                  <SidebarTrigger className="-ml-1 border-0 shadow-none" />
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
                  <DropdownMenuTrigger className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user?.name} />
                      <AvatarFallback className="text-xs font-semibold">
                        {user?.name
                          ?.split(" ")
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
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </header>

              <main className="flex-1 overflow-y-auto p-6 px-12">
                {children}
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
