"use client";

import { useSession, signOut } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";

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

  // If user is admin, show tabs at the top
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Admin Tab Selection at the top */}

          <Tabs defaultValue="admin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="user">As User</TabsTrigger>
              <TabsTrigger value="admin">As Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="">
              <UserDashboard />
            </TabsContent>

            <TabsContent value="admin" className="">
              <AdminDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  } else {
    // Regular user - just show UserDashboard without tabs
    return <UserDashboard />;
  }
}
