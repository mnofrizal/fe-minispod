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
import { Activity, CreditCard, Server, Calendar } from "lucide-react";

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
        return "bg-green-500";
      case "PENDING_DEPLOYMENT":
        return "bg-yellow-500";
      case "SUSPENDED":
        return "bg-red-500";
      case "EXPIRED":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
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
  const pendingSubscriptions = subscriptions.filter(
    (s) => s.status === "PENDING_DEPLOYMENT"
  ).length;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Subscriptions Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Services
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeSubscriptions}
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Subscriptions Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Services
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalSubscriptions}
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Deployments Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Deployment
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingSubscriptions}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <CreditCard className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expiring Soon Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Expiring Soon
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {expiringSubscriptions}
                </p>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Subscriptions Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Server className="h-4 w-4" />
            My Subscriptions
          </h2>
        </div>

        <Card>
          <CardContent className="p-6">
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
                  You haven't subscribed to any services yet. Browse our
                  services to get started.
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
                  <div
                    key={subscription.id}
                    className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
                  >
                    {/* Header with status */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-0">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {subscription.service.displayName}
                          </h3>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ml-3 ${getStatusColor(
                            subscription.status
                          )}`}
                        >
                          {getStatusText(subscription.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {subscription.service.name}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6 space-y-4">
                      {subscription.subdomain && (
                        <div>
                          <div className="bg-gray-50 rounded-lg px-3 py-2 border">
                            <p className="text-sm font-mono text-gray-700 truncate">
                              {subscription.subdomain}.yourdomain.com
                            </p>
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Expires
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(subscription.expiresAt)}
                        </p>
                      </div>

                      {subscription.status === "ACTIVE" &&
                        subscription.subdomain && (
                          <div className="pt-2">
                            <button
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
                              onClick={() =>
                                window.open(
                                  `https://${subscription.subdomain}.yourdomain.com`,
                                  "_blank"
                                )
                              }
                            >
                              Open Service
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
