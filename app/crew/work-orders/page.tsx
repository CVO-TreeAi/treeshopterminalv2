"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function CrewWorkOrdersPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Get work orders and mutations
  const todaysWorkOrders = useQuery(api.workOrders.getTodaysWorkOrders) || [];
  const upcomingWorkOrders = useQuery(api.workOrders.getUpcomingWorkOrders) || [];
  const startWorkMutation = useMutation(api.workOrders.startWork);
  const pauseWorkMutation = useMutation(api.workOrders.pauseWork);
  const completeWorkMutation = useMutation(api.workOrders.completeWork);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "warning";
      case "in_progress": return "success";
      case "completed": return "info";
      case "paused": return "secondary";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled": return "📅";
      case "in_progress": return "🔴";
      case "completed": return "✅";
      case "paused": return "⏸️";
      default: return "📋";
    }
  };

  const handleStartWork = async (workOrderId: string) => {
    try {
      await startWorkMutation({
        id: workOrderId as any,
        startedBy: "current-user" as any, // Will be actual user ID
        notes: "Work started via crew mobile interface"
      });
      console.log("Work started successfully!");
    } catch (error) {
      console.error("Error starting work:", error);
      alert("Error starting work");
    }
  };

  const handlePauseWork = async (workOrderId: string) => {
    const reason = prompt("Reason for pause:");
    if (!reason) return;
    
    try {
      await pauseWorkMutation({
        id: workOrderId as any,
        reason: reason
      });
      console.log("Work paused successfully!");
    } catch (error) {
      console.error("Error pausing work:", error);
      alert("Error pausing work");
    }
  };

  const handleCompleteWork = async (workOrderId: string) => {
    if (!confirm("Mark this work order as complete?")) return;
    
    const notes = prompt("Completion notes:");
    
    try {
      await completeWorkMutation({
        id: workOrderId as any,
        completedBy: "current-user" as any, // Will be actual user ID
        completionNotes: notes || "Work completed via crew mobile interface"
      });
      console.log("Work completed successfully!");
    } catch (error) {
      console.error("Error completing work:", error);
      alert("Error completing work");
    }
  };

  const renderWorkOrderCard = (workOrder: any, isToday: boolean = false) => (
    <Card 
      key={workOrder._id} 
      className={`cursor-pointer transition-colors ${
        workOrder.status === "in_progress" ? "border-green-500/50 bg-green-900/20" : 
        "hover:border-green-500/30"
      }`}
      onClick={() => {
        setSelectedWorkOrder(workOrder._id);
        setShowDetails(true);
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-medium text-white flex items-center gap-2">
              {getStatusIcon(workOrder.status)}
              {workOrder.projectNumber}
            </div>
            <div className="text-sm text-gray-400">{workOrder.customerName}</div>
          </div>
          <Badge variant={getStatusColor(workOrder.status)}>
            {workOrder.status}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="text-gray-300">
            📍 {workOrder.propertyAddress?.slice(0, 40)}...
          </div>
          <div className="text-gray-300">
            🏷️ {workOrder.packageType} Package ({workOrder.workAreaAcreage} acres)
          </div>
          {workOrder.scheduledDate && (
            <div className="text-gray-300">
              🕐 {new Date(workOrder.scheduledDate).toLocaleDateString()}
            </div>
          )}
          {workOrder.assignedCrew && (
            <div className="text-green-400">
              👥 {workOrder.assignedCrew}
            </div>
          )}
        </div>
        
        {/* Mobile Action Buttons */}
        <div className={`mt-4 flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
          {workOrder.status === "scheduled" && (
            <Button 
              variant="primary" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                handleStartWork(workOrder._id);
              }}
            >
              🚀 Start Work
            </Button>
          )}
          {workOrder.status === "in_progress" && (
            <>
              <Button 
                variant="warning" 
                size="sm" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePauseWork(workOrder._id);
                }}
              >
                ⏸️ Pause
              </Button>
              <Button 
                variant="success" 
                size="sm" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompleteWork(workOrder._id);
                }}
              >
                ✅ Complete
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <AuthenticatedLayout>
      <div className={`p-4 ${isMobile ? 'pb-20' : 'sm:p-6 lg:p-8'}`}>
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`font-bold text-green-500 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                My Work Orders
              </h1>
              <p className="text-gray-400 mt-1">Your assigned jobs and schedules</p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-400">Today's Jobs</div>
              <div className="text-2xl font-bold text-green-400">
                {todaysWorkOrders.length}
              </div>
            </div>
          </div>

          {/* Today's Work Orders */}
          <div className="mb-8">
            <h2 className={`font-bold text-white mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              Today's Schedule
            </h2>
            
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              {todaysWorkOrders.length === 0 ? (
                <Card className="col-span-full">
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📅</div>
                    <div className="text-gray-400">No work scheduled for today</div>
                    <div className="text-sm text-gray-500 mt-2">Enjoy your day off or check upcoming jobs</div>
                  </div>
                </Card>
              ) : (
                todaysWorkOrders.map((workOrder) => renderWorkOrderCard(workOrder, true))
              )}
            </div>
          </div>

          {/* Upcoming Work Orders */}
          {upcomingWorkOrders.length > 0 && (
            <div className="mb-8">
              <h2 className={`font-bold text-white mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                Upcoming Jobs (Next 7 Days)
              </h2>
              
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {upcomingWorkOrders.map((workOrder) => renderWorkOrderCard(workOrder, false))}
              </div>
            </div>
          )}

          {/* Work Order Details Modal */}
          {showDetails && selectedWorkOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className={`bg-gray-900 rounded-lg w-full max-h-[90vh] overflow-y-auto ${
                isMobile ? 'max-w-sm' : 'max-w-2xl'
              }`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Work Order Details</h3>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-gray-400 hover:text-white text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Work order details would go here */}
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📋</div>
                      <div className="text-gray-400">Detailed work order view</div>
                      <div className="text-sm text-gray-500 mt-2">
                        Scope, equipment, instructions, and progress tracking
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </AuthenticatedLayout>
  );
}