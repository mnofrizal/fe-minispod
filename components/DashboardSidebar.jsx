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
  AppWindow,
  ChevronUp,
  Box,
  Cloud,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Separator } from "@radix-ui/react-context-menu";

const userMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Apps",
    url: "/dashboard/my-apps",
    icon: Box,
  },
];

const userExploreItems = [
  {
    title: "Apps List",
    url: "/dashboard/services",
    icon: Cloud,
  },
];

const userAccountItems = [
  {
    title: "Billing",
    url: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Setting",
    url: "/dashboard/settings",
    icon: Settings,
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { state, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="border-none bg-[#F6F6F7]"
    >
      <SidebarHeader className="bg-[#F6F6F7]">
        <div className="flex items-center gap-3">
          {isCollapsed ? (
            <div className="flex items-center gap-2 py-1">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center ">
                <span className="text-white font-bold text-sm">M</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-1">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center ">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  MinisPod
                </h2>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#F6F6F7]">
        <SidebarGroup>
          <SidebarGroupLabel>
            {isAdmin ? "Admin Panel" : "Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="w-full justify-start h-10 data-[active=true]:bg-gray-200 data-[active=true]:text-gray-900 dark:data-[active=true]:bg-gray-700 dark:data-[active=true]:text-gray-100"
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-3"
                      onClick={() => {
                        if (state === "collapsed") {
                          // Don't expand sidebar on navigation in collapsed mode
                          return;
                        }
                        // Close mobile sidebar if open
                        setOpenMobile(false);
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isAdmin && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Explore</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {userExploreItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        tooltip={item.title}
                        className="w-full justify-start h-10 data-[active=true]:bg-gray-200 data-[active=true]:text-gray-900 dark:data-[active=true]:bg-gray-700 dark:data-[active=true]:text-gray-100"
                      >
                        <Link
                          href={item.url}
                          className="flex items-center gap-3"
                          onClick={() => {
                            if (state === "collapsed") {
                              // Don't expand sidebar on navigation in collapsed mode
                              return;
                            }
                            // Close mobile sidebar if open
                            setOpenMobile(false);
                          }}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {userAccountItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        tooltip={item.title}
                        className="w-full justify-start h-10 data-[active=true]:bg-gray-200 data-[active=true]:text-gray-900 dark:data-[active=true]:bg-gray-700 dark:data-[active=true]:text-gray-100"
                      >
                        <Link
                          href={item.url}
                          className="flex items-center gap-3"
                          onClick={() => {
                            if (state === "collapsed") {
                              // Don't expand sidebar on navigation in collapsed mode
                              return;
                            }
                            // Close mobile sidebar if open
                            setOpenMobile(false);
                          }}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>User View</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/user-view"}
                      tooltip="Switch to User View"
                      className="w-full justify-start data-[active=true]:bg-gray-200 data-[active=true]:text-gray-900 dark:data-[active=true]:bg-gray-700 dark:data-[active=true]:text-gray-100"
                    >
                      <Link
                        href="/dashboard/user-view"
                        className="flex items-center gap-3"
                        onClick={() => {
                          if (state === "collapsed") {
                            // Don't expand sidebar on navigation in collapsed mode
                            return;
                          }
                          // Close mobile sidebar if open
                          setOpenMobile(false);
                        }}
                      >
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

      <SidebarFooter className="p-0 rounded-lg bg-[#F6F6F7]">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full justify-between  h-auto px-1 bg-[#F6F6F7]rounded-xl dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700`}
            >
              <div className="flex items-center gap-1">
                <Avatar className="h-10 w-10 border-2">
                  <AvatarImage src="" alt={user?.name} />
                  <AvatarFallback className="text-xs font-semibold">
                    {user?.name
                      ?.split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.name?.split(" ").slice(0, 2).join(" ")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-l">
                      {user?.email}
                    </p>
                  </div>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {user?.name?.split(" ").slice(0, 2).join(" ")}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className=" cursor-pointer">
              <Link href="/dashboard/settings" className="flex items-center ">
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
      </SidebarFooter>
    </Sidebar>
  );
}
