"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TREESHOP_BUSINESS_DATA, ACTIVITY_TYPES } from "@/lib/treeShopData";
import AppLayout from "@/components/layout/AppLayout";
import { AppGrid, AppGridItem } from "@/components/layout/AppGrid";
import QuickActions from "@/components/layout/QuickActions";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface CrewMember {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  currentWorkOrder?: string;
}

export default function CrewPage() {
  const router = useRouter();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null);
  const [activeTimeEntry, setActiveTimeEntry] = useState<string | null>(null);
  
  // Get today's work orders and active time entries
  const todaysWorkOrders = useQuery(api.workOrders.getTodaysWorkOrders) || TREESHOP_BUSINESS_DATA.activeProjects;
  const activeTimeEntries = useQuery(api.timeTracking.getActiveTimeEntries) || [];
  const currentUser = useQuery(api.auth.getCurrentUser) || null;
  
  // Real TreeShop crew data
  const crewMembers: CrewMember[] = TREESHOP_BUSINESS_DATA.crew.map(crew => ({
    id: crew.id,
    name: crew.name,
    role: crew.role,
    isActive: crew.isActive,
    currentWorkOrder: crew.currentProject
  }));

  // Define quick actions for the crew portal
  const quickActions = [
    {
      id: "clock-in",
      label: "Clock In",
      icon: "📍",
      onClick: () => router.push('/crew/dashboard'),
      variant: "primary" as const,
    },
    {
      id: "photos",
      label: "Photos",
      icon: "📸",
      onClick: () => router.push('/crew/photos'),
      variant: "secondary" as const,
    },
    {
      id: "time-log",
      label: "Time Log",
      icon: "⏱️",
      onClick: () => router.push('/crew/time-tracking'),
      variant: "secondary" as const,
      badge: activeTimeEntries.length > 0 ? String(activeTimeEntries.length) : undefined,
    },
    {
      id: "work-orders",
      label: "Work Orders",
      icon: "📋",
      onClick: () => router.push('/crew/work-orders'),
      variant: "secondary" as const,
      badge: todaysWorkOrders.length > 0 ? String(todaysWorkOrders.length) : undefined,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "warning";
      case "in_progress": return "success";
      case "completed": return "info";
      case "paused": return "secondary";
      default: return "default";
    }
  };

  const activeCrew = crewMembers.filter(c => c.isActive).length;
  
  return (
    <AppLayout
      title="Crew Portal"
      subtitle="Field Operations & Time Tracking"
      headerActions={
        <div className="text-right">
          <div className="text-sm text-[var(--font-secondary)]">Active Crews</div>
          <div className="text-2xl font-bold text-[var(--accent-green)]">
            {activeCrew}
          </div>
        </div>
      }
      bottomActions={
        <>
          <Button variant="primary" fullWidth>
            🚨 Emergency
          </Button>
        </>
      }
    >
      {/* Quick Actions */}
      <div className="mb-6">
        <QuickActions
          actions={quickActions}
          layout="grid"
        />
      </div>

      {/* Today's Work Orders */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[var(--font-primary)] mb-4">
          Today's Work Orders ({todaysWorkOrders.length})
        </h2>
        
        <AppGrid cols={3} gap="md">
          {todaysWorkOrders.length === 0 ? (
            <AppGridItem span={3}>
              <Card variant="flat" padding="lg">
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📅</div>
                  <div className="text-[var(--font-secondary)] text-lg font-medium">
                    No work orders scheduled for today
                  </div>
                  <div className="text-[var(--font-secondary)] text-sm mt-2">
                    Check the calendar for upcoming jobs
                  </div>
                </div>
              </Card>
            </AppGridItem>
          ) : (
            todaysWorkOrders.map((workOrder) => (
              <AppGridItem key={workOrder.id || workOrder._id}>
                <Card 
                  interactive
                  padding="md"
                  variant={workOrder.status === "in_progress" ? "selected" : "default"}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-bold text-[var(--font-primary)] text-lg">
                        {workOrder.projectNumber}
                      </div>
                      <div className="text-[var(--font-secondary)] text-sm">
                        {workOrder.customerName}
                      </div>
                      {workOrder.phase && (
                        <div className="text-[var(--accent-green)] text-xs font-medium mt-1">
                          {workOrder.phase}
                        </div>
                      )}
                    </div>
                    <Badge variant={getStatusColor(workOrder.status) as any}>
                      {workOrder.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 text-sm mb-4">
                    <div className="flex items-start gap-2 text-[var(--font-primary)]">
                      <span>📍</span>
                      <span className="flex-1">{workOrder.propertyAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--font-primary)]">
                      <span>🏷️</span>
                      <span>{workOrder.packageType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--font-primary)]">
                      <span>📏</span>
                      <span className="font-semibold">{workOrder.workAreaAcreage} acres</span>
                    </div>
                    {workOrder.totalValue && (
                      <div className="flex items-center gap-2 text-[var(--amber)] font-medium">
                        <span>💰</span>
                        <span>${workOrder.totalValue.toLocaleString()}</span>
                      </div>
                    )}
                    {workOrder.assignedCrew && (
                      <div className="flex items-center gap-2 text-[var(--accent-green)] font-medium">
                        <span>👥</span>
                        <span>{workOrder.assignedCrew}</span>
                      </div>
                    )}
                    {workOrder.progress > 0 && (
                      <div className="flex items-center gap-2">
                        <span>📊</span>
                        <div className="flex-1 bg-[var(--soft-gray)] rounded-full h-2">
                          <div 
                            className="bg-[var(--accent-green)] h-2 rounded-full transition-all"
                            style={{ width: `${workOrder.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[var(--accent-green)] font-medium text-xs">
                          {workOrder.progress}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {workOrder.status === "scheduled" && (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        fullWidth
                        onClick={() => setSelectedWorkOrder(workOrder._id)}
                      >
                        🚀 Start Work
                      </Button>
                    )}
                    {workOrder.status === "in_progress" && (
                      <Button 
                        variant="warning" 
                        size="sm" 
                        fullWidth
                      >
                        ⏸️ Pause Work
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-shrink-0"
                    >
                      📋
                    </Button>
                  </div>
                </Card>
              </AppGridItem>
            ))
          )}
        </AppGrid>
      </div>

      {/* Active Time Tracking */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[var(--font-primary)] mb-4">
          Active Time Tracking ({activeTimeEntries.length})
        </h2>
        
        {activeTimeEntries.length > 0 ? (
          <div className="space-y-4">
            {activeTimeEntries.map((entry) => (
              <Card key={entry._id} variant="elevated" padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 bg-[var(--hot-red)] rounded-full animate-pulse"></span>
                      <div className="font-semibold text-[var(--accent-green)] text-lg">
                        {entry.activityType.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    <div className="text-sm text-[var(--font-secondary)] mb-1">
                      Started: {new Date(entry.startTime).toLocaleTimeString()}
                    </div>
                    <div className="text-sm text-[var(--font-primary)]">
                      {entry.description}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-3">
                    <div className="text-2xl font-bold text-[var(--accent-green)]">
                      {Math.floor((Date.now() - entry.startTime) / (1000 * 60))}m
                    </div>
                    <Button variant="error" size="sm">
                      ⏹️ Stop
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="flat" padding="lg">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⏱️</div>
              <div className="text-[var(--font-secondary)] text-lg font-medium">
                No active time tracking
              </div>
              <div className="text-[var(--font-secondary)] text-sm mt-2">
                Start work on a project to begin tracking
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Crew Status */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[var(--font-primary)] mb-4">
          Crew Status
        </h2>
        
        <AppGrid cols={3} gap="md">
          {crewMembers.map((crew) => (
            <AppGridItem key={crew.id}>
              <Card 
                padding="md"
                variant={crew.isActive ? "elevated" : "default"}
                className={crew.isActive ? "border-[var(--accent-green)]/30" : ""}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-[var(--font-primary)]">
                    {crew.name}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    crew.isActive ? 'bg-[var(--accent-green)]' : 'bg-[var(--soft-gray)]'
                  }`}></div>
                </div>
                
                <div className="text-sm text-[var(--font-secondary)] mb-3">
                  {crew.role}
                </div>
                
                {crew.currentWorkOrder && (
                  <div className="text-xs text-[var(--accent-green)] mb-3 flex items-center gap-1">
                    <span>📋</span>
                    <span>Working on {crew.currentWorkOrder}</span>
                  </div>
                )}
                
                <Badge variant={crew.isActive ? "success" : "default"} size="sm">
                  {crew.isActive ? "Active" : "Off Duty"}
                </Badge>
              </Card>
            </AppGridItem>
          ))}
        </AppGrid>
      </div>

      {/* Crew Applications */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[var(--font-primary)] mb-4">
          Crew Applications
        </h2>
        
        <AppGrid cols={3} gap="md">
          <AppGridItem>
            <Card 
              interactive
              padding="lg"
              onClick={() => router.push('/crew/dashboard')}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">📍</div>
                <div className="font-semibold text-[var(--font-primary)] mb-2 text-lg">
                  Crew Dashboard
                </div>
                <div className="text-sm text-[var(--font-secondary)]">
                  Clock in/out, GPS tracking, daily overview
                </div>
              </div>
            </Card>
          </AppGridItem>
          
          <AppGridItem>
            <Card 
              interactive
              padding="lg"
              onClick={() => router.push('/crew/time-tracking')}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">⏱️</div>
                <div className="font-semibold text-[var(--font-primary)] mb-2 text-lg">
                  Time Tracking
                </div>
                <div className="text-sm text-[var(--font-secondary)]">
                  Log activities, equipment usage, acreage
                </div>
              </div>
            </Card>
          </AppGridItem>
          
          <AppGridItem>
            <Card 
              interactive
              padding="lg"
              onClick={() => router.push('/crew/photos')}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">📸</div>
                <div className="font-semibold text-[var(--font-primary)] mb-2 text-lg">
                  Photo Documentation
                </div>
                <div className="text-sm text-[var(--font-secondary)]">
                  Before/after shots, progress photos
                </div>
              </div>
            </Card>
          </AppGridItem>
          
          <AppGridItem>
            <Card 
              interactive
              padding="lg"
              onClick={() => router.push('/crew/work-orders')}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">📋</div>
                <div className="font-semibold text-[var(--font-primary)] mb-2 text-lg">
                  Work Orders
                </div>
                <div className="text-sm text-[var(--font-secondary)]">
                  View jobs, start/stop work
                </div>
              </div>
            </Card>
          </AppGridItem>
          
          <AppGridItem>
            <Card 
              interactive
              padding="lg"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">🗺️</div>
                <div className="font-semibold text-[var(--font-primary)] mb-2 text-lg">
                  Site Mapping
                </div>
                <div className="text-sm text-[var(--font-secondary)]">
                  Huntwise integration, work areas
                </div>
              </div>
            </Card>
          </AppGridItem>
          
          <AppGridItem>
            <Card 
              interactive
              padding="lg"
              variant="alert"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">🚨</div>
                <div className="font-semibold mb-2 text-lg">
                  Emergency
                </div>
                <div className="text-sm opacity-90">
                  Contact office, safety protocols
                </div>
              </div>
            </Card>
          </AppGridItem>
        </AppGrid>
      </div>

    </AppLayout>
  );
}