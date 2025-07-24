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
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, RefreshCw, DollarSign } from "lucide-react";

export default function TransactionList() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
          }/api/v1/admin/billing/transactions`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data = await response.json();
        if (data.success) {
          setTransactions(data.data.transactions || []);
        } else {
          setError(data.message || "Failed to fetch transactions");
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while fetching transactions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [session]);

  const getStatusColor = (status) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "FAILED":
        return "bg-red-500";
      case "CANCELLED":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "SUCCESS":
        return "Success";
      case "PENDING":
        return "Pending";
      case "FAILED":
        return "Failed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  const formatAmount = (amount, currency) => {
    const numAmount = parseInt(amount);
    if (numAmount === 0) return "Free";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency || "IDR",
    }).format(numAmount);
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

  const handleDownloadInvoice = (transactionId) => {
    // Implement invoice download logic
    console.log("Download invoice for transaction:", transactionId);
  };

  const handleRefund = (transactionId) => {
    // Implement refund logic
    console.log("Process refund for transaction:", transactionId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Management</CardTitle>
          <CardDescription>Loading transactions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Transaction Management
        </CardTitle>
        <CardDescription>
          View and manage all user transactions across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No transactions found
            </h3>
            <p className="text-gray-500">
              No transactions have been processed yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">
                      {transaction.date
                        ? formatDate(transaction.date)
                        : "No date"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.user?.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.user?.email || "No email"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm font-medium truncate">
                          {transaction.description || "No description"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.type?.replace("_", " ") ||
                            "Unknown type"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-white text-xs ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {getStatusText(transaction.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {transaction.invoice ? (
                          <>
                            <p className="font-mono text-xs">
                              {transaction.invoice.invoiceNumber}
                            </p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {transaction.invoice.status}
                            </Badge>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No invoice
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.actions?.canDownloadInvoice && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDownloadInvoice(transaction.id)
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {transaction.actions?.canRefund && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefund(transaction.id)}
                            className="h-8 px-3 text-xs"
                          >
                            Refund
                          </Button>
                        )}
                        {!transaction.actions && (
                          <span className="text-xs text-gray-400">
                            No actions
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
