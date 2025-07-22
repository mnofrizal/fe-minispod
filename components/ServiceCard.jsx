"use client";

import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Server, DollarSign, Tag } from "lucide-react";

export default function ServiceCard({ service }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return numPrice === 0 ? "Free" : `$${numPrice}/month`;
  };

  const formatRupiahPrice = (price) => {
    const numPrice = parseFloat(price);
    if (numPrice === 0) return "Free";
    return `Rp ${(numPrice * 15000).toLocaleString()}/month`;
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full"
        onClick={() => setIsDialogOpen(true)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">{service.displayName}</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  {service.name}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {service.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <Badge
                  variant={
                    parseFloat(service.monthlyPrice) === 0
                      ? "secondary"
                      : "default"
                  }
                >
                  {formatPrice(service.monthlyPrice)}
                </Badge>
              </div>
              <Badge variant="outline">{service.version}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[85vw] w-[85vw] max-h-[80vh] overflow-y-auto sm:max-w-[75vw] sm:w-[75vw]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Server className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {service.displayName}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {service.name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Grid - Detail Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Description
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {service.description}
                </p>
              </div>

              <Separator />

              {/* Service Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Pricing
                  </h4>
                  <Badge
                    variant={
                      parseFloat(service.monthlyPrice) === 0
                        ? "secondary"
                        : "default"
                    }
                    className="text-sm"
                  >
                    {formatPrice(service.monthlyPrice)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Version
                  </h4>
                  <Badge variant="outline" className="text-sm">
                    {service.version}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Service Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Service Information
                </h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Service ID:</span>
                      <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                        {service.id}
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Internal Name:
                      </span>
                      <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                        {service.name}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              {parseFloat(service.monthlyPrice) === 0 ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                      Free Service
                    </h4>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    This service is available at no cost. You can start using it
                    immediately.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Premium Service
                    </h4>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    This service requires a monthly subscription of{" "}
                    {formatPrice(service.monthlyPrice)}.
                  </p>
                </div>
              )}
            </div>

            {/* Right Grid - Deployment Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Deployment Summary
                </h3>

                <div className="space-y-6">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">
                      Service Type
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {service.name}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">
                      Template
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {service.name} Basic
                    </span>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">
                      Billing Cycle
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      Monthly
                    </span>
                  </div>

                  <Separator className="my-6" />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      Cost
                    </span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatRupiahPrice(service.monthlyPrice)}
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Deploy Service
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
