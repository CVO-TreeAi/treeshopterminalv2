"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface TimeEntry {
  _id: string;
  workOrderId: string;
  activityType: string;
  description: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  acreageWorked?: number;
  equipmentUsed?: string[];
  notes?: string;
}

export default function TimeTrackingPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string>("");
  const [description, setDescription] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  
  // Get active work orders and time entries
  const todaysWorkOrders = useQuery(api.workOrders.getTodaysWorkOrders, {}) || [];
  const activeTimeEntries = useQuery(api.timeTracking.getActiveTimeEntries, {}) || [];
  const currentUser = useQuery(api.auth.getCurrentUser, {}) || null;
  
  // Mutations for time tracking
  const startTimeEntry = useMutation(api.timeTracking.startTimeEntry);
  const endTimeEntry = useMutation(api.timeTracking.endTimeEntry);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activityTypes = [
    { value: "forestry_mulching", label: "🌲 Forestry Mulching", category: "work" },
    { value: "land_clearing", label: "🚜 Land Clearing", category: "work" },
    { value: "transport", label: "🚛 Transport", category: "support" },
    { value: "fueling", label: "⛽ Fueling", category: "support" },
    { value: "safety", label: "⚠️ Safety Meeting", category: "support" },
    { value: "training", label: "📚 Training", category: "support" },
    { value: "client_walkthrough", label: "🤝 Client Walkthrough", category: "support" },
    { value: "cleanup", label: "🧹 Cleanup", category: "support" },
  ];

  const equipmentOptions = [
    "Skid Steer", "Forestry Mulcher", "Excavator", "Chainsaw", 
    "Wood Chipper", "Stump Grinder", "Dump Truck", "Trailer"
  ];

  const handleStartTracking = async () => {
    if (!selectedWorkOrder || !selectedActivity || !description.trim()) {
      alert("Please select work order, activity type, and add description");
      return;
    }

    try {
      await startTimeEntry({
        workOrderId: selectedWorkOrder as any,
        activityType: selectedActivity as any,
        description: description,
        equipmentUsed: equipment,
        recordedBy: "current-user" as any, // Will be actual user ID
      });
      
      setIsTracking(true);
      setDescription("");
      console.log("Time tracking started!");
    } catch (error) {
      console.error("Error starting time tracking:", error);
      alert("Error starting time tracking");
    }
  };

  const handleStopTracking = async (entryId: string) => {
    try {
      await endTimeEntry({
        id: entryId as any,
        notes: "Completed via crew mobile interface"
      });
      
      setIsTracking(false);
      console.log("Time tracking stopped!");
    } catch (error) {
      console.error("Error stopping time tracking:", error);
      alert("Error stopping time tracking");
    }
  };

  return (
    <AuthenticatedLayout>
      <div className={`p-4 ${isMobile ? 'pb-20' : 'sm:p-6 lg:p-8'}`}>
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`font-bold text-green-500 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                Time Tracking
              </h1>
              <p className="text-gray-400 mt-1">Log work activities and equipment usage</p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-400">Active Entries</div>
              <div className="text-2xl font-bold text-green-400">
                {activeTimeEntries.length}
              </div>
            </div>
          </div>

          {/* Active Time Entries */}
          {activeTimeEntries.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-4">Currently Tracking</h2>
              <div className="space-y-3">
                {activeTimeEntries.map((entry) => (
                  <Card key={entry._id} className="border-green-500/50 bg-green-900/20">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-green-400 flex items-center gap-2">
                            🔴 RECORDING
                            <span className="text-white">
                              {entry.activityType.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-300 mt-1">
                            {entry.description}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Started: {new Date(entry.startTime).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400 mb-2">
                            {Math.floor((Date.now() - entry.startTime) / (1000 * 60))}m
                          </div>
                          <Button 
                            variant="error" 
                            size="sm"
                            onClick={() => handleStopTracking(entry._id)}
                          >
                            ⏹️ Stop
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Start New Time Entry */}
          <Card className="mb-8">
            <div className="p-6">
              <h2 className="text-lg font-bold text-white mb-4">Start Time Tracking</h2>
              
              <div className="space-y-4">
                {/* Work Order Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Work Order *
                  </label>
                  <select
                    value={selectedWorkOrder}
                    onChange={(e) => setSelectedWorkOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="">Select work order...</option>
                    {todaysWorkOrders.map((wo) => (
                      <option key={wo._id} value={wo._id}>
                        {wo.projectNumber} - {wo.customerName} ({wo.packageType})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Activity Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Activity Type *
                  </label>
                  <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {activityTypes.map((activity) => (
                      <button
                        key={activity.value}
                        onClick={() => setSelectedActivity(activity.value)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedActivity === activity.value
                            ? 'border-green-500 bg-green-500/20 text-green-400'
                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <div className="font-medium">{activity.label}</div>
                        <div className="text-xs opacity-75 capitalize">{activity.category}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={isMobile ? 2 : 3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 resize-none"
                    placeholder="Describe what you're working on..."
                  />
                </div>

                {/* Equipment Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Equipment Used
                  </label>
                  <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {equipmentOptions.map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          if (equipment.includes(item)) {
                            setEquipment(equipment.filter(e => e !== item));
                          } else {
                            setEquipment([...equipment, item]);
                          }
                        }}
                        className={`p-2 rounded text-sm border transition-colors ${
                          equipment.includes(item)
                            ? 'border-green-500 bg-green-500/20 text-green-400'
                            : 'border-gray-700 bg-gray-800 text-gray-300'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <Button
                  onClick={handleStartTracking}
                  variant="primary"
                  className="w-full py-4 text-lg"
                  disabled={!selectedWorkOrder || !selectedActivity || !description.trim()}
                >
                  🚀 Start Time Tracking
                </Button>
              </div>
            </div>
          </Card>

          {/* Today's Time Summary */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-bold text-white mb-4">Today's Time Summary</h2>
              
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">7.5h</div>
                  <div className="text-sm text-gray-400">Total Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">5.2h</div>
                  <div className="text-sm text-gray-400">Forestry Work</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">1.8h</div>
                  <div className="text-sm text-gray-400">Transport</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">0.5h</div>
                  <div className="text-sm text-gray-400">Other</div>
                </div>
              </div>
            </div>
          </Card>
          
        </div>
      </div>
    </AuthenticatedLayout>
  );
}