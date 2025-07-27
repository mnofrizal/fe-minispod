"use client";

import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserList from "@/components/UserList";
import ServiceList from "@/components/ServiceList";
import WorkerList from "@/components/WorkerList";
import PodList from "@/components/PodList";
import TransactionList from "@/components/TransactionList";
import SubscriptionList from "@/components/SubscriptionList";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.name}! Here's your admin overview.
          </p>
        </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" alt={user?.name} />
                <AvatarFallback className="text-lg font-semibold">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold">{user?.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.isActive ? "Active Admin" : "Inactive Admin"}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Section */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Email Address
                  </h3>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {user?.email}
                  </p>
                </div>

                {/* Role Section */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Role
                  </h3>
                  <Badge variant="secondary" className="text-sm font-medium">
                    {user?.role}
                  </Badge>
                </div>
              </div>

              <Separator className="my-4" />

              {/* User Status */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    user?.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Account Status: {user?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Management Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="services">Service Management</TabsTrigger>
            <TabsTrigger value="subscriptions">
              Subscription Management
            </TabsTrigger>
            <TabsTrigger value="pods">Pod Management</TabsTrigger>
            <TabsTrigger value="workers">Worker Nodes</TabsTrigger>
            <TabsTrigger value="transactions">
              Transaction Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UserList />
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <ServiceList />
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-6">
            <SubscriptionList />
          </TabsContent>

          <TabsContent value="pods" className="mt-6">
            <PodList />
          </TabsContent>

          <TabsContent value="workers" className="mt-6">
            <WorkerList />
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <TransactionList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
