"use client";

import { useMemo } from "react";

interface Lead {
  _id: string;
  status: string;
  createdAt: number;
  estimatedTotal?: number;
  siteSource: string;
  leadScore?: string;
}

interface LeadKPIDashboardProps {
  leads: Lead[];
}

export default function LeadKPIDashboard({ leads }: LeadKPIDashboardProps) {
  const kpis = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;
    const monthMs = 30 * dayMs;

    // Time-based filtering
    const todayLeads = leads.filter(
      (l) => now - l.createdAt < dayMs
    );
    const weekLeads = leads.filter(
      (l) => now - l.createdAt < weekMs
    );
    const lastWeekLeads = leads.filter(
      (l) => now - l.createdAt >= weekMs && now - l.createdAt < 2 * weekMs
    );
    const monthLeads = leads.filter(
      (l) => now - l.createdAt < monthMs
    );

    // Status breakdown
    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Conversion metrics
    const qualifiedLeads = leads.filter((l) => 
      ["qualified", "won"].includes(l.status)
    );
    const wonLeads = leads.filter((l) => l.status === "won");
    const conversionRate = leads.length > 0 
      ? ((wonLeads.length / leads.length) * 100).toFixed(1)
      : "0";
    const qualificationRate = leads.length > 0
      ? ((qualifiedLeads.length / leads.length) * 100).toFixed(1)
      : "0";

    // Revenue metrics
    const totalPipeline = leads
      .filter((l) => l.estimatedTotal && !["lost", "won"].includes(l.status))
      .reduce((sum, l) => sum + (l.estimatedTotal || 0), 0);
    
    const wonRevenue = wonLeads.reduce(
      (sum, l) => sum + (l.estimatedTotal || 0), 0
    );

    const avgDealSize = wonLeads.length > 0
      ? wonRevenue / wonLeads.length
      : 0;

    // Source performance
    const sourceMetrics = leads.reduce((acc, lead) => {
      if (!acc[lead.siteSource]) {
        acc[lead.siteSource] = {
          total: 0,
          won: 0,
          value: 0,
        };
      }
      acc[lead.siteSource].total++;
      if (lead.status === "won") {
        acc[lead.siteSource].won++;
        acc[lead.siteSource].value += lead.estimatedTotal || 0;
      }
      return acc;
    }, {} as Record<string, { total: number; won: number; value: number }>);

    // Response time (mock - would need actual contact timestamps)
    const avgResponseTime = "2.3 hrs";

    // Week over week growth
    const weekGrowth = lastWeekLeads.length > 0
      ? (((weekLeads.length - lastWeekLeads.length) / lastWeekLeads.length) * 100).toFixed(1)
      : "0";

    return {
      overview: {
        totalLeads: leads.length,
        todayLeads: todayLeads.length,
        weekLeads: weekLeads.length,
        monthLeads: monthLeads.length,
        weekGrowth: parseFloat(weekGrowth),
      },
      conversion: {
        conversionRate: parseFloat(conversionRate),
        qualificationRate: parseFloat(qualificationRate),
        wonLeads: wonLeads.length,
        lostLeads: statusCounts["lost"] || 0,
      },
      revenue: {
        totalPipeline,
        wonRevenue,
        avgDealSize,
        projectedMonthly: (wonRevenue / monthLeads.length) * 30,
      },
      performance: {
        avgResponseTime,
        sourceMetrics,
        statusCounts,
      },
    };
  }, [leads]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-lg">
          <h3 className="text-sm text-blue-100 mb-2">Conversion Rate</h3>
          <p className="text-3xl font-bold">{kpis.conversion.conversionRate}%</p>
          <div className="mt-2 text-sm text-blue-100">
            {kpis.conversion.wonLeads} won / {kpis.overview.totalLeads} total
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-lg">
          <h3 className="text-sm text-green-100 mb-2">Pipeline Value</h3>
          <p className="text-3xl font-bold">{formatCurrency(kpis.revenue.totalPipeline)}</p>
          <div className="mt-2 text-sm text-green-100">
            Active opportunities
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-lg">
          <h3 className="text-sm text-purple-100 mb-2">Avg Deal Size</h3>
          <p className="text-3xl font-bold">{formatCurrency(kpis.revenue.avgDealSize)}</p>
          <div className="mt-2 text-sm text-purple-100">
            Per won deal
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 rounded-lg">
          <h3 className="text-sm text-yellow-100 mb-2">Week Growth</h3>
          <p className="text-3xl font-bold">
            {kpis.overview.weekGrowth > 0 ? "+" : ""}{kpis.overview.weekGrowth}%
          </p>
          <div className="mt-2 text-sm text-yellow-100">
            {kpis.overview.weekLeads} this week
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-xs text-gray-400 mb-1">Today</h4>
          <p className="text-2xl font-bold text-blue-400">{kpis.overview.todayLeads}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-xs text-gray-400 mb-1">This Week</h4>
          <p className="text-2xl font-bold text-green-400">{kpis.overview.weekLeads}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-xs text-gray-400 mb-1">This Month</h4>
          <p className="text-2xl font-bold text-purple-400">{kpis.overview.monthLeads}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-xs text-gray-400 mb-1">Qualified</h4>
          <p className="text-2xl font-bold text-yellow-400">
            {kpis.conversion.qualificationRate}%
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-xs text-gray-400 mb-1">Response</h4>
          <p className="text-2xl font-bold text-cyan-400">{kpis.performance.avgResponseTime}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-xs text-gray-400 mb-1">Won Revenue</h4>
          <p className="text-xl font-bold text-green-400">
            {formatCurrency(kpis.revenue.wonRevenue)}
          </p>
        </div>
      </div>

      {/* Source Performance */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Lead Source Performance</h3>
        <div className="space-y-3">
          {Object.entries(kpis.performance.sourceMetrics).map(([source, metrics]) => {
            const convRate = metrics.total > 0 
              ? ((metrics.won / metrics.total) * 100).toFixed(1)
              : "0";
            return (
              <div key={source} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    source === "treeshop.app" ? "bg-green-600" : 
                    source === "fltreeshop.com" ? "bg-blue-600" : 
                    "bg-gray-600"
                  }`}>
                    {source}
                  </span>
                  <span className="text-sm text-gray-400">
                    {metrics.total} leads • {convRate}% conversion
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(metrics.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Pipeline */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Pipeline Status</h3>
        <div className="flex gap-2">
          {Object.entries(kpis.performance.statusCounts).map(([status, count]) => {
            const percentage = kpis.overview.totalLeads > 0
              ? ((count / kpis.overview.totalLeads) * 100).toFixed(1)
              : "0";
            return (
              <div
                key={status}
                className="flex-1 bg-gray-700 rounded p-3 text-center"
              >
                <p className="text-2xl font-bold mb-1">{count}</p>
                <p className="text-xs text-gray-400">{status}</p>
                <p className="text-xs text-gray-500">{percentage}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}