"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Announcement Badge */}
          <div className="inline-flex items-center px-4 py-2 mb-8 bg-gray-200 rounded-full text-sm text-gray-700">
            <span className="font-medium">New:</span>
            <span className="ml-1">Enhanced deployment & monitoring</span>
            <span className="ml-2 text-blue-600 font-medium cursor-pointer hover:underline">
              Learn more
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-black mb-8 tracking-tight leading-none">
            Super fast deployment
            <br />
            for everyone
          </h1>

          {/* CTA Button */}
          <div className="mb-16">
            {session ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-12 py-6 text-xl rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button
                  size="lg"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-12 py-6 text-xl rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Deploy free now
                </Button>
              </Link>
            )}
          </div>

          {/* Social Proof */}
          <div className="mb-16">
            <p className="text-lg text-gray-600 mb-8">
              Over <span className="font-semibold">20,000</span> creative teams
              use <span className="font-semibold">MinisPod</span> to deploy
              applications online.
            </p>
          </div>

          {/* Company Logos */}
          <div className="flex items-center justify-center space-x-12 opacity-60">
            <div className="text-2xl font-bold text-gray-800">n8n</div>
            <div className="text-2xl font-bold text-gray-800">WhatsApp</div>
            <div className="text-2xl font-bold text-gray-800">Database</div>
            <div className="text-2xl font-bold text-gray-800">GitHub</div>
            <div className="text-2xl font-bold text-gray-800">Docker</div>
            <div className="text-2xl font-bold text-gray-800">Next.js</div>
          </div>
        </div>
      </section>
    </div>
  );
}
