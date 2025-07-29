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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  RefreshCw,
  ExternalLink,
  Server,
  User,
  Calendar,
  AlertTriangle,
  Trash2,
  Eye,
  Activity,
  Terminal,
  Copy,
  Search,
} from "lucide-react";
import { toast } from "sonner";

export default function PodList() {
  const { data: session } = useSession();
  const [pods, setPods] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPod, setSelectedPod] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [orphanedPods, setOrphanedPods] = useState([]);
  const [orphanedSummary, setOrphanedSummary] = useState({});
  const [orphanedLoading, setOrphanedLoading] = useState(false);
  const [orphanedError, setOrphanedError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrphanedPods, setSelectedOrphanedPods] = useState([]);
  const [deletingPods, setDeletingPods] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const fetchPods = async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/api/v1/admin/pods", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPods(data.data.pods || []);
        setStatistics(data.data.statistics || {});
        setPagination(data.data.pagination || {});
      } else {
        throw new Error(data.message || "Failed to fetch pods");
      }
    } catch (err) {
      console.error("Error fetching pods:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrphanedPods = async () => {
    if (!session?.accessToken) return;

    setOrphanedLoading(true);
    setOrphanedError(null);

    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/admin/pods/orphaned",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setOrphanedPods(data.data.orphanedPods || []);
        setOrphanedSummary(data.data.summary || {});
      } else {
        throw new Error(data.message || "Failed to fetch orphaned pods");
      }
    } catch (err) {
      console.error("Error fetching orphaned pods:", err);
      setOrphanedError(err.message);
    } finally {
      setOrphanedLoading(false);
    }
  };

  const deleteOrphanedPods = async () => {
    if (!session?.accessToken || selectedOrphanedPods.length === 0) return;

    setDeletingPods(true);
    setDeleteError(null);
    setDeleteSuccess(false);

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      // Delete each selected pod individually using the correct API endpoint
      for (const pod of selectedOrphanedPods) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/v1/admin/pods/orphaned/${pod.deploymentName}/${pod.namespace}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                confirm: true,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success) {
            successCount++;
          } else {
            errorCount++;
            errors.push(
              `${pod.deploymentName}: ${data.message || "Unknown error"}`
            );
          }
        } catch (err) {
          errorCount++;
          errors.push(`${pod.deploymentName}: ${err.message}`);
        }
      }

      // Show results
      if (successCount > 0) {
        setDeleteSuccess(true);
        toast.success(`Successfully deleted ${successCount} orphaned pod(s).`);
      }

      if (errorCount > 0) {
        const errorMessage = `Failed to delete ${errorCount} pod(s): ${errors.join(
          ", "
        )}`;
        setDeleteError(errorMessage);
        toast.error(errorMessage, {
          style: {
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          },
        });
      }

      // Reset selection and refresh list
      setSelectedOrphanedPods([]);
      fetchOrphanedPods();
    } catch (err) {
      console.error("Error deleting orphaned pods:", err);
      setDeleteError(err.message);
    } finally {
      setDeletingPods(false);
    }
  };

  // Delete single orphaned pod
  const deleteSingleOrphanedPod = async (deploymentName, namespace) => {
    if (!session?.accessToken) return;

    if (
      !confirm(
        `Are you sure you want to delete the orphaned pod "${deploymentName}" in namespace "${namespace}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeletingPods(true);
      setDeleteError(null);

      const response = await fetch(
        `http://localhost:3000/api/v1/admin/pods/orphaned/${deploymentName}/${namespace}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            confirm: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success(`Orphaned pod "${deploymentName}" deleted successfully.`);
        fetchOrphanedPods(); // Refresh the orphaned pods list
      } else {
        throw new Error(data.message || "Failed to delete orphaned pod");
      }
    } catch (err) {
      console.error("Error deleting orphaned pod:", err);
      toast.error(`Failed to delete orphaned pod: ${err.message}`, {
        style: {
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
        },
      });
    } finally {
      setDeletingPods(false);
    }
  };

  const handleOrphanedPodsClick = () => {
    setDialogOpen(true);
    setSelectedOrphanedPods([]);
    setDeleteError(null);
    setDeleteSuccess(false);
    fetchOrphanedPods();
  };

  const handleSelectOrphanedPod = (pod, isSelected) => {
    if (isSelected) {
      setSelectedOrphanedPods((prev) => [...prev, pod]);
    } else {
      setSelectedOrphanedPods((prev) =>
        prev.filter(
          (p) =>
            p.deploymentName !== pod.deploymentName ||
            p.namespace !== pod.namespace
        )
      );
    }
  };

  const handleSelectAllOrphanedPods = (isSelected) => {
    if (isSelected) {
      setSelectedOrphanedPods([...orphanedPods]);
    } else {
      setSelectedOrphanedPods([]);
    }
  };

  // Fetch pod details
  const fetchPodDetails = async (podId) => {
    if (!session?.accessToken) return;

    try {
      setDetailLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/v1/admin/pods/${podId}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSelectedPod(data.data);
        setIsDetailOpen(true);
      } else {
        toast.error(data.message || "Failed to fetch pod details", {
          style: {
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          },
        });
      }
    } catch (err) {
      toast.error("An error occurred while fetching pod details", {
        style: {
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
        },
      });
      console.error("Error fetching pod details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle row click
  const handleRowClick = (podId) => {
    fetchPodDetails(podId);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  useEffect(() => {
    fetchPods();
  }, [session]);

  const getStatusBadge = (status, realTimeStatus) => {
    const currentStatus = realTimeStatus?.status || status;
    const variant =
      {
        RUNNING: "default",
        PENDING: "secondary",
        FAILED: "destructive",
        STOPPED: "outline",
      }[currentStatus] || "secondary";

    return (
      <Badge variant={variant} className="capitalize">
        {currentStatus.toLowerCase()}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMemory = (memoryMB) => {
    if (!memoryMB) return "0 MB";
    const value = parseFloat(memoryMB);
    if (value >= 1024) {
      return `${(value / 1024).toFixed(1)} GB`;
    }
    return `${value.toFixed(0)} MB`;
  };

  const formatCpu = (cpuCores) => {
    if (!cpuCores) return "0";
    return parseFloat(cpuCores).toFixed(3);
  };

  const openExternalUrl = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Filter pods based on search term
  const filteredPods = pods.filter(
    (pod) =>
      pod.podName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pod.namespace.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pod.subscription?.service?.displayName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      pod.subscription?.user?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      pod.subscription?.user?.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      pod.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pod.workerNode?.nodeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Pod Management
          </CardTitle>
          <CardDescription>Loading pod information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading pods...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Pod Management
          </CardTitle>
          <CardDescription>Error loading pod information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">
              Error: {error}
            </p>
            <Button onClick={fetchPods} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Pods
                  </p>
                  <p className="text-2xl font-bold">{statistics.total || 0}</p>
                </div>
                <Server className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Running
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics.running || 0}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {statistics.pending || 0}
                  </p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Failed
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {statistics.failed || 0}
                  </p>
                </div>
                <div className="h-8 w-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-red-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pods Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Pod Management
                </CardTitle>
                <CardDescription>
                  Manage and monitor all pods with real-time metrics
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={handleOrphanedPodsClick}
                      variant="outline"
                      size="sm"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Orphan Pods
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[85vw] w-[85vw] max-h-[80vh] overflow-y-auto scrollbar-hide sm:max-w-[75vw] sm:w-[75vw]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Orphaned Pods
                      </DialogTitle>
                      <DialogDescription>
                        Pods that exist in Kubernetes but have no corresponding
                        database record
                      </DialogDescription>
                    </DialogHeader>

                    {orphanedLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading orphaned pods...</span>
                      </div>
                    ) : orphanedError ? (
                      <div className="text-center py-8">
                        <p className="text-red-600 dark:text-red-400 mb-4">
                          Error: {orphanedError}
                        </p>
                        <Button onClick={fetchOrphanedPods} variant="outline">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  Total K8s Pods
                                </p>
                                <p className="text-2xl font-bold">
                                  {orphanedSummary.totalKubernetesPods || 0}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  Database Pods
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                  {orphanedSummary.totalDatabasePods || 0}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  Orphaned
                                </p>
                                <p className="text-2xl font-bold text-orange-600">
                                  {orphanedSummary.orphanedCount || 0}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  Namespaces
                                </p>
                                <p className="text-2xl font-bold">
                                  {orphanedSummary.namespacesChecked || 0}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Delete Controls */}
                        {orphanedPods.length > 0 && (
                          <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-4">
                              <Checkbox
                                checked={
                                  selectedOrphanedPods.length ===
                                  orphanedPods.length
                                }
                                onCheckedChange={handleSelectAllOrphanedPods}
                              />
                              <span className="text-sm font-medium">
                                {selectedOrphanedPods.length > 0
                                  ? `${selectedOrphanedPods.length} selected`
                                  : "Select all"}
                              </span>
                            </div>
                            {selectedOrphanedPods.length > 0 && (
                              <Button
                                onClick={deleteOrphanedPods}
                                disabled={deletingPods}
                                variant="destructive"
                                size="sm"
                              >
                                {deletingPods ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Selected (
                                    {selectedOrphanedPods.length})
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Status Messages */}
                        {deleteError && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            Error: {deleteError}
                          </div>
                        )}

                        {deleteSuccess && (
                          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                            Successfully deleted selected orphaned pods!
                          </div>
                        )}

                        {/* Orphaned Pods Table */}
                        {orphanedPods.length === 0 ? (
                          <div className="text-center py-8">
                            <AlertTriangle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">
                              No orphaned pods found
                            </p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-12">Select</TableHead>
                                  <TableHead>Deployment</TableHead>
                                  <TableHead>Namespace</TableHead>
                                  <TableHead>Service</TableHead>
                                  <TableHead>Replicas</TableHead>
                                  <TableHead>Worker Nodes</TableHead>
                                  <TableHead>Created</TableHead>
                                  <TableHead>Reason</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {orphanedPods.map((pod, index) => {
                                  const isSelected = selectedOrphanedPods.some(
                                    (p) =>
                                      p.deploymentName === pod.deploymentName &&
                                      p.namespace === pod.namespace
                                  );
                                  return (
                                    <ContextMenu key={index}>
                                      <ContextMenuTrigger asChild>
                                        <TableRow
                                          className={
                                            isSelected
                                              ? "bg-blue-50 dark:bg-blue-900/20 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                              : "cursor-pointer hover:bg-muted/50"
                                          }
                                        >
                                          <TableCell>
                                            <Checkbox
                                              checked={isSelected}
                                              onCheckedChange={(checked) =>
                                                handleSelectOrphanedPod(
                                                  pod,
                                                  checked
                                                )
                                              }
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <div>
                                              <p className="font-medium">
                                                {pod.deploymentName}
                                              </p>
                                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                {pod.pods?.map((p, i) => (
                                                  <div
                                                    key={i}
                                                    className="flex items-center gap-1"
                                                  >
                                                    <div
                                                      className={`w-2 h-2 rounded-full ${
                                                        p.phase === "Running"
                                                          ? "bg-green-500"
                                                          : "bg-red-500"
                                                      }`}
                                                    ></div>
                                                    <span>{p.name}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant="outline">
                                              {pod.namespace}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant="secondary">
                                              {pod.labels?.service || "N/A"}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            <div className="text-center">
                                              <span className="font-medium">
                                                {pod.readyReplicas}/
                                                {pod.replicas}
                                              </span>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            {pod.workerNodesSummary &&
                                            pod.workerNodesSummary.length >
                                              0 ? (
                                              <div className="text-sm">
                                                {pod.workerNodesSummary.map(
                                                  (nodeName, idx) => {
                                                    const workerNode =
                                                      pod.pods?.find(
                                                        (p) =>
                                                          p.workerNode
                                                            ?.nodeName ===
                                                          nodeName
                                                      )?.workerNode;
                                                    return (
                                                      <div
                                                        key={idx}
                                                        className="mb-1 last:mb-0"
                                                      >
                                                        <p className="font-medium">
                                                          {nodeName}
                                                        </p>
                                                        {workerNode && (
                                                          <>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                              {
                                                                workerNode.nodeIP
                                                              }
                                                            </p>
                                                            <div className="flex items-center gap-1">
                                                              <div
                                                                className={`w-2 h-2 rounded-full ${
                                                                  workerNode.ready
                                                                    ? "bg-green-500"
                                                                    : "bg-red-500"
                                                                }`}
                                                              ></div>
                                                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                {
                                                                  workerNode.architecture
                                                                }
                                                              </span>
                                                            </div>
                                                          </>
                                                        )}
                                                      </div>
                                                    );
                                                  }
                                                )}
                                              </div>
                                            ) : (
                                              <span className="text-xs text-gray-400">
                                                N/A
                                              </span>
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex items-center gap-1 text-sm">
                                              <Calendar className="h-3 w-3" />
                                              {formatDate(pod.createdAt)}
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <Badge
                                              variant="destructive"
                                              className="text-xs"
                                            >
                                              {pod.reason}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      </ContextMenuTrigger>
                                      <ContextMenuContent className="w-48">
                                        <ContextMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSingleOrphanedPod(
                                              pod.deploymentName,
                                              pod.namespace
                                            );
                                          }}
                                          className="cursor-pointer text-red-600 focus:text-red-600"
                                          disabled={deletingPods}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete Orphaned Pod
                                        </ContextMenuItem>
                                      </ContextMenuContent>
                                    </ContextMenu>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Button onClick={fetchPods} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pods by name, namespace, service, user, or worker node..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            {filteredPods.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "No pods found matching your search."
                      : "No pods found."}
                  </p>
                  {searchTerm && (
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search terms.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pod Name</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Resource Usage</TableHead>
                      <TableHead>Worker Node</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPods.map((pod) => (
                      <ContextMenu key={pod.id}>
                        <ContextMenuTrigger asChild>
                          <TableRow
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleRowClick(pod.id)}
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium">{pod.podName}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {pod.namespace}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {pod.subscription?.service?.displayName}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {pod.subscription?.service?.variant}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <div>
                                  <p className="font-medium">
                                    {pod.subscription?.user?.name}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {pod.subscription?.user?.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {getStatusBadge(pod.status, pod.realTimeStatus)}
                                {pod.realTimeStatus && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {pod.realTimeStatus.replicas?.ready || 0}/
                                    {pod.realTimeStatus.replicas?.desired || 0}{" "}
                                    replicas
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">
                                      CPU
                                    </span>
                                    <span className="text-xs font-medium">
                                      {pod.cpuAllocated} cores
                                    </span>
                                  </div>
                                  {pod.metrics?.metricsAvailable && (
                                    <>
                                      <Progress
                                        value={pod.metrics.cpuUtilization}
                                        className="h-1 mt-1"
                                      />
                                      <div className="text-xs text-muted-foreground">
                                        {pod.metrics.cpuUtilization.toFixed(1)}%
                                        ({formatCpu(pod.metrics.cpuUsage)}{" "}
                                        cores)
                                      </div>
                                    </>
                                  )}
                                </div>
                                <div className="text-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">
                                      Memory
                                    </span>
                                    <span className="text-xs font-medium">
                                      {pod.memAllocated}
                                    </span>
                                  </div>
                                  {pod.metrics?.metricsAvailable && (
                                    <>
                                      <Progress
                                        value={pod.metrics.memoryUtilization}
                                        className="h-1 mt-1"
                                      />
                                      <div className="text-xs text-muted-foreground">
                                        {pod.metrics.memoryUtilization.toFixed(
                                          1
                                        )}
                                        % (
                                        {formatMemory(pod.metrics.memoryUsage)}{" "}
                                        MB)
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {pod.workerNode ? (
                                <div className="text-sm">
                                  <p className="font-medium">
                                    {pod.workerNode.nodeName}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {pod.workerNode.nodeIP}
                                  </p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        pod.workerNode.phase === "Running"
                                          ? "bg-green-500"
                                          : "bg-red-500"
                                      }`}
                                    ></div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      {pod.workerNode.nodeArchitecture}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">
                                  N/A
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3 w-3" />
                                {formatDate(pod.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {pod.externalUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openExternalUrl(pod.externalUrl);
                                    }}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Open
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-48">
                          <ContextMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(pod.id);
                            }}
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          {pod.externalUrl && (
                            <ContextMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                openExternalUrl(pod.externalUrl);
                              }}
                              className="cursor-pointer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open Service
                            </ContextMenuItem>
                          )}
                          {pod.localAccess?.portForwardCommand && (
                            <ContextMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(
                                  pod.localAccess.portForwardCommand
                                );
                              }}
                              className="cursor-pointer"
                            >
                              <Terminal className="h-4 w-4 mr-2" />
                              Copy Port Forward
                            </ContextMenuItem>
                          )}
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination Info */}
            {pagination.total > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredPods.length} of {pagination.total} pods
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pod Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[1000px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Pod Details
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading pod details...
                </span>
              </div>
            </div>
          ) : selectedPod ? (
            <div className="py-4">
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column - Basic Info */}
                <div className="col-span-4 space-y-4">
                  {/* Pod Info */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Pod Information
                    </Label>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Pod Name
                        </span>
                        <p className="text-sm font-medium">
                          {selectedPod.podName}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Namespace
                        </span>
                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {selectedPod.namespace}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Status
                        </span>
                        <div className="mt-1">
                          {getStatusBadge(
                            selectedPod.status,
                            selectedPod.realTimeStatus
                          )}
                        </div>
                      </div>
                      {selectedPod.realTimeStatus && (
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Replicas
                          </span>
                          <p className="text-sm font-medium">
                            {selectedPod.realTimeStatus.replicas?.ready || 0}/
                            {selectedPod.realTimeStatus.replicas?.desired || 0}{" "}
                            ready
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service & User Info */}
                  <div className="p-4 border rounded-lg bg-card">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Service & User
                    </Label>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Service
                        </span>
                        <p className="text-sm font-medium">
                          {selectedPod.subscription?.service?.displayName}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {selectedPod.subscription?.service?.variant}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          User
                        </span>
                        <p className="text-sm font-medium">
                          {selectedPod.subscription?.user?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedPod.subscription?.user?.email}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Monthly Price
                        </span>
                        <p className="text-sm font-medium">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(
                            parseInt(
                              selectedPod.subscription?.service?.monthlyPrice ||
                                0
                            )
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Column - Resources & Metrics */}
                <div className="col-span-4 space-y-4">
                  {/* Resource Usage */}
                  <div className="p-4 border rounded-lg bg-card">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Resource Usage
                    </Label>
                    <div className="mt-3 space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">
                            CPU
                          </span>
                          <span className="text-xs font-medium">
                            {selectedPod.cpuAllocated} cores allocated
                          </span>
                        </div>
                        {selectedPod.metrics?.metricsAvailable && (
                          <>
                            <Progress
                              value={selectedPod.metrics.cpuUtilization}
                              className="h-2"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {selectedPod.metrics.cpuUtilization.toFixed(1)}%
                              used ({formatCpu(selectedPod.metrics.cpuUsage)}{" "}
                              cores)
                            </div>
                          </>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">
                            Memory
                          </span>
                          <span className="text-xs font-medium">
                            {selectedPod.memAllocated} allocated
                          </span>
                        </div>
                        {selectedPod.metrics?.metricsAvailable && (
                          <>
                            <Progress
                              value={selectedPod.metrics.memoryUtilization}
                              className="h-2"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {selectedPod.metrics.memoryUtilization.toFixed(1)}
                              % used (
                              {formatMemory(selectedPod.metrics.memoryUsage)}{" "}
                              MB)
                            </div>
                          </>
                        )}
                      </div>
                      {selectedPod.metrics?.metricsTimestamp && (
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Metrics Updated
                          </span>
                          <p className="text-sm font-medium">
                            {formatDate(selectedPod.metrics.metricsTimestamp)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Worker Node */}
                  {selectedPod.workerNode && (
                    <div className="p-4 border rounded-lg bg-card">
                      <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Worker Node
                      </Label>
                      <div className="mt-3 space-y-3">
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Node Name
                          </span>
                          <p className="text-sm font-medium">
                            {selectedPod.workerNode.nodeName}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Node IP
                          </span>
                          <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {selectedPod.workerNode.nodeIP}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Pod IP
                          </span>
                          <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {selectedPod.workerNode.podIP}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Architecture
                          </span>
                          <p className="text-sm font-medium">
                            {selectedPod.workerNode.nodeArchitecture}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Kubelet Version
                          </span>
                          <p className="text-sm font-medium">
                            {selectedPod.workerNode.kubeletVersion}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - URLs & Local Access */}
                <div className="col-span-4 space-y-4">
                  {/* URLs */}
                  <div className="p-4 border rounded-lg bg-card">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Service URLs
                    </Label>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          External URL
                        </span>
                        <div className="mt-1">
                          {selectedPod.externalUrl ? (
                            <div className="flex items-center gap-2">
                              <a
                                href={selectedPod.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 underline font-mono break-all"
                              >
                                {selectedPod.externalUrl}
                              </a>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  copyToClipboard(selectedPod.externalUrl)
                                }
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
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
                        <div className="mt-1">
                          {selectedPod.internalUrl ? (
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                                {selectedPod.internalUrl}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  copyToClipboard(selectedPod.internalUrl)
                                }
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Not available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Local Access */}
                  {selectedPod.localAccess && (
                    <div className="p-4 border rounded-lg bg-card">
                      <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Local Access
                      </Label>
                      <div className="mt-3 space-y-3">
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Port Forward Command
                          </span>
                          <div className="mt-1 flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all">
                              {selectedPod.localAccess.portForwardCommand}
                            </code>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                copyToClipboard(
                                  selectedPod.localAccess.portForwardCommand
                                )
                              }
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <span className="text-xs text-muted-foreground">
                            Local URL
                          </span>
                          <div className="mt-1">
                            <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {selectedPod.localAccess.localUrl}
                            </p>
                          </div>
                        </div>

                        <div>
                          <span className="text-xs text-muted-foreground">
                            Instructions
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedPod.localAccess.instructions}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="p-4 border rounded-lg bg-card">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Timestamps
                    </Label>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Created At
                        </span>
                        <p className="text-sm font-medium">
                          {formatDate(selectedPod.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Last Status Sync
                        </span>
                        <p className="text-sm font-medium">
                          {formatDate(selectedPod.lastStatusSync)}
                        </p>
                      </div>
                      {selectedPod.realTimeStatus?.lastUpdated && (
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Real-time Status Updated
                          </span>
                          <p className="text-sm font-medium">
                            {formatDate(selectedPod.realTimeStatus.lastUpdated)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <p className="text-sm">No pod data available</p>
                <p className="text-xs mt-1">Unable to load pod information.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
