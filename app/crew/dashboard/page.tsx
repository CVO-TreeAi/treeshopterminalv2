"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  address?: string;
}

export default function CrewDashboardPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<number | null>(null);
  const [currentShiftHours, setCurrentShiftHours] = useState(0);
  
  // Get data from Convex (fallback to mock data for deployment)
  const todaysWorkOrders = []; // useQuery(api.workOrders.getTodaysWorkOrders) || [];
  const activeTimeEntries = []; // useQuery(api.timeTracking.getActiveTimeEntries, { userId: "current-user" }) || [];
  const dailyTimeSummary = null; // useQuery(api.timeTracking.getDailyTimeSummary, { date: Date.now(), userId: "current-user" });
  
  // Check mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          });
        },
        (error) => {
          console.log("Location access denied:", error);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 60000 
        }
      );
      
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Update shift hours
  useEffect(() => {
    if (clockInTime) {
      const interval = setInterval(() => {
        const hours = (Date.now() - clockInTime) / (1000 * 60 * 60);
        setCurrentShiftHours(Math.round(hours * 100) / 100);
      }, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [clockInTime]);

  const handleClockIn = () => {
    if (!location) {
      alert("GPS location required for clock in");
      return;
    }
    
    const now = Date.now();
    setIsClockedIn(true);
    setClockInTime(now);
    localStorage.setItem("clockInTime", now.toString());
    localStorage.setItem("clockInLocation", JSON.stringify(location));
    
    console.log("Clocked in at:", location);
  };

  const handleClockOut = () => {
    if (!confirm("Clock out for the day?")) return;
    
    setIsClockedIn(false);
    setClockInTime(null);
    setCurrentShiftHours(0);
    localStorage.removeItem("clockInTime");
    localStorage.removeItem("clockInLocation");
    
    console.log("Clocked out");
  };

  // Check if already clocked in from localStorage
  useEffect(() => {
    const savedClockIn = localStorage.getItem("clockInTime");
    if (savedClockIn) {
      const clockInTimestamp = parseInt(savedClockIn);
      const hoursAgo = (Date.now() - clockInTimestamp) / (1000 * 60 * 60);
      
      // If less than 24 hours ago, restore clock in state
      if (hoursAgo < 24) {
        setIsClockedIn(true);
        setClockInTime(clockInTimestamp);
        setCurrentShiftHours(Math.round(hoursAgo * 100) / 100);
      } else {
        // Auto clock out after 24 hours
        localStorage.removeItem("clockInTime");
        localStorage.removeItem("clockInLocation");
      }
    }
  }, []);

  return (
    <AuthenticatedLayout>
      <div className={`p-4 ${isMobile ? 'pb-20' : 'sm:p-6 lg:p-8'}`}>
        <div className="max-w-4xl mx-auto">
          
          {/* Header with Clock Status */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`font-bold text-green-500 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                Crew Dashboard
              </h1>
              <p className="text-gray-400 mt-1">Field operations control center</p>
            </div>
            
            <div className="text-right">
              <Badge variant={isClockedIn ? "success" : "secondary"}>
                {isClockedIn ? "🟢 Clocked In" : "⚫ Clocked Out"}
              </Badge>
              {isClockedIn && (
                <div className="text-sm text-green-400 mt-1">
                  {currentShiftHours}h today
                </div>
              )}
            </div>
          </div>

          {/* Clock In/Out Section */}
          <Card className={`mb-8 ${isClockedIn ? 'border-green-500/30' : 'border-yellow-500/30'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Time Clock</h2>
                  <div className="text-sm text-gray-400 mt-1">
                    {location ? (
                      <span className="text-green-400">
                        📍 GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-yellow-400">📍 Getting GPS location...</span>
                    )}
                  </div>
                  {isClockedIn && clockInTime && (
                    <div className="text-sm text-green-400 mt-2">
                      Started: {new Date(clockInTime).toLocaleTimeString()}
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  {!isClockedIn ? (
                    <Button
                      onClick={handleClockIn}
                      variant="primary"
                      className="py-4 px-6"
                      disabled={!location}
                    >
                      🕐 Clock In
                    </Button>
                  ) : (
                    <Button
                      onClick={handleClockOut}
                      variant="error"
                      className="py-4 px-6"
                    >
                      🕐 Clock Out
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions Grid */}
          <div className="mb-8">
            <h2 className={`font-bold text-white mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              Quick Actions
            </h2>
            
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
              <Card className="cursor-pointer hover:border-green-500 transition-colors">
                <div className="p-4 text-center">
                  <div className="text-3xl mb-2">⏱️</div>
                  <div className="font-medium text-white">Start Timer</div>
                  <div className="text-xs text-gray-400">Track activity</div>
                </div>
              </Card>
              
              <Card className="cursor-pointer hover:border-blue-500 transition-colors">
                <div className="p-4 text-center">
                  <div className="text-3xl mb-2">📸</div>
                  <div className="font-medium text-white">Take Photo</div>
                  <div className="text-xs text-gray-400">Document work</div>
                </div>
              </Card>
              
              <Card className="cursor-pointer hover:border-yellow-500 transition-colors">
                <div className="p-4 text-center">
                  <div className="text-3xl mb-2">🗺️</div>
                  <div className="font-medium text-white">Site Map</div>
                  <div className="text-xs text-gray-400">View work area</div>
                </div>
              </Card>
              
              <Card className="cursor-pointer hover:border-purple-500 transition-colors">
                <div className="p-4 text-center">
                  <div className="text-3xl mb-2">📋</div>
                  <div className="font-medium text-white">Job Notes</div>
                  <div className="text-xs text-gray-400">Add comments</div>
                </div>
              </Card>
            </div>
          </div>

          {/* Today's Summary */}
          <Card className="mb-8">
            <div className="p-6">
              <h2 className="text-lg font-bold text-white mb-4">Today's Summary</h2>
              
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {dailyTimeSummary?.totalHours?.toFixed(1) || "0.0"}h
                  </div>
                  <div className="text-sm text-gray-400">Total Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {todaysWorkOrders.filter(wo => wo.status === "completed").length}
                  </div>
                  <div className="text-sm text-gray-400">Jobs Done</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {activeTimeEntries.length}
                  </div>
                  <div className="text-sm text-gray-400">Active Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {dailyTimeSummary?.entryCount || 0}
                  </div>
                  <div className="text-sm text-gray-400">Time Entries</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Emergency Contact - Always Visible on Mobile */}
          {isMobile && (
            <div className="fixed bottom-4 left-4 right-4 z-50">
              <Card className="border-red-500/30 bg-red-900/20">
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-red-400 text-xl">🚨</div>
                    <div>
                      <div className="font-medium text-red-400">Emergency</div>
                      <div className="text-xs text-gray-400">(386) 843-5266</div>
                    </div>
                  </div>
                  <Button variant="error" size="sm">
                    📞 Call
                  </Button>
                </div>
              </Card>
            </div>
          )}
          
        </div>
      </div>
    </AuthenticatedLayout>
  );
}