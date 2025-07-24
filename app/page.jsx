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
            for every team
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
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-12 py-6 text-xl rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Try MinisPod for free
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
            <div className="text-2xl font-bold text-gray-800">Huge</div>
            <div className="text-2xl font-bold text-gray-800">Spotify</div>
            <div className="text-2xl font-bold text-gray-800">AKQA</div>
            <div className="text-2xl font-bold text-gray-800">Linktree</div>
            <div className="text-2xl font-bold text-gray-800">27b</div>
            <div className="text-2xl font-bold text-gray-800">Ogilvy</div>
          </div>
        </div>
      </section>

      {/* Additional CTA Section for non-authenticated users */}
      {!session && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-black mb-6">
              Ready to deploy?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of teams deploying with MinisPod
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 text-lg rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Start Free
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg rounded-full border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-all duration-200"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
