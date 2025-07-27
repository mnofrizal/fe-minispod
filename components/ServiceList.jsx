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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import {
  Search,
  Eye,
  Settings,
  Users,
  Tag,
  Server,
  RefreshCw,
  Copy,
  Package,
  Power,
  PowerOff,
  Trash2,
  Plus,
  Edit,
} from "lucide-react";
import { toast } from "sonner";

export default function ServiceList() {
  const { data: session } = useSession();
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    variant: "",
    variantDisplayName: "",
    displayName: "",
    description: "",
    version: "latest",
    isActive: true,
    cpuRequest: "0.25",
    cpuLimit: "1",
    memRequest: "512Mi",
    memLimit: "1Gi",
    monthlyPrice: "0",
    dockerImage: "",
    containerPort: "80",
    category: "cms",
    tags: "",
    icon: "",
    features: "",
    sortOrder: "1",
    isDefaultVariant: false,
    availableQuota: "-1",
    volumeSize: "250Mi",
    volumeMountPath: "/data",
    volumeName: "",
    storageClass: "local-path",
    accessMode: "ReadWriteOnce",
    environmentVars: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    variant: "",
    variantDisplayName: "",
    displayName: "",
    description: "",
    version: "latest",
    isActive: true,
    cpuRequest: "0.25",
    cpuLimit: "1",
    memRequest: "512Mi",
    memLimit: "1Gi",
    monthlyPrice: "0",
    dockerImage: "",
    containerPort: "80",
    category: "cms",
    tags: "",
    icon: "",
    features: "",
    sortOrder: "1",
    isDefaultVariant: false,
    availableQuota: "-1",
    volumeSize: "250Mi",
    volumeMountPath: "/data",
    volumeName: "",
    storageClass: "local-path",
    accessMode: "ReadWriteOnce",
    environmentVars: "",
  });

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
          setPagination(data.data.pagination);
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
    return numPrice === 0
      ? "Free"
      : new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(numPrice);
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

  const getCategoryBadgeVariant = (category) => {
    switch (category) {
      case "cms":
        return "default";
      case "automation":
        return "secondary";
      case "database":
        return "destructive";
      case "development":
        return "outline";
      default:
        return "outline";
    }
  };

  const getVariantBadgeVariant = (variant) => {
    switch (variant) {
      case "free":
        return "secondary";
      case "basic":
        return "outline";
      case "pro":
        return "default";
      case "enterprise":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Filter services based on search term
  const filteredServices = services.filter(
    (service) =>
      service.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.variant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Fetch service details
  const fetchServiceDetails = async (serviceId) => {
    if (!session?.accessToken) return;

    try {
      setDetailLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/v1/services/admin/${serviceId}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSelectedService(data.data);
        setIsDetailOpen(true);
      } else {
        toast.error(data.message || "Failed to fetch service details", {
          style: {
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          },
        });
      }
    } catch (err) {
      toast.error("An error occurred while fetching service details", {
        style: {
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
        },
      });
      console.error("Error fetching service details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle row click
  const handleRowClick = (serviceId) => {
    fetchServiceDetails(serviceId);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Toggle service status
  const handleToggleStatus = async (serviceId, currentStatus) => {
    if (!session?.accessToken) return;

    try {
      setIsActionLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/v1/services/${serviceId}/toggle-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Update the services list
        setServices((prevServices) =>
          prevServices.map((service) =>
            service.id === serviceId
              ? { ...service, isActive: !service.isActive }
              : service
          )
        );

        // Update selected service if detail is open
        if (selectedService && selectedService.id === serviceId) {
          setSelectedService((prev) => ({
            ...prev,
            isActive: !prev.isActive,
          }));
        }

        toast.success(
          `Service ${currentStatus ? "deactivated" : "activated"} successfully.`
        );
      } else {
        toast.error(data.message || "Failed to toggle service status", {
          style: {
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          },
        });
      }
    } catch (err) {
      toast.error("An error occurred while toggling service status", {
        style: {
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
        },
      });
      console.error("Error toggling service status:", err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete service
  const handleDeleteService = async (serviceId, serviceName) => {
    if (!session?.accessToken) return;

    if (
      !confirm(
        `Are you sure you want to delete the service "${serviceName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setIsActionLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/v1/services/${serviceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Remove service from the list
        setServices((prevServices) =>
          prevServices.filter((service) => service.id !== serviceId)
        );

        // Update pagination count
        setPagination((prev) =>
          prev
            ? {
                ...prev,
                totalCount: prev.totalCount - 1,
              }
            : null
        );

        // Close detail dialog if this service was selected
        if (selectedService && selectedService.id === serviceId) {
          setIsDetailOpen(false);
          setSelectedService(null);
        }

        toast.success(
          `Service "${serviceName}" has been deleted successfully.`
        );
      } else {
        toast.error(data.message || "Failed to delete service", {
          style: {
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          },
        });
      }
    } catch (err) {
      toast.error("An error occurred while deleting service", {
        style: {
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
        },
      });
      console.error("Error deleting service:", err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Create new service
  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!session?.accessToken) return;

    try {
      setIsCreating(true);

      // Parse tags and features from comma-separated strings
      const tags = createForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const features = createForm.features
        .split(",")
        .map((feature) => feature.trim())
        .filter((feature) => feature.length > 0);

      // Parse environment variables from JSON string
      let environmentVars = {};
      if (createForm.environmentVars.trim()) {
        try {
          environmentVars = JSON.parse(createForm.environmentVars);
        } catch (err) {
          toast.error("Invalid JSON format for environment variables", {
            style: {
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#dc2626",
            },
          });
          return;
        }
      }

      const serviceData = {
        ...createForm,
        monthlyPrice: parseFloat(createForm.monthlyPrice),
        containerPort: parseInt(createForm.containerPort),
        sortOrder: parseInt(createForm.sortOrder),
        availableQuota: parseInt(createForm.availableQuota),
        tags,
        features,
        environmentVars,
      };

      const response = await fetch("http://localhost:3000/api/v1/services", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh the services list
        await refreshServices();

        // Reset form and close dialog
        setCreateForm({
          name: "",
          variant: "",
          variantDisplayName: "",
          displayName: "",
          description: "",
          version: "latest",
          isActive: true,
          cpuRequest: "0.25",
          cpuLimit: "1",
          memRequest: "512Mi",
          memLimit: "1Gi",
          monthlyPrice: "0",
          dockerImage: "",
          containerPort: "80",
          category: "cms",
          tags: "",
          icon: "",
          features: "",
          sortOrder: "1",
          isDefaultVariant: false,
          availableQuota: "-1",
          volumeSize: "250Mi",
          volumeMountPath: "/data",
          volumeName: "",
          storageClass: "local-path",
          accessMode: "ReadWriteOnce",
          environmentVars: "",
        });
        setIsCreateDialogOpen(false);

        toast.success(
          `Service "${createForm.displayName}" has been created successfully.`
        );
      } else {
        toast.error(data.message || "Failed to create service", {
          style: {
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          },
        });
      }
    } catch (err) {
      toast.error("An error occurred while creating service", {
        style: {
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
        },
      });
      console.error("Error creating service:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleFormChange = (field, value) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Open edit dialog and populate form
  const handleEditService = (service) => {
    // Convert arrays back to comma-separated strings for form
    const tagsString = service.tags ? service.tags.join(", ") : "";
    const featuresString = service.features ? service.features.join(", ") : "";
    const envVarsString = service.environmentVars
      ? JSON.stringify(service.environmentVars, null, 2)
      : "";

    setEditForm({
      name: service.name || "",
      variant: service.variant || "",
      variantDisplayName: service.variantDisplayName || "",
      displayName: service.displayName || "",
      description: service.description || "",
      version: service.version || "latest",
      isActive: service.isActive || false,
      cpuRequest: service.cpuRequest || "0.25",
      cpuLimit: service.cpuLimit || "1",
      memRequest: service.memRequest || "512Mi",
      memLimit: service.memLimit || "1Gi",
      monthlyPrice: service.monthlyPrice?.toString() || "0",
      dockerImage: service.dockerImage || "",
      containerPort: service.containerPort?.toString() || "80",
      category: service.category || "cms",
      tags: tagsString,
      icon: service.icon || "",
      features: featuresString,
      sortOrder: service.sortOrder?.toString() || "1",
      isDefaultVariant: service.isDefaultVariant || false,
      availableQuota: service.availableQuota?.toString() || "-1",
      volumeSize: service.volumeSize || "250Mi",
      volumeMountPath: service.volumeMountPath || "/data",
      volumeName: service.volumeName || "",
      storageClass: service.storageClass || "local-path",
      accessMode: service.accessMode || "ReadWriteOnce",
      environmentVars: envVarsString,
    });

    setEditingService(service);
    setIsEditDialogOpen(true);
  };

  // Handle edit service submission
  const handleUpdateService = async (e) => {
    e.preventDefault();
    if (!session?.accessToken || !editingService) return;

    try {
      setIsEditing(true);

      // Parse tags and features from comma-separated strings
      const tags = editForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const features = editForm.features
        .split(",")
        .map((feature) => feature.trim())
        .filter((feature) => feature.length > 0);

      // Parse environment variables from JSON string
      let environmentVars = {};
      if (editForm.environmentVars.trim()) {
        try {
          environmentVars = JSON.parse(editForm.environmentVars);
        } catch (err) {
          toast.error("Invalid JSON format for environment variables", {
            style: {
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#dc2626",
            },
          });
          return;
        }
      }

      const serviceData = {
        ...editForm,
        monthlyPrice: parseFloat(editForm.monthlyPrice),
        containerPort: parseInt(editForm.containerPort),
        sortOrder: parseInt(editForm.sortOrder),
        availableQuota: parseInt(editForm.availableQuota),
        tags,
        features,
        environmentVars,
      };

      const response = await fetch(
        `http://localhost:3000/api/v1/services/${editingService.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(serviceData),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Update the services list
        setServices((prevServices) =>
          prevServices.map((service) =>
            service.id === editingService.id
              ? { ...service, ...data.data }
              : service
          )
        );

        // Update selected service if detail is open
        if (selectedService && selectedService.id === editingService.id) {
          setSelectedService(data.data);
        }

        // Close dialog and reset form
        setIsEditDialogOpen(false);
        setEditingService(null);

        toast.success(
          `Service "${editForm.displayName}" has been updated successfully.`
        );
      } else {
        toast.error(data.message || "Failed to update service", {
          style: {
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          },
        });
      }
    } catch (err) {
      toast.error("An error occurred while updating service", {
        style: {
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
        },
      });
      console.error("Error updating service:", err);
    } finally {
      setIsEditing(false);
    }
  };

  // Refresh services
  const refreshServices = async () => {
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
        setPagination(data.data.pagination);
        toast.success("Services refreshed successfully!");
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Services
          </CardTitle>
          <CardDescription>Loading services...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading services...</span>
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
            <Package className="h-5 w-5" />
            Services
          </CardTitle>
          <CardDescription>Error loading services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">
              Error: {error}
            </p>
            <Button onClick={refreshServices} variant="outline">
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Services
              </CardTitle>
              <CardDescription>
                Available services and their configurations
                {pagination && (
                  <span className="ml-2">
                    ({pagination.totalCount} total services)
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Service
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button onClick={refreshServices} variant="outline" size="sm">
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
                placeholder="Search services by name, description, category, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          {filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-2">
                <Search className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No services found matching your search."
                    : "No services available."}
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
                    <TableHead>Service</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Resources</TableHead>
                    <TableHead>Quota</TableHead>
                    <TableHead>Subscriptions</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <ContextMenu key={service.id}>
                      <ContextMenuTrigger asChild>
                        <TableRow
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(service.id)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {service.displayName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {service.name}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                                {service.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getCategoryBadgeVariant(
                                service.category
                              )}
                              className="capitalize"
                            >
                              {service.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  service.isActive
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <span className="text-sm">
                                {service.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getVariantBadgeVariant(service.variant)}
                            >
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
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <Badge variant="outline">
                                {service._count.subscriptions}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-32">
                              {service.tags?.slice(0, 2).map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {service.tags?.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{service.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDate(service.createdAt)}
                          </TableCell>
                        </TableRow>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-56">
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(service.id);
                          }}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditService(service);
                          }}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Service
                        </ContextMenuItem>
                        <ContextMenuSeparator />

                        {/* Service Status Actions */}
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(service.id, service.isActive);
                          }}
                          className="cursor-pointer"
                          disabled={isActionLoading}
                        >
                          {service.isActive ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-2" />
                              Deactivate Service
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4 mr-2" />
                              Activate Service
                            </>
                          )}
                        </ContextMenuItem>

                        <ContextMenuSeparator />

                        {/* Copy Actions */}
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(service.dockerImage);
                          }}
                          className="cursor-pointer"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Docker Image
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(service.id);
                          }}
                          className="cursor-pointer"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Service ID
                        </ContextMenuItem>

                        <ContextMenuSeparator />

                        {/* Delete Action */}
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteService(
                              service.id,
                              service.displayName
                            );
                          }}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                          disabled={isActionLoading}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Service
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Info */}
          {pagination && pagination.totalCount > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredServices.length} of {pagination.totalCount}{" "}
                services
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[1000px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Service Details
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading service details...
                </span>
              </div>
            </div>
          ) : selectedService ? (
            <div className="py-4">
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column - Basic Info */}
                <div className="col-span-4 space-y-4">
                  {/* Service Info */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Service Information
                    </Label>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Display Name
                        </span>
                        <p className="text-sm font-medium">
                          {selectedService.displayName}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Service Name
                        </span>
                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {selectedService.name}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Description
                        </span>
                        <p className="text-sm text-muted-foreground">
                          {selectedService.description}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Category
                        </span>
                        <div className="mt-1">
                          <Badge
                            variant={getCategoryBadgeVariant(
                              selectedService.category
                            )}
                            className="capitalize"
                          >
                            {selectedService.category}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Status
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              selectedService.isActive
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <span className="text-sm">
                            {selectedService.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Variant */}
                  <div className="p-4 border rounded-lg bg-card">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Pricing & Variant
                    </Label>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Variant
                        </span>
                        <div className="mt-1">
                          <Badge
                            variant={getVariantBadgeVariant(
                              selectedService.variant
                            )}
                          >
                            {selectedService.variantDisplayName}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Monthly Price
                        </span>
                        <p className="text-lg font-semibold mt-1">
                          {formatPrice(selectedService.monthlyPrice)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Available Quota
                        </span>
                        <div className="mt-1">
                          <Badge
                            variant={
                              selectedService.availableQuota === 0
                                ? "destructive"
                                : selectedService.availableQuota === -1
                                ? "secondary"
                                : "default"
                            }
                          >
                            {selectedService.availableQuota === -1
                              ? "Unlimited"
                              : selectedService.availableQuota === 0
                              ? "Out of Quota"
                              : selectedService.availableQuota}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Sort Order
                        </span>
                        <p className="text-sm font-medium">
                          {selectedService.sortOrder}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Default Variant
                        </span>
                        <p className="text-sm font-medium">
                          {selectedService.isDefaultVariant ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Column - Resources & Technical */}
                <div className="col-span-4 space-y-4">
                  {/* Resource Requirements */}
                  <div className="p-4 border rounded-lg bg-card">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Resource Requirements
                    </Label>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          CPU
                        </span>
                        <div className="text-sm font-medium">
                          Request: {selectedService.cpuRequest} cores
                        </div>
                        <div className="text-sm font-medium">
                          Limit: {selectedService.cpuLimit} cores
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Memory
                        </span>
                        <div className="text-sm font-medium">
                          Request: {selectedService.memRequest}
                        </div>
                        <div className="text-sm font-medium">
                          Limit: {selectedService.memLimit}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="p-4 border rounded-lg bg-card">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Technical Details
                    </Label>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Docker Image
                        </span>
                        <div className="mt-1 flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all">
                            {selectedService.dockerImage}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              copyToClipboard(selectedService.dockerImage)
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Container Port
                        </span>
                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">
                          {selectedService.containerPort}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Version
                        </span>
                        <p className="text-sm font-medium">
                          {selectedService.version}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="p-4 border rounded-lg bg-card">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Statistics
                    </Label>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Active Subscriptions
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="h-4 w-4" />
                          <span className="text-lg font-semibold">
                            {selectedService._count.subscriptions}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Created At
                        </span>
                        <p className="text-sm font-medium">
                          {formatDate(selectedService.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Last Updated
                        </span>
                        <p className="text-sm font-medium">
                          {formatDate(selectedService.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Features & Environment */}
                <div className="col-span-4 space-y-4">
                  {/* Features */}
                  {selectedService.features &&
                    selectedService.features.length > 0 && (
                      <div className="p-4 border rounded-lg bg-card">
                        <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Features
                        </Label>
                        <div className="mt-3 space-y-2">
                          {selectedService.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Tags */}
                  {selectedService.tags && selectedService.tags.length > 0 && (
                    <div className="p-4 border rounded-lg bg-card">
                      <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Tags
                      </Label>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedService.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Environment Variables */}
                  {selectedService.environmentVars &&
                    Object.keys(selectedService.environmentVars).length > 0 && (
                      <div className="p-4 border rounded-lg bg-card">
                        <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Environment Variables
                        </Label>
                        <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                          {Object.entries(selectedService.environmentVars).map(
                            ([key, value]) => (
                              <div key={key} className="text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-muted-foreground">
                                    {key}:
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      copyToClipboard(`${key}=${value}`)
                                    }
                                    className="h-6 w-6 p-0"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded block mt-1 break-all">
                                  {value}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Icon */}
                  {selectedService.icon && (
                    <div className="p-4 border rounded-lg bg-card">
                      <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Icon
                      </Label>
                      <div className="mt-3">
                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {selectedService.icon}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <p className="text-sm">No service data available</p>
                <p className="text-xs mt-1">
                  Unable to load service information.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Service Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle>Create New Service</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Add a new service to the platform with all configuration details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateService} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Service Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., n8n, wordpress"
                    value={createForm.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variant" className="text-sm font-medium">
                    Variant *
                  </Label>
                  <Input
                    id="variant"
                    placeholder="e.g., basic, pro, enterprise"
                    value={createForm.variant}
                    onChange={(e) =>
                      handleFormChange("variant", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="variantDisplayName"
                    className="text-sm font-medium"
                  >
                    Variant Display Name *
                  </Label>
                  <Input
                    id="variantDisplayName"
                    placeholder="e.g., Basic, Pro, Enterprise"
                    value={createForm.variantDisplayName}
                    onChange={(e) =>
                      handleFormChange("variantDisplayName", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-sm font-medium">
                    Display Name *
                  </Label>
                  <Input
                    id="displayName"
                    placeholder="e.g., N8N Workflow Automation - Basic"
                    value={createForm.displayName}
                    onChange={(e) =>
                      handleFormChange("displayName", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Service description..."
                    value={createForm.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    required
                    rows={3}
                  />
                </div>
              </div>

              {/* Technical Configuration */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dockerImage" className="text-sm font-medium">
                    Docker Image *
                  </Label>
                  <Input
                    id="dockerImage"
                    placeholder="e.g., n8nio/n8n:latest"
                    value={createForm.dockerImage}
                    onChange={(e) =>
                      handleFormChange("dockerImage", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="containerPort"
                    className="text-sm font-medium"
                  >
                    Container Port *
                  </Label>
                  <Input
                    id="containerPort"
                    type="number"
                    placeholder="5678"
                    value={createForm.containerPort}
                    onChange={(e) =>
                      handleFormChange("containerPort", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Category *
                  </Label>
                  <Select
                    value={createForm.category}
                    onValueChange={(value) =>
                      handleFormChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cms">CMS</SelectItem>
                      <SelectItem value="automation">Automation</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version" className="text-sm font-medium">
                    Version
                  </Label>
                  <Input
                    id="version"
                    placeholder="latest"
                    value={createForm.version}
                    onChange={(e) =>
                      handleFormChange("version", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyPrice" className="text-sm font-medium">
                    Monthly Price (IDR)
                  </Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    placeholder="0"
                    value={createForm.monthlyPrice}
                    onChange={(e) =>
                      handleFormChange("monthlyPrice", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="availableQuota"
                    className="text-sm font-medium"
                  >
                    Available Quota
                  </Label>
                  <Input
                    id="availableQuota"
                    type="number"
                    placeholder="-1 for unlimited, 0 for none, positive number for limit"
                    value={createForm.availableQuota}
                    onChange={(e) =>
                      handleFormChange("availableQuota", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    -1 = Unlimited, 0 = Out of quota, positive number =
                    Available quota
                  </p>
                </div>
              </div>
            </div>

            {/* Resource Configuration */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Resource Configuration
              </Label>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpuRequest" className="text-sm font-medium">
                    CPU Request
                  </Label>
                  <Input
                    id="cpuRequest"
                    placeholder="0.25"
                    value={createForm.cpuRequest}
                    onChange={(e) =>
                      handleFormChange("cpuRequest", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpuLimit" className="text-sm font-medium">
                    CPU Limit
                  </Label>
                  <Input
                    id="cpuLimit"
                    placeholder="1"
                    value={createForm.cpuLimit}
                    onChange={(e) =>
                      handleFormChange("cpuLimit", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memRequest" className="text-sm font-medium">
                    Memory Request
                  </Label>
                  <Input
                    id="memRequest"
                    placeholder="512Mi"
                    value={createForm.memRequest}
                    onChange={(e) =>
                      handleFormChange("memRequest", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memLimit" className="text-sm font-medium">
                    Memory Limit
                  </Label>
                  <Input
                    id="memLimit"
                    placeholder="1Gi"
                    value={createForm.memLimit}
                    onChange={(e) =>
                      handleFormChange("memLimit", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Storage Configuration */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Storage Configuration
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volumeSize" className="text-sm font-medium">
                    Volume Size
                  </Label>
                  <Input
                    id="volumeSize"
                    placeholder="250Mi"
                    value={createForm.volumeSize}
                    onChange={(e) =>
                      handleFormChange("volumeSize", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="volumeMountPath"
                    className="text-sm font-medium"
                  >
                    Mount Path
                  </Label>
                  <Input
                    id="volumeMountPath"
                    placeholder="/data"
                    value={createForm.volumeMountPath}
                    onChange={(e) =>
                      handleFormChange("volumeMountPath", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volumeName" className="text-sm font-medium">
                    Volume Name
                  </Label>
                  <Input
                    id="volumeName"
                    placeholder="service-data"
                    value={createForm.volumeName}
                    onChange={(e) =>
                      handleFormChange("volumeName", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Additional Configuration */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Additional Configuration
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-sm font-medium">
                    Tags (comma-separated)
                  </Label>
                  <Input
                    id="tags"
                    placeholder="workflow, automation, integration"
                    value={createForm.tags}
                    onChange={(e) => handleFormChange("tags", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features" className="text-sm font-medium">
                    Features (comma-separated)
                  </Label>
                  <Input
                    id="features"
                    placeholder="Basic workflows, Community support"
                    value={createForm.features}
                    onChange={(e) =>
                      handleFormChange("features", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon" className="text-sm font-medium">
                    Icon Filename
                  </Label>
                  <Input
                    id="icon"
                    placeholder="service-icon.svg"
                    value={createForm.icon}
                    onChange={(e) => handleFormChange("icon", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sortOrder" className="text-sm font-medium">
                    Sort Order
                  </Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    placeholder="1"
                    value={createForm.sortOrder}
                    onChange={(e) =>
                      handleFormChange("sortOrder", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={createForm.isActive}
                  onCheckedChange={(checked) =>
                    handleFormChange("isActive", checked)
                  }
                />
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Active Service
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefaultVariant"
                  checked={createForm.isDefaultVariant}
                  onCheckedChange={(checked) =>
                    handleFormChange("isDefaultVariant", checked)
                  }
                />
                <Label
                  htmlFor="isDefaultVariant"
                  className="text-sm font-medium"
                >
                  Default Variant
                </Label>
              </div>
            </div>

            {/* Environment Variables */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Environment Variables (JSON Format)
              </Label>
              <Textarea
                placeholder='{"N8N_BASIC_AUTH_ACTIVE": "true", "N8N_BASIC_AUTH_USER": "admin"}'
                value={createForm.environmentVars}
                onChange={(e) =>
                  handleFormChange("environmentVars", e.target.value)
                }
                rows={4}
                className="font-mono text-xs"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Service
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Update service configuration and settings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateService} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-sm font-medium">
                    Service Name *
                  </Label>
                  <Input
                    id="edit-name"
                    placeholder="e.g., n8n, wordpress"
                    value={editForm.name}
                    onChange={(e) =>
                      handleEditFormChange("name", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-variant" className="text-sm font-medium">
                    Variant *
                  </Label>
                  <Input
                    id="edit-variant"
                    placeholder="e.g., basic, pro, enterprise"
                    value={editForm.variant}
                    onChange={(e) =>
                      handleEditFormChange("variant", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-variantDisplayName"
                    className="text-sm font-medium"
                  >
                    Variant Display Name *
                  </Label>
                  <Input
                    id="edit-variantDisplayName"
                    placeholder="e.g., Basic, Pro, Enterprise"
                    value={editForm.variantDisplayName}
                    onChange={(e) =>
                      handleEditFormChange("variantDisplayName", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-displayName"
                    className="text-sm font-medium"
                  >
                    Display Name *
                  </Label>
                  <Input
                    id="edit-displayName"
                    placeholder="e.g., N8N Workflow Automation - Basic"
                    value={editForm.displayName}
                    onChange={(e) =>
                      handleEditFormChange("displayName", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-description"
                    className="text-sm font-medium"
                  >
                    Description *
                  </Label>
                  <Textarea
                    id="edit-description"
                    placeholder="Service description..."
                    value={editForm.description}
                    onChange={(e) =>
                      handleEditFormChange("description", e.target.value)
                    }
                    required
                    rows={3}
                  />
                </div>
              </div>

              {/* Technical Configuration */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-dockerImage"
                    className="text-sm font-medium"
                  >
                    Docker Image *
                  </Label>
                  <Input
                    id="edit-dockerImage"
                    placeholder="e.g., n8nio/n8n:latest"
                    value={editForm.dockerImage}
                    onChange={(e) =>
                      handleEditFormChange("dockerImage", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-containerPort"
                    className="text-sm font-medium"
                  >
                    Container Port *
                  </Label>
                  <Input
                    id="edit-containerPort"
                    type="number"
                    placeholder="5678"
                    value={editForm.containerPort}
                    onChange={(e) =>
                      handleEditFormChange("containerPort", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-category"
                    className="text-sm font-medium"
                  >
                    Category *
                  </Label>
                  <Select
                    value={editForm.category}
                    onValueChange={(value) =>
                      handleEditFormChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cms">CMS</SelectItem>
                      <SelectItem value="automation">Automation</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-version" className="text-sm font-medium">
                    Version
                  </Label>
                  <Input
                    id="edit-version"
                    placeholder="latest"
                    value={editForm.version}
                    onChange={(e) =>
                      handleEditFormChange("version", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-monthlyPrice"
                    className="text-sm font-medium"
                  >
                    Monthly Price (IDR)
                  </Label>
                  <Input
                    id="edit-monthlyPrice"
                    type="number"
                    placeholder="0"
                    value={editForm.monthlyPrice}
                    onChange={(e) =>
                      handleEditFormChange("monthlyPrice", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-availableQuota"
                    className="text-sm font-medium"
                  >
                    Available Quota
                  </Label>
                  <Input
                    id="edit-availableQuota"
                    type="number"
                    placeholder="-1 for unlimited, 0 for none, positive number for limit"
                    value={editForm.availableQuota}
                    onChange={(e) =>
                      handleEditFormChange("availableQuota", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    -1 = Unlimited, 0 = Out of quota, positive number =
                    Available quota
                  </p>
                </div>
              </div>
            </div>

            {/* Resource Configuration */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Resource Configuration
              </Label>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-cpuRequest"
                    className="text-sm font-medium"
                  >
                    CPU Request
                  </Label>
                  <Input
                    id="edit-cpuRequest"
                    placeholder="0.25"
                    value={editForm.cpuRequest}
                    onChange={(e) =>
                      handleEditFormChange("cpuRequest", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-cpuLimit"
                    className="text-sm font-medium"
                  >
                    CPU Limit
                  </Label>
                  <Input
                    id="edit-cpuLimit"
                    placeholder="1"
                    value={editForm.cpuLimit}
                    onChange={(e) =>
                      handleEditFormChange("cpuLimit", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-memRequest"
                    className="text-sm font-medium"
                  >
                    Memory Request
                  </Label>
                  <Input
                    id="edit-memRequest"
                    placeholder="512Mi"
                    value={editForm.memRequest}
                    onChange={(e) =>
                      handleEditFormChange("memRequest", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-memLimit"
                    className="text-sm font-medium"
                  >
                    Memory Limit
                  </Label>
                  <Input
                    id="edit-memLimit"
                    placeholder="1Gi"
                    value={editForm.memLimit}
                    onChange={(e) =>
                      handleEditFormChange("memLimit", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Storage Configuration */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Storage Configuration
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-volumeSize"
                    className="text-sm font-medium"
                  >
                    Volume Size
                  </Label>
                  <Input
                    id="edit-volumeSize"
                    placeholder="250Mi"
                    value={editForm.volumeSize}
                    onChange={(e) =>
                      handleEditFormChange("volumeSize", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-volumeMountPath"
                    className="text-sm font-medium"
                  >
                    Mount Path
                  </Label>
                  <Input
                    id="edit-volumeMountPath"
                    placeholder="/data"
                    value={editForm.volumeMountPath}
                    onChange={(e) =>
                      handleEditFormChange("volumeMountPath", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-volumeName"
                    className="text-sm font-medium"
                  >
                    Volume Name
                  </Label>
                  <Input
                    id="edit-volumeName"
                    placeholder="service-data"
                    value={editForm.volumeName}
                    onChange={(e) =>
                      handleEditFormChange("volumeName", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Additional Configuration */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Additional Configuration
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-tags" className="text-sm font-medium">
                    Tags (comma-separated)
                  </Label>
                  <Input
                    id="edit-tags"
                    placeholder="workflow, automation, integration"
                    value={editForm.tags}
                    onChange={(e) =>
                      handleEditFormChange("tags", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-features"
                    className="text-sm font-medium"
                  >
                    Features (comma-separated)
                  </Label>
                  <Input
                    id="edit-features"
                    placeholder="Basic workflows, Community support"
                    value={editForm.features}
                    onChange={(e) =>
                      handleEditFormChange("features", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-icon" className="text-sm font-medium">
                    Icon Filename
                  </Label>
                  <Input
                    id="edit-icon"
                    placeholder="service-icon.svg"
                    value={editForm.icon}
                    onChange={(e) =>
                      handleEditFormChange("icon", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-sortOrder"
                    className="text-sm font-medium"
                  >
                    Sort Order
                  </Label>
                  <Input
                    id="edit-sortOrder"
                    type="number"
                    placeholder="1"
                    value={editForm.sortOrder}
                    onChange={(e) =>
                      handleEditFormChange("sortOrder", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={editForm.isActive}
                  onCheckedChange={(checked) =>
                    handleEditFormChange("isActive", checked)
                  }
                />
                <Label htmlFor="edit-isActive" className="text-sm font-medium">
                  Active Service
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isDefaultVariant"
                  checked={editForm.isDefaultVariant}
                  onCheckedChange={(checked) =>
                    handleEditFormChange("isDefaultVariant", checked)
                  }
                />
                <Label
                  htmlFor="edit-isDefaultVariant"
                  className="text-sm font-medium"
                >
                  Default Variant
                </Label>
              </div>
            </div>

            {/* Environment Variables */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Environment Variables (JSON Format)
              </Label>
              <Textarea
                placeholder='{"N8N_BASIC_AUTH_ACTIVE": "true", "N8N_BASIC_AUTH_USER": "admin"}'
                value={editForm.environmentVars}
                onChange={(e) =>
                  handleEditFormChange("environmentVars", e.target.value)
                }
                rows={4}
                className="font-mono text-xs"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isEditing}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isEditing}>
                {isEditing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Service
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
