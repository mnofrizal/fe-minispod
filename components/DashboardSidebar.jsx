"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Server,
  CreditCard,
  Users,
  Settings,
  User,
  BarChart3,
  Package,
  Shield,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const userMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Services",
    url: "/dashboard/services",
    icon: Server,
  },
  {
    title: "Billing",
    url: "/dashboard/billing",
    icon: CreditCard,
  },
];

const adminMenuItems = [
  {
    title: "Admin Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    url: "/dashboard/admin/users",
    icon: Users,
  },
  {
    title: "Service Management",
    url: "/dashboard/admin/services",
    icon: Server,
  },
  {
    title: "Analytics",
    url: "/dashboard/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Subscriptions",
    url: "/dashboard/admin/subscriptions",
    icon: Package,
  },
  {
    title: "Security",
    url: "/dashboard/admin/security",
    icon: Shield,
  },
];

export default function DashboardSidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const user = session?.user;
  const isAdmin = user?.role === "ADMINISTRATOR";

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                MinisPod
              </h2>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="w-full justify-start"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/user-view"}
                      className="w-full justify-start"
                    >
                      <Link href="/dashboard/user-view" className="flex items-center gap-3">
                        <User className="h-4 w-4" />
                        <span>Switch to User View</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-3">
          {/* User Info */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={user?.name} />
              <AvatarFallback className="text-xs font-semibold">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          {/* Sign Out Button */}
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}