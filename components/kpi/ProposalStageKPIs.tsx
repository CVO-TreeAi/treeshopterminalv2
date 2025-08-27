"use client";

interface Proposal {
  _id: string;
  proposalNumber: string;
  status: "draft" | "sent" | "viewed" | "approved" | "rejected" | "expired";
  total: number;
  createdAt: number;
  sentAt?: number;
  viewedAt?: number;
  approvedAt?: number;
  validUntil: number;
  version: number;
}

interface ProposalStageKPIsProps {
  proposals: Proposal[];
}

export default function ProposalStageKPIs({ proposals }: ProposalStageKPIsProps) {
  const now = Date.now();
  const today = new Date().setHours(0, 0, 0, 0);
  const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const monthAgo = now - (30 * 24 * 60 * 60 * 1000);

  // Proposal funnel
  const funnel = {
    draft: proposals.filter(p => p.status === "draft").length,
    sent: proposals.filter(p => p.status === "sent").length,
    viewed: proposals.filter(p => p.status === "viewed").length,
    approved: proposals.filter(p => p.status === "approved").length,
    rejected: proposals.filter(p => p.status === "rejected").length,
    expired: proposals.filter(p => p.status === "expired").length,
  };

  // Time to view/approve metrics
  const viewedProposals = proposals.filter(p => p.viewedAt && p.sentAt);
  const avgTimeToView = viewedProposals.length > 0
    ? viewedProposals.reduce((sum, p) => {
        const viewTime = (p.viewedAt! - p.sentAt!) / (1000 * 60 * 60); // hours
        return sum + viewTime;
      }, 0) / viewedProposals.length
    : 0;

  const approvedProposals = proposals.filter(p => p.approvedAt && p.sentAt);
  const avgTimeToApprove = approvedProposals.length > 0
    ? approvedProposals.reduce((sum, p) => {
        const approveTime = (p.approvedAt! - p.sentAt!) / (1000 * 60 * 60 * 24); // days
        return sum + approveTime;
      }, 0) / approvedProposals.length
    : 0;

  // Win/loss rates
  const totalDecided = funnel.approved + funnel.rejected;
  const winRate = totalDecided > 0 ? ((funnel.approved / totalDecided) * 100).toFixed(1) : "0";
  const viewToWinRate = funnel.viewed > 0 ? ((funnel.approved / funnel.viewed) * 100).toFixed(1) : "0";

  // Revenue metrics
  const approvedRevenue = proposals
    .filter(p => p.status === "approved")
    .reduce((sum, p) => sum + p.total, 0);

  const pipelineValue = proposals
    .filter(p => ["sent", "viewed"].includes(p.status))
    .reduce((sum, p) => sum + p.total, 0);

  const avgDealSize = proposals.length > 0
    ? proposals.reduce((sum, p) => sum + p.total, 0) / proposals.length
    : 0;

  // Proposal velocity
  const todayProposals = proposals.filter(p => new Date(p.createdAt).setHours(0,0,0,0) === today);
  const weekProposals = proposals.filter(p => p.createdAt >= weekAgo);
  const monthProposals = proposals.filter(p => p.createdAt >= monthAgo);

  // Version tracking
  const revisedProposals = proposals.filter(p => p.version > 1);
  const avgVersions = proposals.length > 0
    ? proposals.reduce((sum, p) => sum + p.version, 0) / proposals.length
    : 1;

  // Expiration tracking
  const expiringProposals = proposals.filter(p => {
    const daysLeft = (p.validUntil - now) / (1000 * 60 * 60 * 24);
    return p.status === "sent" && daysLeft > 0 && daysLeft <= 7;
  });

  const kpiGroups = [
    {
      title: "Proposal Pipeline",
      kpis: [
        {
          label: "Active Proposals",
          value: funnel.sent + funnel.viewed,
          color: "text-blue-400",
          icon: "📊",
          subtext: `${funnel.sent} sent, ${funnel.viewed} viewed`,
        },
        {
          label: "Pipeline Value",
          value: `$${(pipelineValue / 1000).toFixed(0)}k`,
          color: "text-green-400",
          icon: "💰",
          subtext: "Total opportunity",
        },
        {
          label: "Avg Deal Size",
          value: `$${(avgDealSize / 1000).toFixed(0)}k`,
          color: "text-purple-400",
          icon: "📈",
        },
      ],
    },
    {
      title: "Conversion Metrics",
      kpis: [
        {
          label: "Win Rate",
          value: winRate + "%",
          color: parseFloat(winRate) > 50 ? "text-green-400" : parseFloat(winRate) > 30 ? "text-yellow-400" : "text-red-400",
          icon: "🏆",
          subtext: `${funnel.approved} won / ${totalDecided} decided`,
        },
        {
          label: "View to Win",
          value: viewToWinRate + "%",
          color: parseFloat(viewToWinRate) > 30 ? "text-green-400" : "text-yellow-400",
          icon: "👀",
          subtext: "Of viewed proposals",
        },
        {
          label: "Approval Rate",
          value: `${funnel.approved}/${funnel.sent + funnel.viewed}`,
          color: "text-cyan-400",
          percentage: (funnel.sent + funnel.viewed) > 0 
            ? ((funnel.approved / (funnel.sent + funnel.viewed)) * 100).toFixed(0) + "%"
            : "0%",
        },
      ],
    },
    {
      title: "Response Times",
      kpis: [
        {
          label: "Time to View",
          value: avgTimeToView > 0 ? `${avgTimeToView.toFixed(1)}h` : "N/A",
          color: avgTimeToView < 24 ? "text-green-400" : avgTimeToView < 48 ? "text-yellow-400" : "text-red-400",
          icon: "⏱️",
          subtext: "After sending",
        },
        {
          label: "Time to Approve",
          value: avgTimeToApprove > 0 ? `${avgTimeToApprove.toFixed(1)}d` : "N/A",
          color: avgTimeToApprove < 3 ? "text-green-400" : avgTimeToApprove < 7 ? "text-yellow-400" : "text-red-400",
          icon: "✅",
          subtext: "After sending",
        },
        {
          label: "Expiring Soon",
          value: expiringProposals.length,
          color: expiringProposals.length > 0 ? "text-yellow-400" : "text-gray-400",
          icon: "⚠️",
          subtext: "Within 7 days",
        },
      ],
    },
    {
      title: "Proposal Activity",
      kpis: [
        {
          label: "Today",
          value: todayProposals.length,
          color: "text-green-400",
          icon: "🔥",
        },
        {
          label: "This Week",
          value: weekProposals.length,
          color: "text-blue-400",
          icon: "📅",
        },
        {
          label: "This Month",
          value: monthProposals.length,
          color: "text-purple-400",
          icon: "📆",
        },
      ],
    },
    {
      title: "Revenue Performance",
      kpis: [
        {
          label: "Approved Revenue",
          value: `$${(approvedRevenue / 1000).toFixed(0)}k`,
          color: "text-green-500",
          icon: "💵",
          subtext: "Total won",
        },
        {
          label: "Lost Revenue",
          value: `$${(proposals.filter(p => p.status === "rejected").reduce((sum, p) => sum + p.total, 0) / 1000).toFixed(0)}k`,
          color: "text-red-400",
          icon: "❌",
          subtext: "Total lost",
        },
        {
          label: "Avg Revisions",
          value: avgVersions.toFixed(1),
          color: avgVersions < 2 ? "text-green-400" : "text-yellow-400",
          icon: "🔄",
          subtext: `${revisedProposals.length} revised`,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Groups */}
      {kpiGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-green-500 mb-4">{group.title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {group.kpis.map((kpi, index) => (
              <div key={index} className="bg-black p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs sm:text-sm text-gray-400">{kpi.label}</p>
                  {'icon' in kpi && kpi.icon && <span className="text-lg">{kpi.icon}</span>}
                </div>
                <p className={`text-2xl sm:text-3xl font-bold ${kpi.color}`}>
                  {kpi.value}
                </p>
                {kpi.percentage && (
                  <p className="text-xs text-gray-500 mt-1">{kpi.percentage}</p>
                )}
                {kpi.subtext && (
                  <p className="text-xs text-gray-500 mt-1">{kpi.subtext}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Proposal Funnel Visual */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-green-500 mb-4">Proposal Journey</h3>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          {[
            { label: "Draft", count: funnel.draft, color: "bg-gray-500" },
            { label: "Sent", count: funnel.sent, color: "bg-blue-500" },
            { label: "Viewed", count: funnel.viewed, color: "bg-yellow-500" },
            { label: "Approved", count: funnel.approved, color: "bg-green-500" },
            { label: "Rejected", count: funnel.rejected, color: "bg-red-500" },
          ].map((stage, index, arr) => (
            <div key={index} className="flex items-center w-full sm:w-auto">
              <div className="text-center flex-1 sm:flex-initial">
                <div className={`${stage.color} text-white font-bold rounded-lg px-3 py-2 sm:px-4 sm:py-3`}>
                  <p className="text-xs opacity-75">{stage.label}</p>
                  <p className="text-lg sm:text-2xl">{stage.count}</p>
                </div>
              </div>
              {index < arr.length - 1 && (
                <span className="mx-2 text-gray-500 hidden sm:block">→</span>
              )}
            </div>
          ))}
        </div>
        
        {/* Conversion Rate Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Conversion Rate</span>
            <span>{winRate}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div 
              className="bg-green-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${winRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}