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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  RefreshCw,
  DollarSign,
  CreditCard,
  ShoppingCart,
} from "lucide-react";

export default function TransactionList() {
  const { data: session } = useSession();
  const [paymentTransactions, setPaymentTransactions] = useState([]);
  const [subscriptionTransactions, setSubscriptionTransactions] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [paymentError, setPaymentError] = useState("");
  const [subscriptionError, setSubscriptionError] = useState("");

  useEffect(() => {
    const fetchPaymentTransactions = async () => {
      if (!session?.accessToken) return;

      try {
        setPaymentLoading(true);
        setPaymentError("");

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
          }/api/v1/admin/billing/transactions?type=TOPUP`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setPaymentError(
            data.message || "Failed to fetch payment transactions"
          );
          return;
        }

        if (data.success) {
          setPaymentTransactions(data.data.transactions || []);
        } else {
          setPaymentError(
            data.message || "Failed to fetch payment transactions"
          );
        }
      } catch (err) {
        setPaymentError(
          err.message || "An error occurred while fetching payment transactions"
        );
      } finally {
        setPaymentLoading(false);
      }
    };

    const fetchSubscriptionTransactions = async () => {
      if (!session?.accessToken) return;

      try {
        setSubscriptionLoading(true);
        setSubscriptionError("");

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
          }/api/v1/admin/billing/transactions?type=SERVICE_PURCHASE`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setSubscriptionError(
            data.message || "Failed to fetch subscription transactions"
          );
          return;
        }

        if (data.success) {
          setSubscriptionTransactions(data.data.transactions || []);
        } else {
          setSubscriptionError(
            data.message || "Failed to fetch subscription transactions"
          );
        }
      } catch (err) {
        setSubscriptionError(
          err.message ||
            "An error occurred while fetching subscription transactions"
        );
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchPaymentTransactions();
    fetchSubscriptionTransactions();
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

  const renderTransactionTable = (transactions, loading, error, type) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      );
    }

    if (transactions.length === 0) {
      return (
        <div className="text-center py-8">
          {type === "payment" ? (
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          ) : (
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          )}
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {type} transactions found
          </h3>
          <p className="text-gray-500">
            No {type} transactions have been processed yet.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-mono text-sm">
                  {transaction.date ? formatDate(transaction.date) : "No date"}
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
                      {transaction.paymentGateway && (
                        <span className="mr-2">
                          via {transaction.paymentGateway}
                        </span>
                      )}
                      {transaction.type?.replace("_", " ") || "Unknown type"}
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
                    {transaction.reference ? (
                      <p className="font-mono text-xs">
                        {transaction.reference}
                      </p>
                    ) : (
                      <span className="text-xs text-gray-400">
                        No reference
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
                        onClick={() => handleDownloadInvoice(transaction.id)}
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
                    {transaction.actions?.canPay && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => console.log("Pay now:", transaction.id)}
                        className="h-8 px-3 text-xs"
                      >
                        Pay Now
                      </Button>
                    )}
                    {transaction.actions?.canCancel && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => console.log("Cancel:", transaction.id)}
                        className="h-8 px-3 text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                    {!transaction.actions && (
                      <span className="text-xs text-gray-400">No actions</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

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
        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Transactions
              {paymentTransactions.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {paymentTransactions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="subscriptions"
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Subscription Transactions
              {subscriptionTransactions.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {subscriptionTransactions.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Payment Transactions</h3>
                <p className="text-sm text-gray-600">
                  Top-up and payment gateway transactions
                </p>
              </div>
              {renderTransactionTable(
                paymentTransactions,
                paymentLoading,
                paymentError,
                "payment"
              )}
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Subscription Transactions
                </h3>
                <p className="text-sm text-gray-600">
                  Service subscription and billing transactions
                </p>
              </div>
              {renderTransactionTable(
                subscriptionTransactions,
                subscriptionLoading,
                subscriptionError,
                "subscription"
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
