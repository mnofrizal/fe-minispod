"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Calendar,
  Server,
  Activity,
  Database,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Clock,
  AlertCircle,
  CheckCircle,
  Settings,
  BarChart3,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export default function AppDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dummy data for demonstration
  const dummySubscription = {
    id: params.id,
    status: "ACTIVE",
    subdomain: "my-wordpress-site",
    expiresAt: "2024-12-31T23:59:59Z",
    createdAt: "2024-01-15T10:30:00Z",
    service: {
      displayName: "WordPress Pro",
      name: "wordpress",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/wordpress.png",
      category: "CMS",
      description: "Professional WordPress hosting with premium features",
    },
    variant: {
      variantDisplayName: "Business Plan",
      cpuSpec: "2 vCPU",
      memSpec: "4 GB RAM",
      diskSpec: "50 GB SSD",
      monthlyPrice: 25000,
    },
    metrics: {
      uptime: "99.9%",
      avgResponseTime: "145ms",
      bandwidth: "2.4 GB",
      visitors: "1,234",
      pageViews: "5,678",
    },
    logs: [
      {
        id: 1,
        timestamp: "2024-01-20T14:30:00Z",
        type: "info",
        message: "Application deployed successfully",
      },
      {
        id: 2,
        timestamp: "2024-01-20T14:25:00Z",
        type: "info",
        message: "SSL certificate renewed",
      },
      {
        id: 3,
        timestamp: "2024-01-20T14:20:00Z",
        type: "warning",
        message: "High memory usage detected (85%)",
      },
    ],
  };

  useEffect(() => {
    // Simulate API call
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        // In real app, you would fetch from API using params.id
        // For now, use dummy data
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
        setSubscription(dummySubscription);
      } catch (err) {
        setError("Failed to fetch app details");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [params.id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PENDING_DEPLOYMENT":
        return "bg-yellow-100 text-yellow-800";
      case "SUSPENDED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading app details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !subscription) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            App Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The requested app could not be found."}
          </p>
          <Button onClick={() => router.push("/dashboard/my-apps")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Apps
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 border rounded-lg">
                <img
                  src={subscription.service.icon}
                  alt={subscription.service.displayName}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {subscription.service.displayName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {subscription.service.category} •{" "}
                  {subscription.variant.variantDisplayName}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(subscription.status)}>
              {subscription.status}
            </Badge>
            {subscription.status === "ACTIVE" && subscription.subdomain && (
              <Button
                onClick={() =>
                  window.open(
                    `https://${subscription.subdomain}.yourdomain.com`,
                    "_blank"
                  )
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open App
              </Button>
            )}
          </div>
        </div>
        <Separator></Separator>

        {/* Main Content */}
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 ">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* App Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    App Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">App URL</p>
                    <div className="bg-gray-100 rounded-lg p-3 border">
                      <p className="text-sm font-mono text-gray-700 truncate">
                        {subscription.subdomain}.yourdomain.com
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resource Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">CPU</span>
                    </div>
                    <span className="text-sm font-medium">
                      {subscription.variant.cpuSpec}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MemoryStick className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Memory</span>
                    </div>
                    <span className="text-sm font-medium">
                      {subscription.variant.memSpec}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Storage</span>
                    </div>
                    <span className="text-sm font-medium">
                      {subscription.variant.diskSpec}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Uptime</span>
                    <span className="text-sm font-medium text-green-600">
                      {subscription.metrics.uptime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Response Time</span>
                    <span className="text-sm font-medium">
                      {subscription.metrics.avgResponseTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">This Month</span>
                    <span className="text-sm font-medium">
                      {subscription.metrics.visitors} visitors
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Uptime
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {subscription.metrics.uptime}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Bandwidth
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {subscription.metrics.bandwidth}
                      </p>
                    </div>
                    <Network className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Visitors
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {subscription.metrics.visitors}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Page Views
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {subscription.metrics.pageViews}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>
                  Application performance metrics for the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    Performance charts would be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Activity Logs</span>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </CardTitle>
                <CardDescription>
                  Recent activities and system events for your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscription.logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {log.type === "info" && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                        {log.type === "warning" && (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        {log.type === "error" && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{log.message}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  App Settings
                </CardTitle>
                <CardDescription>
                  Manage your application settings and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Application Actions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="justify-start">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Restart Application
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Database className="w-4 h-4 mr-2" />
                        Backup Data
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Billing Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Current Plan
                        </span>
                        <span className="text-sm font-medium">
                          {subscription.variant.variantDisplayName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Monthly Cost
                        </span>
                        <span className="text-sm font-medium">
                          Rp{" "}
                          {subscription.variant.monthlyPrice.toLocaleString()}
                          /month
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Next Billing
                        </span>
                        <span className="text-sm font-medium">
                          {formatDate(subscription.expiresAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-red-600 mb-2">
                      Danger Zone
                    </h3>
                    <Button variant="destructive" className="justify-start">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Application
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      This action cannot be undone. All data will be permanently
                      deleted.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
