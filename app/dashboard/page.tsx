"use client";

import { useState } from "react";
import { TREESHOP_BUSINESS_DATA } from "@/lib/treeShopData";
import AppLayout from "@/components/layout/AppLayout";
import { AppGrid, AppGridItem } from "@/components/layout/AppGrid";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "quarter">("month");
  
  const { kpis, activeProjects, recentLeads, crew, equipment } = TREESHOP_BUSINESS_DATA;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress": return "success";
      case "scheduled": return "warning";
      case "completed": return "info";
      case "hot": return "error";
      case "qualified": return "success";
      case "new": return "info";
      default: return "default";
    }
  };

  return (
    <AppLayout
      title="TreeShop Dashboard"
      subtitle="Business Operations & Performance Metrics"
      headerActions={
        <div className="flex gap-2">
          <Button 
            variant={selectedPeriod === "week" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedPeriod("week")}
          >
            Week
          </Button>
          <Button 
            variant={selectedPeriod === "month" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedPeriod("month")}
          >
            Month
          </Button>
          <Button 
            variant={selectedPeriod === "quarter" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedPeriod("quarter")}
          >
            Quarter
          </Button>
        </div>
      }
    >
      {/* KPI Overview */}
      <div className="mb-8">
        <AppGrid cols={4} gap="md">
          <AppGridItem>
            <Card padding="md" variant="elevated">
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--accent-green)] mb-2">
                  {formatCurrency(kpis.monthlyRevenue)}
                </div>
                <div className="text-[var(--font-secondary)] text-sm">Monthly Revenue</div>
                <div className="text-[var(--accent-green)] text-xs font-medium mt-1">
                  ↗ +23% vs last month
                </div>
              </div>
            </Card>
          </AppGridItem>

          <AppGridItem>
            <Card padding="md" variant="elevated">
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--soft-blue)] mb-2">
                  {kpis.activeProjects}
                </div>
                <div className="text-[var(--font-secondary)] text-sm">Active Projects</div>
                <div className="text-[var(--amber)] text-xs font-medium mt-1">
                  {formatCurrency(kpis.averageProjectValue)} avg
                </div>
              </div>
            </Card>
          </AppGridItem>

          <AppGridItem>
            <Card padding="md" variant="elevated">
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--amber)] mb-2">
                  {kpis.totalLeads}
                </div>
                <div className="text-[var(--font-secondary)] text-sm">Total Leads</div>
                <div className="text-[var(--accent-green)] text-xs font-medium mt-1">
                  {kpis.conversionRate}% conversion
                </div>
              </div>
            </Card>
          </AppGridItem>

          <AppGridItem>
            <Card padding="md" variant="elevated">
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--soft-pink)] mb-2">
                  {kpis.totalAcresCleared.toFixed(1)}
                </div>
                <div className="text-[var(--font-secondary)] text-sm">Acres Cleared</div>
                <div className="text-[var(--accent-green)] text-xs font-medium mt-1">
                  {kpis.customerSatisfaction}% satisfaction
                </div>
              </div>
            </Card>
          </AppGridItem>
        </AppGrid>
      </div>

      {/* Active Projects */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--font-primary)] mb-4">
          Active Projects ({activeProjects.length})
        </h2>
        <AppGrid cols={3} gap="md">
          {activeProjects.map((project) => (
            <AppGridItem key={project.id}>
              <Card 
                padding="md" 
                variant={project.status === "in_progress" ? "selected" : "elevated"}
                interactive
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-bold text-[var(--font-primary)] text-lg">
                      {project.projectNumber}
                    </div>
                    <div className="text-[var(--font-secondary)] text-sm">
                      {project.customerName}
                    </div>
                    <div className="text-[var(--accent-green)] text-xs font-medium mt-1">
                      {project.phase}
                    </div>
                  </div>
                  <Badge variant={getStatusBadge(project.status) as any}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--font-secondary)]">Value:</span>
                    <span className="font-semibold text-[var(--amber)]">
                      {formatCurrency(project.totalValue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--font-secondary)]">Acreage:</span>
                    <span className="font-semibold text-[var(--font-primary)]">
                      {project.workAreaAcreage} acres
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--font-secondary)]">Crew:</span>
                    <span className="text-[var(--accent-green)] font-medium text-xs">
                      {project.assignedCrew}
                    </span>
                  </div>
                </div>

                {project.progress > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--font-secondary)]">Progress</span>
                      <span className="text-[var(--accent-green)] font-medium">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="bg-[var(--soft-gray)] rounded-full h-2">
                      <div 
                        className="bg-[var(--accent-green)] h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="text-xs text-[var(--font-secondary)]">
                  📍 {project.propertyAddress}
                </div>
              </Card>
            </AppGridItem>
          ))}
        </AppGrid>
      </div>

      {/* Recent Leads */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--font-primary)] mb-4">
          Recent Leads ({recentLeads.length})
        </h2>
        <AppGrid cols={3} gap="md">
          {recentLeads.map((lead) => (
            <AppGridItem key={lead.id}>
              <Card padding="md" interactive>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-[var(--font-primary)]">
                      {lead.name}
                    </div>
                    <div className="text-[var(--font-secondary)] text-sm">
                      {lead.email}
                    </div>
                    <div className="text-[var(--font-secondary)] text-sm">
                      {lead.phone}
                    </div>
                  </div>
                  <Badge variant={getStatusBadge(lead.status) as any}>
                    {lead.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--font-secondary)]">Acreage:</span>
                    <span className="font-semibold text-[var(--font-primary)]">
                      {lead.acreage} acres
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--font-secondary)]">Est. Value:</span>
                    <span className="font-semibold text-[var(--amber)]">
                      {formatCurrency(lead.estimatedValue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--font-secondary)]">Source:</span>
                    <span className="text-[var(--accent-green)] font-medium text-xs">
                      {lead.leadSource}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-[var(--font-secondary)] mb-3">
                  📍 {lead.address}
                </div>

                {lead.notes && (
                  <div className="text-xs text-[var(--font-primary)] bg-[var(--soft-gray)] p-2 rounded">
                    💬 {lead.notes}
                  </div>
                )}
              </Card>
            </AppGridItem>
          ))}
        </AppGrid>
      </div>

      {/* Crew & Equipment Status */}
      <AppGrid cols={2} gap="lg">
        <AppGridItem>
          <Card padding="md">
            <h3 className="text-xl font-bold text-[var(--font-primary)] mb-4">
              Crew Status ({crew.filter(c => c.isActive).length}/{crew.length})
            </h3>
            <div className="space-y-3">
              {crew.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-[var(--soft-gray)] rounded-lg">
                  <div>
                    <div className="font-semibold text-[var(--font-primary)]">
                      {member.name}
                    </div>
                    <div className="text-[var(--font-secondary)] text-sm">
                      {member.role}
                    </div>
                    {member.currentProject && (
                      <div className="text-[var(--accent-green)] text-xs font-medium">
                        📋 {member.currentProject}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      member.isActive ? 'bg-[var(--accent-green)]' : 'bg-[var(--medium-gray)]'
                    }`}></div>
                    <Badge variant={member.isActive ? "success" : "default"} size="sm">
                      {member.isActive ? "Active" : "Off"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </AppGridItem>

        <AppGridItem>
          <Card padding="md">
            <h3 className="text-xl font-bold text-[var(--font-primary)] mb-4">
              Equipment Status ({equipment.filter(e => e.status === "active").length}/{equipment.length})
            </h3>
            <div className="space-y-3">
              {equipment.map((item) => (
                <div key={item.id} className="p-3 bg-[var(--soft-gray)] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-[var(--font-primary)] text-sm">
                      {item.name}
                    </div>
                    <Badge variant="success" size="sm">
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-[var(--font-secondary)] text-xs">
                    {item.type}
                  </div>
                  {item.operator && (
                    <div className="text-[var(--accent-green)] text-xs font-medium">
                      👤 {item.operator}
                    </div>
                  )}
                  <div className="text-[var(--font-secondary)] text-xs">
                    📍 {item.location}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </AppGridItem>
      </AppGrid>
    </AppLayout>
  );
}