"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface Lead {
  _id: string;
  status: string;
  createdAt: number;
  estimatedTotal?: number;
  leadScore?: string;
}

interface Proposal {
  _id: string;
  status: string;
  total: number;
  createdAt: number;
}

interface BusinessDashboardProps {
  leads?: Lead[];
  proposals?: Proposal[];
}

export default function BusinessDashboard({ leads = [], proposals = [] }: BusinessDashboardProps) {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "quarter">("week");
  
  const now = Date.now();
  const today = new Date().setHours(0, 0, 0, 0);
  const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
  const quarterAgo = now - (90 * 24 * 60 * 60 * 1000);

  // Get date range based on selection
  const getDateRange = () => {
    switch (timeRange) {
      case "today": return today;
      case "week": return weekAgo;
      case "month": return monthAgo;
      case "quarter": return quarterAgo;
      default: return weekAgo;
    }
  };

  const dateRange = getDateRange();

  // Filter data by time range
  const filteredLeads = leads.filter(l => l.createdAt >= dateRange);
  const filteredProposals = proposals.filter(p => p.createdAt >= dateRange);

  // Calculate business metrics
  const totalRevenue = proposals
    .filter(p => p.status === "approved")
    .reduce((sum, p) => sum + p.total, 0);

  const pipelineValue = [
    ...leads.filter(l => !["won", "lost"].includes(l.status))
      .map(l => l.estimatedTotal || 0),
    ...proposals.filter(p => ["sent", "viewed"].includes(p.status))
      .map(p => p.total),
  ].reduce((sum, val) => sum + val, 0);

  const conversionRate = {
    leadToProposal: leads.length > 0 
      ? ((proposals.length / leads.length) * 100).toFixed(1)
      : "0",
    proposalToWin: proposals.length > 0
      ? ((proposals.filter(p => p.status === "approved").length / proposals.length) * 100).toFixed(1)
      : "0",
  };

  // Activity metrics
  const todayActivity = {
    leads: leads.filter(l => new Date(l.createdAt).setHours(0,0,0,0) === today).length,
    proposals: proposals.filter(p => new Date(p.createdAt).setHours(0,0,0,0) === today).length,
  };

  // Health Score (0-100)
  const calculateHealthScore = () => {
    let score = 0;
    
    // Lead flow (30 points)
    if (filteredLeads.length > 0) score += Math.min(30, filteredLeads.length * 3);
    
    // Conversion rate (30 points)
    score += Math.min(30, parseFloat(conversionRate.proposalToWin) * 0.6);
    
    // Pipeline value (20 points)
    if (pipelineValue > 50000) score += 20;
    else if (pipelineValue > 25000) score += 15;
    else if (pipelineValue > 10000) score += 10;
    else if (pipelineValue > 0) score += 5;
    
    // Activity (20 points)
    if (todayActivity.leads > 0) score += 10;
    if (todayActivity.proposals > 0) score += 10;
    
    return Math.min(100, score);
  };

  const healthScore = calculateHealthScore();
  const healthStatus = 
    healthScore >= 80 ? { label: "Excellent", color: "text-green-500" } :
    healthScore >= 60 ? { label: "Good", color: "text-blue-400" } :
    healthScore >= 40 ? { label: "Fair", color: "text-yellow-400" } :
    { label: "Needs Attention", color: "text-red-400" };

  // Forecast calculation
  const avgDealSize = proposals.length > 0
    ? proposals.reduce((sum, p) => sum + p.total, 0) / proposals.length
    : 0;
  
  const monthlyRunRate = totalRevenue / (timeRange === "quarter" ? 3 : timeRange === "month" ? 1 : 0.25);
  const annualForecast = monthlyRunRate * 12;

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-500">Business Performance</h2>
        <div className="flex gap-2">
          {["today", "week", "month", "quarter"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeRange === range
                  ? "bg-green-500 text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Business Health Score */}
      <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg text-gray-400 mb-2">Business Health Score</h3>
            <div className="flex items-baseline gap-3">
              <span className={`text-5xl font-bold ${healthStatus.color}`}>
                {healthScore}
              </span>
              <span className="text-2xl text-gray-500">/100</span>
            </div>
            <p className={`mt-2 ${healthStatus.color}`}>{healthStatus.label}</p>
          </div>
          <div className="text-right">
            <div className="space-y-2">
              <Badge variant="info" size="sm">📈 {filteredLeads.length} New Leads</Badge>
              <Badge variant="success" size="sm">💼 {filteredProposals.length} Proposals</Badge>
              <Badge variant="warning" size="sm">🎯 {conversionRate.proposalToWin}% Win Rate</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 mb-1">Revenue</p>
              <p className="text-2xl font-bold text-green-500">
                ${(totalRevenue / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-gray-500 mt-1">Closed deals</p>
            </div>
            <span className="text-2xl">💵</span>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 mb-1">Pipeline</p>
              <p className="text-2xl font-bold text-blue-400">
                ${(pipelineValue / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-gray-500 mt-1">Open opportunities</p>
            </div>
            <span className="text-2xl">🎯</span>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 mb-1">Avg Deal</p>
              <p className="text-2xl font-bold text-purple-400">
                ${(avgDealSize / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-gray-500 mt-1">Per proposal</p>
            </div>
            <span className="text-2xl">📊</span>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 mb-1">Forecast</p>
              <p className="text-2xl font-bold text-yellow-400">
                ${(annualForecast / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-gray-500 mt-1">Annual projection</p>
            </div>
            <span className="text-2xl">📈</span>
          </div>
        </Card>
      </div>

      {/* Workflow Progress */}
      <Card>
        <h3 className="text-lg font-semibold text-green-500 mb-4">Workflow Progress</h3>
        <div className="space-y-4">
          {/* Lead → Proposal */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Lead → Proposal Conversion</span>
              <span className="text-white">{conversionRate.leadToProposal}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${conversionRate.leadToProposal}%` }}
              />
            </div>
          </div>

          {/* Proposal → Win */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Proposal → Win Conversion</span>
              <span className="text-white">{conversionRate.proposalToWin}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${conversionRate.proposalToWin}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-lg font-semibold text-green-500 mb-4">Today's Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="font-medium">New Leads</p>
                  <p className="text-xs text-gray-400">Inbound inquiries</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-400">{todayActivity.leads}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-medium">Proposals Created</p>
                  <p className="text-xs text-gray-400">Ready to send</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-400">{todayActivity.proposals}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-green-500 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 bg-gray-900 hover:bg-gray-800 rounded-lg transition-all text-left">
              <span className="text-xl block mb-1">📞</span>
              <p className="text-sm font-medium">Call Leads</p>
              <p className="text-xs text-gray-400">{leads.filter(l => l.status === "new").length} pending</p>
            </button>
            <button className="p-3 bg-gray-900 hover:bg-gray-800 rounded-lg transition-all text-left">
              <span className="text-xl block mb-1">📧</span>
              <p className="text-sm font-medium">Send Proposals</p>
              <p className="text-xs text-gray-400">{proposals.filter(p => p.status === "draft").length} drafts</p>
            </button>
            <button className="p-3 bg-gray-900 hover:bg-gray-800 rounded-lg transition-all text-left">
              <span className="text-xl block mb-1">👀</span>
              <p className="text-sm font-medium">Follow Up</p>
              <p className="text-xs text-gray-400">{proposals.filter(p => p.status === "viewed").length} viewed</p>
            </button>
            <button className="p-3 bg-gray-900 hover:bg-gray-800 rounded-lg transition-all text-left">
              <span className="text-xl block mb-1">📊</span>
              <p className="text-sm font-medium">Reports</p>
              <p className="text-xs text-gray-400">View all</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}