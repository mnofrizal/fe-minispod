"use client";

import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Server, DollarSign, Tag, Cpu, MemoryStick } from "lucide-react";

export default function ServiceCard({ service }) {
  const { data: session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState("");
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return numPrice === 0 ? "Free" : `$${numPrice}/month`;
  };

  const formatRupiahPrice = (price) => {
    const numPrice = parseFloat(price);
    if (numPrice === 0) return "Free";
    // Convert USD to IDR (assuming price is in USD)
    // If price is already in IDR, remove the multiplication
    return `Rp ${numPrice.toLocaleString()}/month`;
  };

  const handleSubscribe = async () => {
    if (!session?.accessToken) {
      setSubscriptionError("Please login to subscribe to this service");
      return;
    }

    try {
      setIsSubscribing(true);
      setSubscriptionError("");
      setSubscriptionSuccess(false);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/api/v1/subscriptions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceId: selectedVariant?.id || service.defaultVariant?.id,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSubscriptionSuccess(true);
        setSubscriptionError("");
        // Optionally close dialog after successful subscription
        setTimeout(() => {
          setIsDialogOpen(false);
          setSubscriptionSuccess(false);
        }, 2000);
      } else {
        // Use specific reasons from the API response if available
        let errorMessage = data.message || "Failed to subscribe to service";

        if (data.code && data.code.reasons && data.code.reasons.length > 0) {
          errorMessage = data.code.reasons.join(", ");
        }

        setSubscriptionError(errorMessage);
      }
    } catch (err) {
      setSubscriptionError(
        "An error occurred while subscribing to the service"
      );
      console.error("Error subscribing to service:", err);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
    setSubscriptionError("");
    setSubscriptionSuccess(false);
    // Set default variant when opening dialog
    const defaultVariant =
      service.variants?.find((v) => v.isDefault) ||
      service.variants?.[0] ||
      service.defaultVariant;
    setSelectedVariant(defaultVariant);
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full flex flex-col"
        onClick={handleDialogOpen}
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
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {service.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <Badge
                variant={
                  parseFloat(service.monthlyPrice) === 0
                    ? "secondary"
                    : "default"
                }
              >
                {formatRupiahPrice(service.monthlyPrice)}
              </Badge>
            </div>
            <Badge variant="outline">{service.variantDisplayName}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Service Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[85vw] w-[85vw] max-h-[80vh] overflow-y-auto scrollbar-hide sm:max-w-[75vw] sm:w-[75vw]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Server className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {service.displayName}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Please select plan configuration
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Grid - Detail Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Variant Selection */}
              {service.variants && service.variants.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {service.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className={`border rounded-lg p-4 transition-colors ${
                          variant.availableQuota === 0
                            ? "border-red-200 bg-red-50 dark:bg-red-900/20 cursor-not-allowed opacity-60"
                            : selectedVariant?.id === variant.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-pointer"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 cursor-pointer"
                        }`}
                        onClick={() => {
                          if (variant.availableQuota !== 0) {
                            setSelectedVariant(variant);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-gray-900 dark:text-white">
                                {variant.variantDisplayName}
                              </h5>
                              {variant.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  Recommended
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {variant.description}
                            </div>
                            <div className="space-y-1">
                              {(variant.cpuSpec || variant.memSpec) && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
                                  {variant.cpuSpec && (
                                    <div className="flex items-center gap-1">
                                      <Cpu className="w-3 h-3" />
                                      <span>{variant.cpuSpec}</span>
                                    </div>
                                  )}
                                  {variant.memSpec && (
                                    <div className="flex items-center gap-1">
                                      <MemoryStick className="w-3 h-3" />
                                      <span>{variant.memSpec}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              {variant.availableQuota === 0 && (
                                <div className="text-xs text-red-600 font-medium">
                                  Out of Quota
                                </div>
                              )}
                            </div>
                            {variant.features &&
                              variant.features.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 flex-wrap">
                                    {variant.features
                                      .slice(0, 3)
                                      .map((feature, index) => (
                                        <span
                                          key={index}
                                          className="flex items-center gap-1"
                                        >
                                          <svg
                                            className="w-3 h-3 text-green-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                          {feature}
                                          {index <
                                            Math.min(
                                              variant.features.length,
                                              3
                                            ) -
                                              1 && (
                                            <span className="mx-1">•</span>
                                          )}
                                        </span>
                                      ))}
                                    {variant.features.length > 3 && (
                                      <span className="text-gray-500 ml-1">
                                        +{variant.features.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatRupiahPrice(variant.monthlyPrice)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Service Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Service Information
                </h4>
                {parseFloat(
                  selectedVariant?.monthlyPrice || service.monthlyPrice
                ) === 0 ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                        Free Service
                      </h4>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      This service is available at no cost. You can start using
                      it immediately.
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
                      {formatRupiahPrice(
                        selectedVariant?.monthlyPrice || service.monthlyPrice
                      )}
                      .
                    </p>
                  </div>
                )}
              </div>
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
                      Plan
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedVariant?.variantDisplayName || service.version}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">
                      Resources
                    </span>
                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        <span>
                          {selectedVariant?.cpuSpec ||
                            service.defaultVariant?.cpuSpec}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MemoryStick className="w-4 h-4" />
                        <span>
                          {selectedVariant?.memSpec ||
                            service.defaultVariant?.memSpec}
                        </span>
                      </div>
                    </div>
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
                      {formatRupiahPrice(
                        selectedVariant?.monthlyPrice || service.monthlyPrice
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {/* Error Message */}
                  {subscriptionError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {subscriptionError}
                    </div>
                  )}

                  {/* Success Message */}
                  {subscriptionSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                      Successfully subscribed to {service.displayName}!
                    </div>
                  )}

                  <Button
                    onClick={handleSubscribe}
                    disabled={isSubscribing || subscriptionSuccess}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {isSubscribing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Subscribing...
                      </>
                    ) : subscriptionSuccess ? (
                      <>
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Subscribed
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
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
