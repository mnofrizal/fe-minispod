"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Script from "next/script";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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
  Search,
  Download,
  Plus,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function BillingPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [error, setError] = useState("");
  const [snapLoaded, setSnapLoaded] = useState(false);

  // Transaction states
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(
    (item) =>
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    const numAmount = typeof amount === "string" ? parseInt(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Math.abs(numAmount));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      SUCCESS: {
        variant: "default",
        className: "bg-green-100 text-green-800",
        label: "Success",
      },
      PENDING: {
        variant: "secondary",
        className: "bg-yellow-100 text-yellow-800",
        label: "Pending",
      },
      FAILED: {
        variant: "destructive",
        className: "bg-red-100 text-red-800",
        label: "Failed",
      },
      // Legacy support for lowercase
      completed: {
        variant: "default",
        className: "bg-green-100 text-green-800",
        label: "Completed",
      },
      pending: {
        variant: "secondary",
        className: "bg-yellow-100 text-yellow-800",
        label: "Pending",
      },
      failed: {
        variant: "destructive",
        className: "bg-red-100 text-red-800",
        label: "Failed",
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getTransactionIcon = (type) => {
    return type === "TOPUP" || type === "topup" ? (
      <ArrowDownLeft className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowUpRight className="h-4 w-4 text-red-600" />
    );
  };

  // Fetch balance from API
  const fetchBalance = async () => {
    if (!session?.accessToken) return;

    try {
      setBalanceLoading(true);
      setError("");

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/api/v1/billing/balance`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setBalance(parseInt(data.data.balance));
      } else {
        setError(data.message || "Failed to fetch balance");
      }
    } catch (err) {
      setError("An error occurred while fetching balance");
      console.error("Error fetching balance:", err);
    } finally {
      setBalanceLoading(false);
    }
  };

  // Fetch transactions from API
  const fetchTransactions = async (page = 1, limit = 20) => {
    if (!session?.accessToken) return;

    try {
      setTransactionsLoading(true);
      setTransactionsError("");

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/api/v1/billing/transactions?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setTransactions(data.data.transactions);
        setPagination(data.data.pagination);
      } else {
        setTransactionsError(data.message || "Failed to fetch transactions");
      }
    } catch (err) {
      setTransactionsError("An error occurred while fetching transactions");
      console.error("Error fetching transactions:", err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Handle top-up with Midtrans integration
  const handleTopUp = async () => {
    if (!session?.accessToken || !topUpAmount) return;

    try {
      setTopUpLoading(true);
      setError("");

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/api/v1/billing/topup`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: parseInt(topUpAmount),
            currency: "IDR",
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Use Snap.js popup for payment
        if (data.data.snapToken && window.snap) {
          setTopUpAmount("");
          setIsTopUpDialogOpen(false);

          window.snap.pay(data.data.snapToken, {
            onSuccess: function (result) {
              console.log("Payment success:", result);
              // Refresh balance and transactions after successful payment
              fetchBalance();
              fetchTransactions();
            },
            onPending: function (result) {
              console.log("Payment pending:", result);
              // Refresh balance and transactions after pending payment
              fetchBalance();
              fetchTransactions();
            },
            onError: function (result) {
              console.log("Payment error:", result);
              setError("Payment failed. Please try again.");
            },
            onClose: function () {
              console.log("Payment popup closed");
              // Refresh balance and transactions when popup is closed
              fetchBalance();
              fetchTransactions();
            },
          });
        } else if (data.data.redirectUrl) {
          // Fallback to redirect if Snap.js is not available
          window.open(data.data.redirectUrl, "_blank");
          setTopUpAmount("");
          setIsTopUpDialogOpen(false);
          setTimeout(() => {
            fetchBalance();
            fetchTransactions();
          }, 1000);
        }
      } else {
        setError(data.message || "Failed to create top-up transaction");
      }
    } catch (err) {
      setError("An error occurred while processing top-up");
      console.error("Error processing top-up:", err);
    } finally {
      setTopUpLoading(false);
    }
  };

  // Fetch balance and transactions on component mount
  useEffect(() => {
    if (session?.accessToken) {
      fetchBalance();
      fetchTransactions();
    }
  }, [session?.accessToken]);

  // Handle Pay Now for pending transactions
  const handlePayNow = async (transactionId) => {
    if (!session?.accessToken) return;

    try {
      setError("");

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/api/v1/billing/transactions/${transactionId}/pay`,
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
        // Use Snap.js popup for payment
        if (data.data.snapToken && window.snap) {
          window.snap.pay(data.data.snapToken, {
            onSuccess: function (result) {
              console.log("Payment success:", result);
              // Refresh balance and transactions after successful payment
              fetchBalance();
              fetchTransactions();
            },
            onPending: function (result) {
              console.log("Payment pending:", result);
              // Refresh balance and transactions after pending payment
              fetchBalance();
              fetchTransactions();
            },
            onError: function (result) {
              console.log("Payment error:", result);
              setError("Payment failed. Please try again.");
            },
            onClose: function () {
              console.log("Payment popup closed");
              // Refresh balance and transactions when popup is closed
              fetchBalance();
              fetchTransactions();
            },
          });
        } else if (data.data.redirectUrl) {
          // Fallback to redirect if Snap.js is not available
          window.open(data.data.redirectUrl, "_blank");
          setTimeout(() => {
            fetchBalance();
            fetchTransactions();
          }, 1000);
        }
      } else {
        setError(data.message || "Failed to process payment");
      }
    } catch (err) {
      setError("An error occurred while processing payment");
      console.error("Error processing payment:", err);
    }
  };

  // Handle download invoice
  const handleDownloadInvoice = async (invoiceId) => {
    if (!session?.accessToken || !invoiceId) return;

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/api/v1/billing/invoices/${invoiceId}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (response.ok) {
        // Get the blob data
        const blob = await response.blob();

        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Create a temporary anchor element and trigger download
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to download invoice");
      }
    } catch (err) {
      setError("An error occurred while downloading invoice");
      console.error("Error downloading invoice:", err);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      fetchTransactions(newPage, pagination.limit);
    }
  };

  // Handle dialog open - clear error
  const handleDialogOpen = (open) => {
    setIsTopUpDialogOpen(open);
    if (open) {
      setError("");
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
          Billing & Balance
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
          Manage your account balance and transaction history
        </p>
      </div>

      {/* Balance and Top Up Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Current Balance Card */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {balanceLoading ? (
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-32 rounded"></div>
                  ) : (
                    formatCurrency(balance)
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Available for purchases
                </p>
              </div>
              <Wallet className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Top Up Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Top Up Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center flex space-y-4">
              <Dialog open={isTopUpDialogOpen} onOpenChange={handleDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full  cursor-pointer" size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Top Up Balance
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Top Up Balance</DialogTitle>
                    <DialogDescription>
                      Add funds to your account. Minimum top-up amount is Rp
                      50,000.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                      </div>
                    )}
                    <div>
                      <Input
                        type="number"
                        placeholder="Enter amount (minimum Rp 50,000)"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        className="text-lg"
                        disabled={topUpLoading}
                      />
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      {[100000, 500000, 1000000].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setTopUpAmount(amount.toString())}
                          disabled={topUpLoading}
                        >
                          {formatCurrency(amount)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsTopUpDialogOpen(false)}
                      disabled={topUpLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleTopUp}
                      disabled={
                        !topUpAmount ||
                        parseInt(topUpAmount) < 50000 ||
                        topUpLoading
                      }
                    >
                      {topUpLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Confirm Top Up
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="mt-2">
              <Button
                className="w-full cursor-pointer"
                size="lg"
                variant="outline"
                disabled
              >
                <Plus className="h-4 w-4 mr-2" />
                Reedem Coupon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View your top-ups and service purchases
          </CardDescription>
          <div className="flex items-center space-x-2 mt-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      <span>Loading transactions...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactionsError ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-red-600">{transactionsError}</div>
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-500">No transactions found</div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {new Date(item.date).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTransactionIcon(item.type)}
                        <span className="capitalize">
                          {item.type.toLowerCase()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell
                      className={`font-medium ${
                        item.type === "TOPUP"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.type === "TOPUP" ? "+" : "-"}
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.reference}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {item.actions?.canPay && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePayNow(item.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Pay Now
                          </Button>
                        )}
                        {item.actions?.canDownloadInvoice && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDownloadInvoice(item.invoice?.id)
                            }
                            title="Download Invoice"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-gray-700">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} transactions
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || transactionsLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pagination.page === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={transactionsLoading}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={
                    pagination.page === pagination.totalPages ||
                    transactionsLoading
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Midtrans Snap.js Script */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={() => setSnapLoaded(true)}
        strategy="lazyOnload"
      />
    </DashboardLayout>
  );
}
