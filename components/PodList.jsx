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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  RefreshCw,
  ExternalLink,
  Server,
  User,
  Calendar,
  AlertTriangle,
  Trash2,
} from "lucide-react";

export default function PodList() {
  const { data: session } = useSession();
  const [pods, setPods] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      const deployments = selectedOrphanedPods.map((pod) => ({
        deploymentName: pod.deploymentName,
        namespace: pod.namespace,
      }));

      const response = await fetch(
        "http://localhost:3000/api/v1/pods/admin/orphaned",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            confirm: true,
            deployments: deployments,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setDeleteSuccess(true);
        setSelectedOrphanedPods([]);
        // Refresh orphaned pods list
        fetchOrphanedPods();
      } else {
        throw new Error(data.message || "Failed to delete orphaned pods");
      }
    } catch (err) {
      console.error("Error deleting orphaned pods:", err);
      setDeleteError(err.message);
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

  const openExternalUrl = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

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
                Manage and monitor all pods in the system
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
                                  Delete Selected ({selectedOrphanedPods.length}
                                  )
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
                                  <TableRow
                                    key={index}
                                    className={
                                      isSelected
                                        ? "bg-blue-50 dark:bg-blue-900/20"
                                        : ""
                                    }
                                  >
                                    <TableCell>
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) =>
                                          handleSelectOrphanedPod(pod, checked)
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
                                          {pod.readyReplicas}/{pod.replicas}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {pod.workerNodesSummary &&
                                      pod.workerNodesSummary.length > 0 ? (
                                        <div className="text-sm">
                                          {pod.workerNodesSummary.map(
                                            (nodeName, idx) => {
                                              // Find the worker node details from the pods array
                                              const workerNode = pod.pods?.find(
                                                (p) =>
                                                  p.workerNode?.nodeName ===
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
                                                        {workerNode.nodeIP}
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
          {pods.length === 0 ? (
            <div className="text-center py-8">
              <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No pods found</p>
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
                    <TableHead>Resources</TableHead>
                    <TableHead>Worker Node</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pods.map((pod) => (
                    <TableRow key={pod.id}>
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
                        <div className="text-sm">
                          <p>CPU: {pod.cpuAllocated}</p>
                          <p>Memory: {pod.memAllocated}</p>
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
                                  pod.workerNode.ready
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {pod.workerNode.architecture}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
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
                              onClick={() => openExternalUrl(pod.externalUrl)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Open
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Info */}
          {pagination.total > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {pods.length} of {pagination.total} pods
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
