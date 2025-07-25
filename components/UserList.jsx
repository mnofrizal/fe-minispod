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
  DialogFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Trash2, UserCheck, UserX, Eye } from "lucide-react";
import { toast } from "sonner";

export default function UserList() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:3000/api/v1/admin/users",
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setUsers(data.data.users);
          setPagination(data.data.pagination);
        } else {
          setError(data.message || "Failed to fetch users");
        }
      } catch (err) {
        setError("An error occurred while fetching users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [session]);

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "ADMINISTRATOR":
        return "destructive";
      case "USER":
        return "secondary";
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!session?.accessToken) return;

    try {
      setIsCreating(true);
      const response = await fetch("http://localhost:3000/api/v1/admin/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh the users list
        const usersResponse = await fetch(
          "http://localhost:3000/api/v1/admin/users",
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const usersData = await usersResponse.json();
        if (usersResponse.ok && usersData.success) {
          setUsers(usersData.data.users);
          setPagination(usersData.data.pagination);
        }

        // Reset form and close dialog
        setCreateForm({
          name: "",
          email: "",
          password: "",
          role: "USER",
        });
        setIsCreateDialogOpen(false);

        // Show success toast
        toast.success(
          `User "${createForm.name}" has been created successfully.`
        );
      } else {
        // Show error toast
        toast.error(data.message || "Failed to create user", {
          style: {
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          },
        });
      }
    } catch (err) {
      // Show error toast
      toast.error("An error occurred while creating user", {
        style: {
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
        },
      });
      console.error("Error creating user:", err);
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

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch user details
  const fetchUserDetails = async (userId) => {
    if (!session?.accessToken) return;

    try {
      setUserDetailLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/v1/admin/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSelectedUser(data.data);
        setIsUserDetailOpen(true);
      } else {
        toast.error(data.message || "Failed to fetch user details", {
          style: {
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          },
        });
      }
    } catch (err) {
      toast.error("An error occurred while fetching user details", {
        style: {
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
        },
      });
      console.error("Error fetching user details:", err);
    } finally {
      setUserDetailLoading(false);
    }
  };

  // Handle row click
  const handleRowClick = (userId) => {
    fetchUserDetails(userId);
  };

  // Toggle user status
  const handleToggleStatus = async () => {
    if (!session?.accessToken || !selectedUser) return;

    try {
      setIsToggling(true);
      const response = await fetch(
        `http://localhost:3000/api/v1/admin/users/${selectedUser.id}/toggle-status`,
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
        // Update the selected user status
        setSelectedUser((prev) => ({
          ...prev,
          isActive: !prev.isActive,
        }));

        // Update the users list
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id
              ? { ...user, isActive: !user.isActive }
              : user
          )
        );

        toast.success(
          `User ${
            selectedUser.isActive ? "deactivated" : "activated"
          } successfully.`
        );
      } else {
        toast.error(data.message || "Failed to toggle user status", {
          style: {
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          },
        });
      }
    } catch (err) {
      toast.error("An error occurred while toggling user status", {
        style: {
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
        },
      });
      console.error("Error toggling user status:", err);
    } finally {
      setIsToggling(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!session?.accessToken || !selectedUser) return;

    if (
      !confirm(
        `Are you sure you want to delete user "${selectedUser.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(
        `http://localhost:3000/api/v1/admin/users/${selectedUser.id}`,
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
        // Remove user from the list
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.id !== selectedUser.id)
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

        // Close dialog
        setIsUserDetailOpen(false);
        setSelectedUser(null);

        toast.success(
          `User "${selectedUser.name}" has been deleted successfully.`
        );
      } else {
        toast.error(data.message || "Failed to delete user", {
          style: {
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          },
        });
      }
    } catch (err) {
      toast.error("An error occurred while deleting user", {
        style: {
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
        },
      });
      console.error("Error deleting user:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Loading users...</CardDescription>
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
          <CardTitle>Users</CardTitle>
          <CardDescription>Error loading users</CardDescription>
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
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage system users and their permissions
                {pagination && (
                  <span className="ml-2">
                    ({pagination.totalCount} total users)
                  </span>
                )}
              </CardDescription>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader className="space-y-1">
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Add a new user to the system.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="name" className="text-sm">
                        Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Full name"
                        value={createForm.name}
                        onChange={(e) =>
                          handleFormChange("name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-sm">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={createForm.email}
                        onChange={(e) =>
                          handleFormChange("email", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="password" className="text-sm">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Password"
                        value={createForm.password}
                        onChange={(e) =>
                          handleFormChange("password", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="role" className="text-sm">
                        Role
                      </Label>
                      <Select
                        value={createForm.role}
                        onValueChange={(value) =>
                          handleFormChange("role", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">
                            <div className="flex flex-col items-start">
                              <span className="font-bold">USER</span>
                              <span className="text-xs text-muted-foreground">
                                Standard user access
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="ADMINISTRATOR">
                            <div className="flex flex-col items-start">
                              <span className="font-bold">ADMINISTRATOR</span>
                              <span className="text-xs text-muted-foreground">
                                Full system access
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={isCreating}
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating} size="sm">
                      {isCreating ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3 mr-2" />
                          Create
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or role..."
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
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscriptions</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm
                          ? "No users found matching your search."
                          : "No users found."}
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
                filteredUsers.map((user) => (
                  <ContextMenu key={user.id}>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(user.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" alt={user.name} />
                              <AvatarFallback className="text-xs">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                user.isActive ? "bg-green-500" : "bg-red-500"
                              }`}
                            ></div>
                            <span className="text-sm">
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user._count.subscriptions}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </TableCell>
                      </TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48">
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(user.id);
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
                          // Set selected user and toggle status
                          setSelectedUser(user);
                          setTimeout(() => {
                            handleToggleStatus();
                          }, 100);
                        }}
                        className="cursor-pointer"
                      >
                        {user.isActive ? (
                          <>
                            <UserX className="h-4 w-4 mr-2" />
                            Deactivate User
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Activate User
                          </>
                        )}
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          // Set selected user and delete
                          setSelectedUser(user);
                          setTimeout(() => {
                            handleDeleteUser();
                          }, 100);
                        }}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold flex justify-between">
              <div>User Details</div>
              <div>
                <div className="flex gap-2 mr-6">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteUser}
                    disabled={isDeleting || isToggling}
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                  <Button
                    variant={selectedUser?.isActive ? "secondary" : "default"}
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={isDeleting || isToggling}
                  >
                    {isToggling ? (
                      <>
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        {selectedUser?.isActive
                          ? "Deactivating..."
                          : "Activating..."}
                      </>
                    ) : selectedUser?.isActive ? (
                      <>
                        <UserX className="h-3 w-3 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-3 w-3 mr-2" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {userDetailLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading user details...
                </span>
              </div>
            </div>
          ) : selectedUser ? (
            <div className="py-4">
              {/* Main Grid Layout */}
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column - User Info */}
                <div className="col-span-4 space-y-4">
                  {/* User Header */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
                        <AvatarImage src="" alt={selectedUser.name} />
                        <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                          {selectedUser.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          {selectedUser.name}
                        </h3>
                        <p className="text-sm text-muted-foreground break-all">
                          {selectedUser.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={getRoleBadgeVariant(selectedUser.role)}
                          className="font-medium"
                        >
                          {selectedUser.role}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              selectedUser.isActive
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {selectedUser.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="p-4 border rounded-lg bg-card">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Account Information
                    </Label>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          User ID
                        </span>
                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">
                          {selectedUser.id}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Created
                        </span>
                        <p className="text-sm font-medium mt-1">
                          {formatDate(selectedUser.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Last Updated
                        </span>
                        <p className="text-sm font-medium mt-1">
                          {formatDate(selectedUser.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Subscriptions */}
                <div className="col-span-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-lg font-semibold">
                        Subscriptions
                      </Label>
                      <Badge variant="secondary" className="text-xs">
                        {selectedUser.subscriptions?.length || 0}
                      </Badge>
                    </div>

                    {/* Subscription Summary */}
                    <div className="p-4 border rounded-lg bg-card">
                      <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Subscription Summary
                      </Label>
                      <div className="mt-3 grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">
                            {selectedUser._count?.subscriptions || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Total
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedUser.subscriptions?.filter(
                              (s) => s.status === "ACTIVE"
                            ).length || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Active
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {selectedUser.subscriptions?.filter(
                              (s) => s.status === "CANCELLED"
                            ).length || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Cancelled
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedUser.subscriptions &&
                    selectedUser.subscriptions.length > 0 ? (
                      <div className="space-y-3">
                        {selectedUser.subscriptions.map(
                          (subscription, index) => (
                            <div
                              key={subscription.id || index}
                              className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-foreground mb-1 truncate">
                                    {subscription.service?.displayName ||
                                      subscription.service?.name ||
                                      "Unknown Service"}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    <span className="mr-1">
                                      {subscription.service?.name || "N/A"}
                                    </span>

                                    <span className="text-muted-foreground mr-1">
                                      -
                                    </span>
                                    <span className="font-medium">
                                      until{" "}
                                      {subscription.expiresAt
                                        ? formatDate(subscription.expiresAt)
                                        : "N/A"}
                                    </span>
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    subscription.status === "ACTIVE"
                                      ? "default"
                                      : subscription.status === "CANCELLED"
                                      ? "destructive"
                                      : "outline"
                                  }
                                  className="font-medium ml-2"
                                >
                                  {subscription.status || "Unknown"}
                                </Badge>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                        <div className="text-muted-foreground">
                          <p className="text-sm">No subscriptions found</p>
                          <p className="text-xs mt-1">
                            This user has no active or past subscriptions.
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
                <p className="text-sm">No user data available</p>
                <p className="text-xs mt-1">Unable to load user information.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
