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

export default function ServiceList() {
  const { data: session } = useSession();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:3000/api/v1/services/admin",
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setServices(data.data.services);
        } else {
          setError(data.message || "Failed to fetch services");
        }
      } catch (err) {
        setError("An error occurred while fetching services");
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [session]);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return numPrice === 0 ? "Free" : `Rp ${numPrice.toLocaleString()}/month`;
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
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>Loading services...</CardDescription>
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
          <CardTitle>Services</CardTitle>
          <CardDescription>Error loading services</CardDescription>
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
        <CardTitle>Services</CardTitle>
        <CardDescription>
          Available services and their configurations
          <span className="ml-2">({services.length} services)</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">No services available</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>Quota</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Subscriptions</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{service.displayName}</div>
                      <div className="text-sm text-gray-500">
                        {service.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div
                      className="text-sm text-gray-600 truncate"
                      title={service.description}
                    >
                      {service.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          service.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-sm">
                        {service.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {service.variantDisplayName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        parseFloat(service.monthlyPrice) === 0
                          ? "secondary"
                          : "default"
                      }
                    >
                      {formatPrice(service.monthlyPrice)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <div>
                        CPU: {service.cpuRequest}/{service.cpuLimit}
                      </div>
                      <div>
                        RAM: {service.memRequest}/{service.memLimit}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        service.availableQuota === 0
                          ? "destructive"
                          : service.availableQuota === -1
                          ? "secondary"
                          : "default"
                      }
                    >
                      {service.availableQuota === -1
                        ? "Unlimited"
                        : service.availableQuota === 0
                        ? "Out of Quota"
                        : service.availableQuota}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {service.containerPort}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {service._count.subscriptions}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(service.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
