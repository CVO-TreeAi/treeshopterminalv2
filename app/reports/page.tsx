"use client";

import { useState, useEffect } from "react";
// TODO: Replace with actual Convex hooks when backend is deployed
// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";
import { useQuery } from "@/lib/mockHooks";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import DirectoryLayout from "@/components/shared/DirectoryLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface KPIData {
  totalLeads: number;
  totalProposals: number;
  totalCustomers: number;
  conversionRate: number;
  averageProjectValue: number;
  monthlyRevenue: number;
  activeProjects: number;
  completedProjects: number;
}

export default function ReportsPage() {
  const [kpiData, setKpiData] = useState<KPIData>({
    totalLeads: 0,
    totalProposals: 0,
    totalCustomers: 0,
    conversionRate: 0,
    averageProjectValue: 0,
    monthlyRevenue: 0,
    activeProjects: 0,
    completedProjects: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "quarter" | "year">("month");

  // Initialize loading state
  useEffect(() => {
    setLoading(true);
  }, [selectedPeriod]);

  // Use real data from Convex queries (currently mocked)
  const leadStats = useQuery('api.leads.getLeadStats');
  const proposalStats = useQuery('api.proposals.getProposalStats');
  const workOrderStats = useQuery('api.workOrders.getWorkOrderStats');
  const invoiceStats = useQuery('api.invoices.getInvoiceStats');

  useEffect(() => {
    if (leadStats && proposalStats && workOrderStats && invoiceStats) {
      setKpiData({
        totalLeads: leadStats.total,
        totalProposals: proposalStats.total,
        totalCustomers: leadStats.total, // Customers are derived from leads
        conversionRate: leadStats.conversionRate,
        averageProjectValue: 0,
        monthlyRevenue: 0,
        activeProjects: 0,
        completedProjects: 0
      });
      setLoading(false);
    }
  }, [leadStats, proposalStats, workOrderStats, invoiceStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  return (
    <AuthenticatedLayout>
      <DirectoryLayout
        title="Business Reports & KPIs"
        subtitle="Track your business performance and growth metrics"
        actions={
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <Button onClick={loadKPIData} variant="secondary" size="sm">
              ↻ Refresh
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-400">Loading reports...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{kpiData.totalLeads}</div>
                  <div className="text-sm text-gray-400">Total Leads</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{kpiData.totalProposals}</div>
                  <div className="text-sm text-gray-400">Proposals</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{kpiData.totalCustomers}</div>
                  <div className="text-sm text-gray-400">Customers</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">
                    {formatPercentage(kpiData.conversionRate)}
                  </div>
                  <div className="text-sm text-gray-400">Conversion Rate</div>
                </div>
              </Card>
            </div>

            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {formatCurrency(kpiData.monthlyRevenue)}
                  </div>
                  <div className="text-sm text-gray-400">Monthly Revenue</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">
                    {formatCurrency(kpiData.averageProjectValue)}
                  </div>
                  <div className="text-sm text-gray-400">Avg Project Value</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{kpiData.activeProjects}</div>
                  <div className="text-sm text-gray-400">Active Projects</div>
                </div>
              </Card>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
                <div className="h-64 flex items-center justify-center bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📈</div>
                    <p className="text-gray-400">Chart will appear when data is available</p>
                  </div>
                </div>
              </Card>
              
              <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Lead Sources</h3>
                <div className="h-64 flex items-center justify-center bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🥧</div>
                    <p className="text-gray-400">Chart will appear when data is available</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Export Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Export Reports</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary">
                  📊 Export KPIs (CSV)
                </Button>
                <Button variant="secondary">
                  📈 Export Revenue Report (PDF)
                </Button>
                <Button variant="secondary">
                  👥 Export Lead Report (CSV)
                </Button>
                <Button variant="secondary">
                  📄 Export Proposals (PDF)
                </Button>
              </div>
            </Card>

            {/* Empty State */}
            {kpiData.totalLeads === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2 text-white">No Data Yet</h3>
                <p className="text-gray-400 mb-6">
                  Start by creating leads and proposals. Your business metrics will appear here automatically.
                </p>
                <Button
                  onClick={() => window.location.href = "/leads"}
                  variant="primary"
                >
                  Manage Leads
                </Button>
              </div>
            )}
          </div>
        )}
      </DirectoryLayout>
    </AuthenticatedLayout>
  );
}