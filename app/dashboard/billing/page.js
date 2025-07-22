"use client";

import { useState } from "react";
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
  Search,
  Download,
  Plus,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

export default function BillingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");

  // Mock data for current balance
  const currentBalance = 2500000; // Rp 2,500,000

  // Mock data for transaction history (top-ups and purchases)
  const transactionHistory = [
    {
      id: 1,
      date: "2024-02-15",
      type: "purchase",
      description: "Web Hosting Premium - 1 Month",
      amount: -450000,
      status: "completed",
      reference: "TXN-2024-001",
    },
    {
      id: 2,
      date: "2024-02-14",
      type: "topup",
      description: "Top Up via Payment Gateway",
      amount: 1000000,
      status: "completed",
      reference: "TOP-2024-015",
    },
    {
      id: 3,
      date: "2024-02-10",
      type: "purchase",
      description: "Domain Registration - .com",
      amount: -150000,
      status: "completed",
      reference: "TXN-2024-002",
    },
    {
      id: 4,
      date: "2024-02-08",
      type: "purchase",
      description: "SSL Certificate - 1 Year",
      amount: -200000,
      status: "completed",
      reference: "TXN-2024-003",
    },
    {
      id: 5,
      date: "2024-02-05",
      type: "topup",
      description: "Top Up via Payment Gateway",
      amount: 2000000,
      status: "completed",
      reference: "TOP-2024-012",
    },
    {
      id: 6,
      date: "2024-01-28",
      type: "purchase",
      description: "Database Service - 1 Month",
      amount: -300000,
      status: "completed",
      reference: "TXN-2024-004",
    },
    {
      id: 7,
      date: "2024-01-25",
      type: "topup",
      description: "Top Up via Payment Gateway",
      amount: 500000,
      status: "completed",
      reference: "TOP-2024-008",
    },
    {
      id: 8,
      date: "2024-01-20",
      type: "purchase",
      description: "CDN Service - 1 Month",
      amount: -100000,
      status: "completed",
      reference: "TXN-2024-005",
    },
  ];

  const filteredHistory = transactionHistory.filter(
    (item) =>
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        variant: "default",
        className: "bg-green-100 text-green-800",
      },
      pending: {
        variant: "secondary",
        className: "bg-yellow-100 text-yellow-800",
      },
      failed: { variant: "destructive", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTransactionIcon = (type) => {
    return type === "topup" ? (
      <ArrowDownLeft className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowUpRight className="h-4 w-4 text-red-600" />
    );
  };

  const handleTopUp = () => {
    // Handle top-up logic here - will integrate with payment gateway
    console.log(`Top up ${topUpAmount}`);
    setTopUpAmount("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Billing & Balance
        </h1>
        <p className="text-gray-600">
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
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(currentBalance)}
                </div>
                <p className="text-sm text-gray-600">Available for purchases</p>
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
            <div className="space-y-4">
              <div>
                <Input
                  type="number"
                  placeholder="Enter amount (minimum Rp 50,000)"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="text-lg"
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
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>

              <Button
                className="w-full"
                onClick={handleTopUp}
                disabled={!topUpAmount || parseInt(topUpAmount) < 50000}
              >
                <Plus className="h-4 w-4 mr-2" />
                Top Up Now
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
              {filteredHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {new Date(item.date).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTransactionIcon(item.type)}
                      <span className="capitalize">{item.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell
                    className={`font-medium ${
                      item.amount > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.amount > 0 ? "+" : ""}
                    {formatCurrency(item.amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.reference}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
