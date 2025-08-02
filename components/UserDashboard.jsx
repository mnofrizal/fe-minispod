"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Activity, Server, Calendar, Wallet, Plus } from "lucide-react";
import SubscriptionCard from "@/components/SubscriptionCard";
import Link from "next/link";

export default function UserDashboard() {
  const { data: session } = useSession();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = session?.user;

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
          }/api/v1/subscriptions`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          // Use the specific error message from the API response
          setError(data.message || "Failed to fetch subscriptions");
          return;
        }

        if (data.success) {
          setSubscriptions(data.data.subscriptions || []);
        } else {
          setError(data.message || "Failed to fetch subscriptions");
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while fetching subscriptions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [session]);

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PENDING_DEPLOYMENT":
        return "bg-yellow-100 text-yellow-800";
      case "SUSPENDED":
        return "bg-red-100 text-red-800";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Active";
      case "PENDING_DEPLOYMENT":
        return "Pending Deployment";
      case "SUSPENDED":
        return "Suspended";
      case "EXPIRED":
        return "Expired";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading your subscriptions...</div>
        </div>
      </div>
    );
  }

  // Calculate overview stats
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "ACTIVE"
  ).length;
  const totalSubscriptions = subscriptions.length;
  const accountBalance = 125000; // Dummy balance in IDR
  const expiringSubscriptions = subscriptions.filter((s) => {
    const expiryDate = new Date(s.expiresAt);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow && s.status === "ACTIVE";
  }).length;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
          Welcome back, {user?.name}! Here's your account overview.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Services Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="relative">
            <div className="absolute top-0 right-5">
              <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="pr-10">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Active Services
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-1 pt-4">
                {activeSubscriptions}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Currently running apps
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Services Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className=" relative">
            <div className="absolute top-0 right-5">
              <Server className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="pr-10">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Total Services
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-1 pt-4">
                {totalSubscriptions}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                All subscribed apps
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Balance Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className=" relative">
            <div className="absolute top-0 right-5">
              <Wallet className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="pr-10">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Account Balance
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-1 pt-4">
                {accountBalance
                  .toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })
                  .replace(/,00$/, "")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Available credit
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Expiring Soon Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="relative">
            <div className="absolute top-0 right-5">
              <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="pr-10">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Expiring Soon
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-1 pt-4">
                {expiringSubscriptions}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Within 10 days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Subscriptions Section */}
      <div className="space-y-4 pt-4 ">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Server className="h-4 w-4" />
            My Subscriptions
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1h-4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No subscriptions yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You haven't subscribed to any services yet. Browse our services to
              get started.
            </p>
            <Button
              onClick={() => (window.location.href = "/dashboard/services")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Browse Services
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                showManageButton={false}
              />
            ))}
            {/* Add Service Card */}
            <div>
              <Card className="flex flex-col items-center justify-center h-full min-h-[220px] border-dashed border-2 border-zinc-200 hover:border-zinc-400 transition-colors cursor-pointer group">
                <Link href="/dashboard/services" className="w-full h-full">
                  <CardContent className="flex flex-col items-center justify-center h-full w-full cursor-pointer">
                    <div className="flex items-center justify-center mb-3">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-50 group-hover:bg-zinc-100 transition-colors">
                        <Plus className="text-zinc-400 group-hover:text-zinc-500" />
                      </span>
                    </div>
                    <div className="text-center">
                      <h4 className="text-base font-semibold text-zinc-500 group-hover:text-zinc-700 mb-1">
                        Add New Service
                      </h4>
                      <p className="text-xs text-zinc-500">
                        Browse and deploy a new app or service
                      </p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </div>
        )}
        {/* Add Service Card */}
      </div>
    </div>
  );
}
