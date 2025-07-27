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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
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
import { Search, Eye, Activity, Server, HardDrive } from "lucide-react";
import { toast } from "sonner";

export default function WorkerList() {
  const { data: session } = useSession();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchWorkers = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:3000/api/v1/admin/workers",
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setWorkers(data.data.workers);
          setPagination(data.data.pagination);
        } else {
          setError(data.message || "Failed to fetch worker nodes");
        }
      } catch (err) {
        setError("An error occurred while fetching worker nodes");
        console.error("Error fetching workers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [session]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
        return "secondary";
      case "MAINTENANCE":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getReadyBadgeVariant = (isReady) => {
    return isReady ? "default" : "destructive";
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

  const formatMemory = (memoryKi) => {
    if (!memoryKi) return "0 GB";
    const memoryStr = memoryKi.toString();
    const value = parseFloat(memoryStr.replace("Ki", ""));
    const gb = (value / 1024 / 1024).toFixed(1);
    return `${gb} GB`;
  };

  const formatStorage = (storageKi) => {
    if (!storageKi) return "0 GB";
    const storageStr = storageKi.toString();
    const value = parseFloat(storageStr.replace("Ki", ""));
    const gb = (value / 1024 / 1024).toFixed(0);
    return `${gb} GB`;
  };

  const formatCpuUsage = (usage) => {
    if (!usage) return "0";
    return parseFloat(usage).toFixed(2);
  };

  const formatMemoryUsage = (usage) => {
    if (!usage) return "0";
    return parseFloat(usage).toFixed(1);
  };

  // Filter workers based on search term
  const filteredWorkers = workers.filter(
    (worker) =>
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.operatingSystem.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch worker details
  const fetchWorkerDetails = async (workerId) => {
    if (!session?.accessToken) return;

    try {
      setDetailLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/v1/admin/workers/${workerId}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSelectedWorker(data.data);
        setIsDetailOpen(true);
      } else {
        toast.error(data.message || "Failed to fetch worker details", {
          style: {
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          },
        });
      }
    } catch (err) {
      toast.error("An error occurred while fetching worker details", {
        style: {
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
        },
      });
      console.error("Error fetching worker details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle row click
  const handleRowClick = (workerId) => {
    fetchWorkerDetails(workerId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Worker Nodes</CardTitle>
          <CardDescription>Loading worker nodes...</CardDescription>
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
          <CardTitle>Worker Nodes</CardTitle>
          <CardDescription>Error loading worker nodes</CardDescription>
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
          <CardTitle>Worker Nodes</CardTitle>
          <CardDescription>
            Manage cluster worker nodes and their resources with live Kubernetes
            metrics
            {pagination && (
              <span className="ml-2">({pagination.total} total nodes)</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workers by name, hostname, IP, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Node</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>CPU Usage</TableHead>
                <TableHead>Memory Usage</TableHead>
                <TableHead>Storage</TableHead>
                <TableHead>Pods</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Ready</TableHead>
                <TableHead>Last Heartbeat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm
                          ? "No worker nodes found matching your search."
                          : "No worker nodes found."}
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
                filteredWorkers.map((worker) => (
                  <ContextMenu key={worker.id}>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(worker.id)}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{worker.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {worker.hostname}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {worker.ipAddress}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(worker.status)}>
                            {worker.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {worker.cpuCores} cores
                            </div>
                            {worker.metrics?.metricsAvailable && (
                              <>
                                <div className="w-20">
                                  <Progress
                                    value={worker.metrics.cpuUtilization}
                                    className="h-2"
                                  />
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {worker.metrics.cpuUtilization.toFixed(1)}% (
                                  {formatCpuUsage(worker.metrics.cpuUsage)}{" "}
                                  cores)
                                </div>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {formatMemory(worker.totalMemory)}
                            </div>
                            {worker.metrics?.metricsAvailable && (
                              <>
                                <div className="w-20">
                                  <Progress
                                    value={worker.metrics.memoryUtilization}
                                    className="h-2"
                                  />
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {worker.metrics.memoryUtilization.toFixed(1)}%
                                  (
                                  {formatMemoryUsage(
                                    worker.metrics.memoryUsage
                                  )}{" "}
                                  GB)
                                </div>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {formatStorage(worker.totalStorage)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="text-sm font-medium">
                              {worker.currentPods}/{worker.maxPods}
                            </div>
                            <div className="w-16">
                              <Progress
                                value={
                                  (worker.currentPods / worker.maxPods) * 100
                                }
                                className="h-2"
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium capitalize">
                              {worker.operatingSystem}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {worker.architecture}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getReadyBadgeVariant(worker.isReady)}>
                            {worker.isReady ? "Ready" : "Not Ready"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(worker.lastHeartbeat)}
                        </TableCell>
                      </TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48">
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(worker.id);
                        }}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add refresh metrics functionality if needed
                        }}
                        className="cursor-pointer"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Refresh Metrics
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Worker Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[1000px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Worker Node Details
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading worker details...
                </span>
              </div>
            </div>
          ) : selectedWorker ? (
            <div className="py-4">
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column - Basic Info */}
                <div className="col-span-4 space-y-4">
                  {/* Node Info */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Node Information
                    </Label>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Node Name
                        </span>
                        <p className="text-sm font-medium">
                          {selectedWorker.name}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Hostname
                        </span>
                        <p className="text-sm font-medium">
                          {selectedWorker.hostname}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          IP Address
                        </span>
                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {selectedWorker.ipAddress}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Status
                        </span>
                        <div className="mt-1">
                          <Badge
                            variant={getStatusBadgeVariant(
                              selectedWorker.status
                            )}
                          >
                            {selectedWorker.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Ready
                        </span>
                        <div className="mt-1">
                          <Badge
                            variant={getReadyBadgeVariant(
                              selectedWorker.isReady
                            )}
                          >
                            {selectedWorker.isReady ? "Ready" : "Not Ready"}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Schedulable
                        </span>
                        <div className="mt-1">
                          <Badge
                            variant={
                              selectedWorker.isSchedulable
                                ? "default"
                                : "secondary"
                            }
                          >
                            {selectedWorker.isSchedulable
                              ? "Schedulable"
                              : "Unschedulable"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Info */}
                  <div className="p-4 border rounded-lg bg-card">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      System Information
                    </Label>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Operating System
                        </span>
                        <p className="text-sm font-medium">
                          {selectedWorker.osImage}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Kernel Version
                        </span>
                        <p className="text-sm font-medium">
                          {selectedWorker.kernelVersion}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Architecture
                        </span>
                        <p className="text-sm font-medium">
                          {selectedWorker.architecture}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Container Runtime
                        </span>
                        <p className="text-sm font-medium">
                          {selectedWorker.containerRuntime}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Kubelet Version
                        </span>
                        <p className="text-sm font-medium">
                          {selectedWorker.kubeletVersion}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Column - Resources & Metrics */}
                <div className="col-span-4 space-y-4">
                  {/* Resource Capacity */}
                  <div className="p-4 border rounded-lg bg-card">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Resource Capacity
                    </Label>
                    <div className="mt-3 space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">
                            CPU
                          </span>
                          <span className="text-xs font-medium">
                            {selectedWorker.cpuCores} cores
                          </span>
                        </div>
                        {selectedWorker.metrics?.metricsAvailable && (
                          <>
                            <Progress
                              value={selectedWorker.metrics.cpuUtilization}
                              className="h-2"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {selectedWorker.metrics.cpuUtilization.toFixed(1)}
                              % used (
                              {formatCpuUsage(selectedWorker.metrics.cpuUsage)}{" "}
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
                            {formatMemory(selectedWorker.totalMemory)}
                          </span>
                        </div>
                        {selectedWorker.metrics?.metricsAvailable && (
                          <>
                            <Progress
                              value={selectedWorker.metrics.memoryUtilization}
                              className="h-2"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {selectedWorker.metrics.memoryUtilization.toFixed(
                                1
                              )}
                              % used (
                              {formatMemoryUsage(
                                selectedWorker.metrics.memoryUsage
                              )}{" "}
                              GB)
                            </div>
                          </>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">
                            Storage
                          </span>
                          <span className="text-xs font-medium">
                            {formatStorage(selectedWorker.totalStorage)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">
                            Pods
                          </span>
                          <span className="text-xs font-medium">
                            {selectedWorker.currentPods}/
                            {selectedWorker.maxPods}
                          </span>
                        </div>
                        <Progress
                          value={
                            (selectedWorker.currentPods /
                              selectedWorker.maxPods) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="p-4 border rounded-lg bg-card">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Timestamps
                    </Label>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Last Heartbeat
                        </span>
                        <p className="text-sm font-medium">
                          {formatDate(selectedWorker.lastHeartbeat)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Last Health Check
                        </span>
                        <p className="text-sm font-medium">
                          {formatDate(selectedWorker.lastHealthCheck)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Created At
                        </span>
                        <p className="text-sm font-medium">
                          {formatDate(selectedWorker.createdAt)}
                        </p>
                      </div>
                      {selectedWorker.metrics?.metricsTimestamp && (
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Metrics Updated
                          </span>
                          <p className="text-sm font-medium">
                            {formatDate(
                              selectedWorker.metrics.metricsTimestamp
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Conditions & Labels */}
                <div className="col-span-4 space-y-4">
                  {/* Node Conditions */}
                  {selectedWorker.liveData?.conditions && (
                    <div className="p-4 border rounded-lg bg-card">
                      <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Node Conditions
                      </Label>
                      <div className="mt-3 space-y-2">
                        {selectedWorker.liveData.conditions.map(
                          (condition, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-muted/30 rounded"
                            >
                              <div>
                                <div className="text-xs font-medium">
                                  {condition.type}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {condition.reason}
                                </div>
                              </div>
                              <Badge
                                variant={
                                  condition.status === "True"
                                    ? "default"
                                    : condition.status === "False"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {condition.status}
                              </Badge>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Labels */}
                  {selectedWorker.labels &&
                    Object.keys(selectedWorker.labels).length > 0 && (
                      <div className="p-4 border rounded-lg bg-card">
                        <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Labels
                        </Label>
                        <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
                          {Object.entries(selectedWorker.labels).map(
                            ([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="font-mono text-muted-foreground">
                                  {key}:
                                </span>
                                <span className="ml-1 font-mono">{value}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Taints */}
                  {selectedWorker.taints &&
                    selectedWorker.taints.length > 0 && (
                      <div className="p-4 border rounded-lg bg-card">
                        <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Taints
                        </Label>
                        <div className="mt-3 space-y-2">
                          {selectedWorker.taints.map((taint, index) => (
                            <div
                              key={index}
                              className="p-2 bg-muted/30 rounded"
                            >
                              <div className="text-xs font-medium">
                                {taint.key}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {taint.value} ({taint.effect})
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <p className="text-sm">No worker data available</p>
                <p className="text-xs mt-1">
                  Unable to load worker information.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
