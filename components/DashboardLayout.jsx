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
import { usePathname } from "next/navigation";
import {
  Home,
  Server,
  CreditCard,
  Users,
  BarChart3,
  Package,
  Shield,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

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
    <div className="min-h-screen">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <DashboardSidebar />
          <SidebarInset className="flex-1">
            <div className="flex flex-col min-h-screen">
              {/* Header with sidebar trigger and breadcrumbs */}
              <header className="flex border-b h-14 shrink-0 items-center gap-2 px-4 bg-white dark:bg-gray-900">
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
              </header>

              <main className="flex-1 bg-white dark:bg-gray-900">
                {children}
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
