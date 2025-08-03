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
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/DashboardLayout";
import {
  AppWindow,
  ExternalLink,
  Clock,
  AlertCircle,
  Search,
  Grid3X3,
  List,
  Calendar,
  Globe,
  Plus,
} from "lucide-react";
import Link from "next/link";
import SubscriptionCard from "@/components/SubscriptionCard";

export default function MyAppsPage() {
  const { data: session } = useSession();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("card"); // "card" or "list"

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
        return "Pending";
      case "SUSPENDED":
        return "Suspended";
      case "EXPIRED":
        return "Expired";
      case "CANCELLED":
        return "Canceled";
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

  // Filter subscriptions based on search query
  const filteredSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.service.displayName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      subscription.service.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (subscription.subdomain &&
        subscription.subdomain
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );

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
        <div className="">
          <div className="flex items-center gap-3 mb-2 justify-between">
            <div className="">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                My Apps
              </h1>
              <p className="text-gray-600 text-sm dark:text-gray-400">
                Manage and access all your subscribed applications
              </p>
            </div>
            <Button asChild className=" text-white" size="lg">
              <Link href="/dashboard/services">
                <span className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create App
                </span>
              </Link>
            </Button>
          </div>
        </div>
        {/* Header */}
        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b pb-5">
          <div className="relative flex-1 ">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full h-11"
            />
          </div>
          <div className="flex items-center ">
            <Button
              variant={viewMode === "card" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("card")}
              className="flex items-center gap-2 rounded-r-none h-10 w-10"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2 rounded-l-none h-10 w-10"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
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
        {/* Apps Display */}
        {filteredSubscriptions.length === 0 && subscriptions.length > 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No apps found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search query to find what you're looking
                  for.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : subscriptions.length === 0 ? (
          <Card className="bg-zinc-50">
            <CardContent className="pt-6 ">
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
                <Link href="/dashboard/services">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                    Browse Services
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                showManageButton={true}
              />
            ))}
          </div>
        ) : (
          <div className="gap-4 flex flex-col">
            {filteredSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border rounded-lg"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-2 bg-gray-100 border dark:bg-blue-900 rounded-lg">
                    <img
                      src={subscription.service.icon}
                      alt={subscription.service.displayName || service.name}
                      className="w-9 h-9 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className=" font-semibold text-gray-900 dark:text-white truncate">
                        {subscription.service.displayName}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {subscription.service.name} -{" "}
                      {subscription.subdomain && (
                        <span className="text-sm font-mono text-blue-600 dark:text-blue-400 truncate">
                          {subscription.subdomain}.yourdomain.com
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <Badge
                    className={`text-white text-xs px-2 py-1 ${getStatusColor(
                      subscription.status
                    )}`}
                  >
                    {getStatusText(subscription.status)}
                  </Badge>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>Exp {formatDate(subscription.expiresAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {subscription.status === "ACTIVE" &&
                    subscription.subdomain ? (
                      <>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() =>
                            window.open(
                              `https://${subscription.subdomain}.yourdomain.com`,
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/my-apps/${subscription.id}`}>
                            Manage
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        {subscription.status === "PENDING_DEPLOYMENT"
                          ? "Deploying..."
                          : "Unavailable"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
