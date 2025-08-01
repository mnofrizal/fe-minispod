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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { AppWindow, ExternalLink, Clock, AlertCircle } from "lucide-react";

export default function MyAppsPage() {
  const { data: session } = useSession();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACTIVE":
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case "PENDING_DEPLOYMENT":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "SUSPENDED":
      case "EXPIRED":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
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
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading your apps...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <AppWindow className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Apps
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and access all your subscribed applications
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Apps Grid */}
        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <AppWindow className="mx-auto h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No apps yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  You haven't subscribed to any applications yet. Browse our
                  services to find the perfect apps for your needs.
                </p>
                <Button
                  onClick={() => (window.location.href = "/dashboard/services")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Browse Services
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((subscription) => (
              <Card
                key={subscription.id}
                className="hover:shadow-lg transition-all duration-200 group"
              >
                <CardHeader className="">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate flex items-center gap-2">
                        <AppWindow className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        {subscription.service.displayName}
                      </CardTitle>
                      <CardDescription className="truncate">
                        {subscription.service.name} -{" "}
                        <Badge
                          variant="secondary"
                          className={`text-white ${getStatusColor(
                            subscription.status
                          )}`}
                        >
                          {getStatusText(subscription.status)}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {getStatusIcon(subscription.status)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Expiry Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex w-full">
                      <span className="text-sm text-gray-500">Expires</span>
                      <span className="text-sm font-medium">
                        {formatDate(subscription.expiresAt)}
                      </span>
                    </div>
                    <Button
                      className="cursor-pointer "
                      variant="outline"
                      onClick={() =>
                        window.open(
                          `https://${subscription.subdomain}.yourdomain.com`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Statistics Card */}
        {subscriptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {subscriptions.length}
                  </div>
                  <div className="text-sm text-gray-500">Total Apps</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {subscriptions.filter((s) => s.status === "ACTIVE").length}
                  </div>
                  <div className="text-sm text-gray-500">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {
                      subscriptions.filter(
                        (s) => s.status === "PENDING_DEPLOYMENT"
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {
                      subscriptions.filter(
                        (s) =>
                          s.status === "SUSPENDED" || s.status === "EXPIRED"
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-500">Issues</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
