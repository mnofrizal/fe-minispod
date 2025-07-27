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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Eye,
  Play,
  Square,
  Trash2,
  ExternalLink,
  Ban,
  Pause,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function SubscriptionList() {
  const { data: session } = useSession();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:3000/api/v1/admin/subscriptions",
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setSubscriptions(data.data.subscriptions);
          setPagination(data.data.pagination);
        } else {
          setError(data.message || "Failed to fetch subscriptions");
        }
      } catch (err) {
        setError("An error occurred while fetching subscriptions");
        console.error("Error fetching subscriptions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [session]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "CANCELLED":
        return "destructive";
      case "EXPIRED":
        return "secondary";
      case "PENDING":
        return "outline";
      default:
        return "outline";
    }
  };

  const getInstanceStatusBadgeVariant = (status) => {
    switch (status) {
      case "RUNNING":
        return "default";
      case "STOPPED":
        return "destructive";
      case "PENDING":
        return "outline";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseInt(price));
  };

  // Filter subscriptions based on search term
  const filteredSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.user.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subscription.service.displayName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subscription.service.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subscription.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch subscription details
  const fetchSubscriptionDetails = async (subscriptionId) => {
    if (!session?.accessToken) return;

    try {
      setDetailLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/v1/admin/subscriptions/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSelectedSubscription(data.data);
        setIsDetailOpen(true);
      } else {
        toast.error(data.message || "Failed to fetch subscription details", {
          style: {
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          },
        });
      }
    } catch (err) {
      toast.error("An error occurred while fetching subscription details", {
        style: {
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
        },
      });
      console.error("Error fetching subscription details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle row click
  const handleRowClick = (subscriptionId) => {
    fetchSubscriptionDetails(subscriptionId);
  };

  // Handle service instance actions
  const handleInstanceAction = async (action, subscriptionId) => {
    if (!session?.accessToken) return;

    try {
      setIsActionLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/v1/admin/subscriptions/${subscriptionId}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh subscriptions list
        const refreshResponse = await fetch(
          "http://localhost:3000/api/v1/admin/subscriptions",
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok && refreshData.success) {
          setSubscriptions(refreshData.data.subscriptions);
        }

        // Update selected subscription if detail is open
        if (
          selectedSubscription &&
          selectedSubscription.id === subscriptionId
        ) {
          fetchSubscriptionDetails(subscriptionId);
        }

        toast.success(`Service instance ${action}ed successfully.`);
      } else {
        toast.error(data.message || `Failed to ${action} service instance`, {
          style: {
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          },
        });
      }
    } catch (err) {
      toast.error(`An error occurred while ${action}ing service instance`, {
        style: {
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
        },
      });
      console.error(`Error ${action}ing service instance:`, err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle subscription status update
  const handleStatusUpdate = async (status, subscriptionId) => {
    if (!session?.accessToken) return;

    const statusLabels = {
      CANCELLED: "cancel",
      SUSPENDED: "suspend",
      ACTIVE: "activate",
    };

    try {
      setIsActionLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/v1/admin/subscriptions/${subscriptionId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh subscriptions list
        const refreshResponse = await fetch(
          "http://localhost:3000/api/v1/admin/subscriptions",
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok && refreshData.success) {
          setSubscriptions(refreshData.data.subscriptions);
        }

        // Update selected subscription if detail is open
        if (
          selectedSubscription &&
          selectedSubscription.id === subscriptionId
        ) {
          fetchSubscriptionDetails(subscriptionId);
        }

        toast.success(`Subscription ${statusLabels[status]}ed successfully.`);
      } else {
        toast.error(
          data.message || `Failed to ${statusLabels[status]} subscription`,
          {
            style: {
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#dc2626",
            },
          }
        );
      }
    } catch (err) {
      toast.error(
        `An error occurred while ${statusLabels[status]}ing subscription`,
        {
          style: {
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          },
        }
      );
      console.error(`Error ${statusLabels[status]}ing subscription:`, err);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>Loading subscriptions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>Error loading subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-red-500">{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscriptions</CardTitle>
              <CardDescription>
                Manage user subscriptions and service instances
                {pagination && (
                  <span className="ml-2">
                    ({pagination.total} total subscriptions)
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions by user, service, status, or subdomain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Instance</TableHead>
                <TableHead>Subdomain</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm
                          ? "No subscriptions found matching your search."
                          : "No subscriptions found."}
                      </p>
                      {searchTerm && (
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search terms.
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <ContextMenu key={subscription.id}>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(subscription.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src=""
                                alt={subscription.user.name}
                              />
                              <AvatarFallback className="text-xs">
                                {subscription.user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {subscription.user.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {subscription.user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {subscription.service.displayName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {subscription.service.category}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(subscription.status)}
                          >
                            {subscription.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getInstanceStatusBadgeVariant(
                              subscription.serviceInstance?.status
                            )}
                          >
                            {subscription.serviceInstance?.status || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-xs">
                            {subscription.subdomain}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatPrice(subscription.service.monthlyPrice)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(subscription.expiresAt)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(subscription.createdAt)}
                        </TableCell>
                      </TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-56">
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(subscription.id);
                        }}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </ContextMenuItem>
                      <ContextMenuSeparator />

                      {/* Subscription Status Actions */}
                      {subscription.status !== "ACTIVE" && (
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate("ACTIVE", subscription.id);
                          }}
                          className="cursor-pointer"
                          disabled={isActionLoading}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Activate Subscription
                        </ContextMenuItem>
                      )}

                      {subscription.status === "ACTIVE" && (
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate("SUSPENDED", subscription.id);
                          }}
                          className="cursor-pointer"
                          disabled={isActionLoading}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Suspend Subscription
                        </ContextMenuItem>
                      )}

                      {(subscription.status === "ACTIVE" ||
                        subscription.status === "SUSPENDED") && (
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              confirm(
                                `Are you sure you want to cancel this subscription? This action cannot be undone.`
                              )
                            ) {
                              handleStatusUpdate("CANCELLED", subscription.id);
                            }
                          }}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                          disabled={isActionLoading}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Cancel Subscription
                        </ContextMenuItem>
                      )}

                      <ContextMenuSeparator />

                      {/* Service Instance Actions */}
                      {subscription.serviceInstance?.status === "STOPPED" && (
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInstanceAction("start", subscription.id);
                          }}
                          className="cursor-pointer"
                          disabled={isActionLoading}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Instance
                        </ContextMenuItem>
                      )}
                      {subscription.serviceInstance?.status === "RUNNING" && (
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInstanceAction("stop", subscription.id);
                          }}
                          className="cursor-pointer"
                          disabled={isActionLoading}
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Stop Instance
                        </ContextMenuItem>
                      )}

                      {subscription.serviceInstance?.externalUrl && (
                        <>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                subscription.serviceInstance.externalUrl,
                                "_blank"
                              );
                            }}
                            className="cursor-pointer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Service
                          </ContextMenuItem>
                        </>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Subscription Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Subscription Details
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading subscription details...
                </span>
              </div>
            </div>
          ) : selectedSubscription ? (
            <div className="py-4">
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column - Subscription Info */}
                <div className="col-span-5 space-y-4">
                  {/* User Info */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      User Information
                    </Label>
                    <div className="mt-3 flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src=""
                          alt={selectedSubscription.user.name}
                        />
                        <AvatarFallback className="text-sm font-semibold">
                          {selectedSubscription.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {selectedSubscription.user.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedSubscription.user.email}
                        </p>
                        <Badge
                          variant={
                            selectedSubscription.user.role === "ADMINISTRATOR"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs mt-1"
                        >
                          {selectedSubscription.user.role}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Service Info */}
                  <div className="p-4 border rounded-lg bg-card">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Service Information
                    </Label>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Service Name
                        </span>
                        <p className="text-sm font-medium">
                          {selectedSubscription.service.displayName}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Category
                        </span>
                        <p className="text-sm font-medium capitalize">
                          {selectedSubscription.service.category}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Monthly Price
                        </span>
                        <p className="text-sm font-medium">
                          {formatPrice(
                            selectedSubscription.service.monthlyPrice
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Docker Image
                        </span>
                        <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {selectedSubscription.service.dockerImage}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Details */}
                  <div className="p-4 border rounded-lg bg-card">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Subscription Details
                    </Label>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Status
                        </span>
                        <div className="mt-1">
                          <Badge
                            variant={getStatusBadgeVariant(
                              selectedSubscription.status
                            )}
                          >
                            {selectedSubscription.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Subdomain
                        </span>
                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">
                          {selectedSubscription.subdomain}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Start Date
                        </span>
                        <p className="text-sm font-medium mt-1">
                          {formatDate(selectedSubscription.startDate)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Expires At
                        </span>
                        <p className="text-sm font-medium mt-1">
                          {formatDate(selectedSubscription.expiresAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Service Instance */}
                <div className="col-span-7">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">
                        Service Instance
                      </Label>
                      <div className="flex gap-2">
                        {selectedSubscription.serviceInstance?.status ===
                          "STOPPED" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleInstanceAction(
                                "start",
                                selectedSubscription.id
                              )
                            }
                            disabled={isActionLoading}
                          >
                            {isActionLoading ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Starting...
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3 mr-2" />
                                Start
                              </>
                            )}
                          </Button>
                        )}
                        {selectedSubscription.serviceInstance?.status ===
                          "RUNNING" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleInstanceAction(
                                "stop",
                                selectedSubscription.id
                              )
                            }
                            disabled={isActionLoading}
                          >
                            {isActionLoading ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Stopping...
                              </>
                            ) : (
                              <>
                                <Square className="h-3 w-3 mr-2" />
                                Stop
                              </>
                            )}
                          </Button>
                        )}
                        {selectedSubscription.serviceInstance?.externalUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(
                                selectedSubscription.serviceInstance
                                  .externalUrl,
                                "_blank"
                              )
                            }
                          >
                            <ExternalLink className="h-3 w-3 mr-2" />
                            Open
                          </Button>
                        )}
                      </div>
                    </div>

                    {selectedSubscription.serviceInstance ? (
                      <div className="p-4 border rounded-lg bg-card">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Instance Status
                            </span>
                            <Badge
                              variant={getInstanceStatusBadgeVariant(
                                selectedSubscription.serviceInstance.status
                              )}
                            >
                              {selectedSubscription.serviceInstance.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <span className="text-xs text-muted-foreground">
                                External URL
                              </span>
                              <div className="mt-1">
                                {selectedSubscription.serviceInstance
                                  .externalUrl ? (
                                  <a
                                    href={
                                      selectedSubscription.serviceInstance
                                        .externalUrl
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 underline font-mono break-all"
                                  >
                                    {
                                      selectedSubscription.serviceInstance
                                        .externalUrl
                                    }
                                  </a>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    Not available
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <span className="text-xs text-muted-foreground">
                                Internal URL
                              </span>
                              <p className="text-xs font-mono bg-muted px-2 py-1 rounded mt-1 break-all">
                                {selectedSubscription.serviceInstance
                                  .internalUrl || "Not available"}
                              </p>
                            </div>

                            <div>
                              <span className="text-xs text-muted-foreground">
                                Pod Name
                              </span>
                              <p className="text-xs font-mono bg-muted px-2 py-1 rounded mt-1">
                                {selectedSubscription.serviceInstance.podName ||
                                  "Not available"}
                              </p>
                            </div>

                            <div>
                              <span className="text-xs text-muted-foreground">
                                Namespace
                              </span>
                              <p className="text-xs font-mono bg-muted px-2 py-1 rounded mt-1">
                                {selectedSubscription.serviceInstance
                                  .namespace || "Not available"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                        <div className="text-muted-foreground">
                          <p className="text-sm">No service instance found</p>
                          <p className="text-xs mt-1">
                            This subscription doesn't have an associated service
                            instance.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <p className="text-sm">No subscription data available</p>
                <p className="text-xs mt-1">
                  Unable to load subscription information.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
