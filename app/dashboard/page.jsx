"use client";

import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import DashboardLayout from "@/components/DashboardLayout";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const user = session.user;
  const isAdmin = user.role === "ADMINISTRATOR";

  // If user is admin, show tabs for switching views
  if (isAdmin) {
    return (
      <DashboardLayout>
        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
            <TabsTrigger value="user">As User</TabsTrigger>
            <TabsTrigger value="admin">As Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="user">
            <UserDashboard />
          </TabsContent>

          <TabsContent value="admin">
            <AdminDashboard />
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    );
  } else {
    // Regular user - just show UserDashboard with sidebar
    return (
      <DashboardLayout>
        <UserDashboard />
      </DashboardLayout>
    );
  }
}
