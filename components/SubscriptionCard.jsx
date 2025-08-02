"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Globe,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export default function SubscriptionCard({ 
  subscription, 
  showManageButton = true,
  variant = "default" // "default" or "compact"
}) {
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
      case "CANCELLED":
        return "Canceled";
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

  return (
    <Card className="hover:shadow-xl transition-all duration-300 group border gap-2">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gray-100 border dark:bg-blue-900 rounded-lg">
                <img
                  src={subscription.service.icon}
                  alt={subscription.service.displayName || subscription.service.name}
                  className="w-9 h-9 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate text-gray-900 dark:text-white">
                  {subscription.service.displayName}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                  {subscription.service.name}
                </CardDescription>
              </div>
            </div>
          </div>
          <Badge
            className={`text-white text-xs font-medium px-2 py-1 ${getStatusColor(
              subscription.status
            )}`}
          >
            {getStatusText(subscription.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* App URL */}
        {subscription.subdomain && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Globe className="w-4 h-4" />
              <span>App URL</span>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border">
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate">
                {subscription.subdomain}.yourdomain.com
              </p>
            </div>
          </div>
        )}

        {/* Expiry Date */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Expires</span>
          </div>
          <span className="text-sm text-gray-500 font-medium dark:text-white">
            {formatDate(subscription.expiresAt)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {subscription.status === "ACTIVE" && subscription.subdomain ? (
            <>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 bg-blue-600 hover:bg-blue-700 hover:text-white text-white cursor-pointer"
                onClick={() =>
                  window.open(
                    `https://${subscription.subdomain}.yourdomain.com`,
                    "_blank"
                  )
                }
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open App
              </Button>
              {showManageButton && (
                <Button
                  size="lg"
                  className="cursor-pointer"
                  variant="outline"
                  asChild
                >
                  <Link href={`/dashboard/my-apps/${subscription.id}`}>
                    Manage
                  </Link>
                </Button>
              )}
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              disabled
            >
              {subscription.status === "PENDING_DEPLOYMENT"
                ? "Deploying..."
                : "Unavailable"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}