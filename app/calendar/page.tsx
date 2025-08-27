"use client";

import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import DirectoryLayout from "@/components/shared/DirectoryLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function CalendarPage() {
  return (
    <AuthenticatedLayout>
      <DirectoryLayout
        title="Calendar & Scheduling"
        subtitle="Project scheduling and crew management"
      >
        <div className="text-center py-16">
          <div className="text-8xl mb-8">📅</div>
          
          <h2 className="text-3xl font-bold text-white mb-4">Calendar Integration</h2>
          
          <Card className="max-w-md mx-auto">
            <div className="p-8">
              <h3 className="text-xl font-semibold mb-4 text-green-400">Coming Soon</h3>
              <p className="text-gray-300 mb-6">
                We're integrating Google Calendar for seamless project scheduling and crew dispatch.
              </p>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Project scheduling</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Crew dispatch</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Google Calendar sync</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Weather integration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Equipment tracking</span>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="mt-8">
            <Button
              variant="secondary"
              onClick={() => window.location.href = "/proposals"}
            >
              ← Back to Proposals
            </Button>
          </div>
        </div>
      </DirectoryLayout>
    </AuthenticatedLayout>
  );
}