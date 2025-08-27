"use client";

interface Lead {
  _id: string;
  status: string;
  createdAt: number;
  estimatedTotal?: number;
  leadScore?: string;
  siteSource: string;
}

interface LeadStageKPIsProps {
  leads: Lead[];
}

export default function LeadStageKPIs({ leads }: LeadStageKPIsProps) {
  // Calculate lead-specific KPIs
  const now = Date.now();
  const today = new Date().setHours(0, 0, 0, 0);
  const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const monthAgo = now - (30 * 24 * 60 * 60 * 1000);

  // Response time calculations
  const contactedLeads = leads.filter(l => l.status === "contacted");
  const avgResponseTime = contactedLeads.length > 0 
    ? contactedLeads.reduce((sum, l) => {
        const responseTime = (now - l.createdAt) / (1000 * 60 * 60); // hours
        return sum + responseTime;
      }, 0) / contactedLeads.length
    : 0;

  // Lead quality metrics
  const qualityScores = {
    A: leads.filter(l => l.leadScore === "A").length,
    B: leads.filter(l => l.leadScore === "B").length,
    C: leads.filter(l => l.leadScore === "C").length,
    D: leads.filter(l => l.leadScore === "D").length,
  };

  // Conversion funnel
  const funnel = {
    new: leads.filter(l => l.status === "new").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    qualified: leads.filter(l => l.status === "qualified").length,
    proposal: leads.filter(l => l.status === "proposal").length,
    won: leads.filter(l => l.status === "won").length,
    lost: leads.filter(l => l.status === "lost").length,
  };

  // Lead velocity (new leads per period)
  const todayLeads = leads.filter(l => new Date(l.createdAt).setHours(0,0,0,0) === today);
  const weekLeads = leads.filter(l => l.createdAt >= weekAgo);
  const monthLeads = leads.filter(l => l.createdAt >= monthAgo);

  // Source performance
  const sourceMetrics = {
    treeshop: leads.filter(l => l.siteSource === "treeshop.app"),
    fltreeshop: leads.filter(l => l.siteSource === "fltreeshop.com"),
  };

  // Calculate conversion rates
  const qualificationRate = funnel.new > 0 
    ? ((funnel.qualified / funnel.new) * 100).toFixed(1)
    : "0";
  
  const winRate = (funnel.won + funnel.lost) > 0
    ? ((funnel.won / (funnel.won + funnel.lost)) * 100).toFixed(1)
    : "0";

  // Pipeline value
  const pipelineValue = leads
    .filter(l => !["won", "lost"].includes(l.status))
    .reduce((sum, l) => sum + (l.estimatedTotal || 0), 0);

  const kpiGroups = [
    {
      title: "Lead Velocity",
      kpis: [
        {
          label: "Today",
          value: todayLeads.length,
          color: "text-green-400",
          icon: "🔥",
        },
        {
          label: "This Week", 
          value: weekLeads.length,
          color: "text-blue-400",
          icon: "📈",
        },
        {
          label: "This Month",
          value: monthLeads.length,
          color: "text-purple-400",
          icon: "📊",
        },
      ],
    },
    {
      title: "Lead Quality",
      kpis: [
        {
          label: "A-Grade",
          value: qualityScores.A,
          color: "text-green-500",
          icon: "⭐",
          subtext: "Hot leads",
        },
        {
          label: "B-Grade",
          value: qualityScores.B,
          color: "text-blue-400",
          icon: "⭐",
          subtext: "Warm leads",
        },
        {
          label: "C/D-Grade",
          value: qualityScores.C + qualityScores.D,
          color: "text-gray-400",
          icon: "⭐",
          subtext: "Cold leads",
        },
      ],
    },
    {
      title: "Conversion Funnel",
      kpis: [
        {
          label: "New → Contacted",
          value: `${funnel.contacted}/${funnel.new}`,
          color: "text-blue-400",
          percentage: funnel.new > 0 ? ((funnel.contacted / funnel.new) * 100).toFixed(0) + "%" : "0%",
        },
        {
          label: "Contacted → Qualified",
          value: `${funnel.qualified}/${funnel.contacted}`,
          color: "text-purple-400",
          percentage: funnel.contacted > 0 ? ((funnel.qualified / funnel.contacted) * 100).toFixed(0) + "%" : "0%",
        },
        {
          label: "Win Rate",
          value: `${funnel.won}/${funnel.won + funnel.lost}`,
          color: funnel.won > funnel.lost ? "text-green-400" : "text-red-400",
          percentage: winRate + "%",
        },
      ],
    },
    {
      title: "Performance",
      kpis: [
        {
          label: "Avg Response",
          value: avgResponseTime > 0 ? `${avgResponseTime.toFixed(1)}h` : "N/A",
          color: avgResponseTime < 4 ? "text-green-400" : avgResponseTime < 8 ? "text-yellow-400" : "text-red-400",
          icon: "⏱️",
        },
        {
          label: "Qualification Rate",
          value: qualificationRate + "%",
          color: parseFloat(qualificationRate) > 30 ? "text-green-400" : "text-yellow-400",
          icon: "✅",
        },
        {
          label: "Pipeline Value",
          value: `$${(pipelineValue / 1000).toFixed(0)}k`,
          color: "text-green-400",
          icon: "💰",
        },
      ],
    },
    {
      title: "Source Performance",
      kpis: [
        {
          label: "TreeShop.app",
          value: sourceMetrics.treeshop.length,
          color: "text-green-400",
          percentage: leads.length > 0 
            ? ((sourceMetrics.treeshop.length / leads.length) * 100).toFixed(0) + "%"
            : "0%",
        },
        {
          label: "FLTreeShop.com",
          value: sourceMetrics.fltreeshop.length,
          color: "text-blue-400",
          percentage: leads.length > 0
            ? ((sourceMetrics.fltreeshop.length / leads.length) * 100).toFixed(0) + "%"
            : "0%",
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
                {'percentage' in kpi && kpi.percentage && (
                  <p className="text-xs text-gray-500 mt-1">{kpi.percentage}</p>
                )}
                {'subtext' in kpi && kpi.subtext && (
                  <p className="text-xs text-gray-500 mt-1">{kpi.subtext}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Conversion Funnel Visual */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-green-500 mb-4">Lead Journey</h3>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          {[
            { label: "New", count: funnel.new, color: "bg-blue-500" },
            { label: "Contacted", count: funnel.contacted, color: "bg-yellow-500" },
            { label: "Qualified", count: funnel.qualified, color: "bg-purple-500" },
            { label: "Proposal", count: funnel.proposal, color: "bg-cyan-500" },
            { label: "Won", count: funnel.won, color: "bg-green-500" },
          ].map((stage, index, arr) => (
            <div key={index} className="flex items-center w-full sm:w-auto">
              <div className="text-center flex-1 sm:flex-initial">
                <div className={`${stage.color} text-black font-bold rounded-lg px-3 py-2 sm:px-4 sm:py-3`}>
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
      </div>
    </div>
  );
}