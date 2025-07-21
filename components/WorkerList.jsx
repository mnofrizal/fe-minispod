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

export default function WorkerList() {
  const { data: session } = useSession();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/v1/workers", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        });

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const parseMemoryValue = (memoryStr) => {
    if (!memoryStr) return 0;
    const value = parseFloat(memoryStr);
    if (memoryStr.includes("Gi")) return value;
    if (memoryStr.includes("Mi")) return value / 1024;
    return value;
  };

  const parseStorageValue = (storageStr) => {
    if (!storageStr) return 0;
    const value = parseFloat(storageStr);
    if (storageStr.includes("Ti")) return value * 1024;
    if (storageStr.includes("Gi")) return value;
    return value;
  };

  const calculateCpuUsage = (allocated, total) => {
    const allocatedNum = parseFloat(allocated) || 0;
    return total > 0 ? (allocatedNum / total) * 100 : 0;
  };

  const calculateMemoryUsage = (allocated, total) => {
    const allocatedNum = parseMemoryValue(allocated) || 0;
    const totalNum = parseMemoryValue(total);
    return totalNum > 0 ? (allocatedNum / totalNum) * 100 : 0;
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
    <Card>
      <CardHeader>
        <CardTitle>Worker Nodes</CardTitle>
        <CardDescription>
          Manage cluster worker nodes and their resources
          {pagination && (
            <span className="ml-2">({pagination.total} total nodes)</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Node</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>Memory</TableHead>
              <TableHead>Storage</TableHead>
              <TableHead>Pods</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Ready</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((worker) => (
              <TableRow key={worker.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{worker.name}</div>
                    <div className="text-xs text-gray-500">
                      {worker.cpuArchitecture}
                    </div>
                    <div className="text-xs text-gray-500">
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
                    <div className="w-16">
                      <Progress
                        value={calculateCpuUsage(
                          worker.allocatedCPU,
                          worker.cpuCores
                        )}
                        className="h-1"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {calculateCpuUsage(
                          worker.allocatedCPU,
                          worker.cpuCores
                        ).toFixed(0)}
                        % used
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {worker.totalMemory}
                    </div>
                    <div className="w-16">
                      <Progress
                        value={calculateMemoryUsage(
                          worker.allocatedMemory,
                          worker.totalMemory
                        )}
                        className="h-1"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {calculateMemoryUsage(
                          worker.allocatedMemory,
                          worker.totalMemory
                        ).toFixed(0)}
                        % used
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">
                    {worker.totalStorage}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {worker.currentPods}/{worker.maxPods}
                    </div>
                    <div className="w-16">
                      <Progress
                        value={(worker.currentPods / worker.maxPods) * 100}
                        className="h-1"
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {worker.labels?.["topology.kubernetes.io/zone"] || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        worker.isReady ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-sm">
                      {worker.isReady ? "Ready" : "Not Ready"}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
