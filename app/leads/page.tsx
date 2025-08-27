"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DirectoryLayout from "@/components/shared/DirectoryLayout";
import DataTable, { Column } from "@/components/shared/DataTable";
import LeadKPIDashboard from "@/components/kpi/LeadKPIDashboard";
import LeadModal from "@/components/LeadModal";
import { scoreLeadFromData } from "@/lib/leadScoring";

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  acreage?: number;
  selectedPackage?: string;
  estimatedTotal?: number;
  notes?: string;
  siteSource: string;
  status: string;
  createdAt: number;
  updatedAt?: number;
  zipCode?: string;
  leadScore?: string;
  leadSource?: string;
  obstacles?: string[];
}

export default function LeadsPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [view, setView] = useState<"table" | "kpi">("table");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Check authentication
  useEffect(() => {
    const auth = localStorage.getItem("authenticated");
    const authTime = localStorage.getItem("authTime");
    
    if (auth === "true" && authTime) {
      const timeDiff = Date.now() - parseInt(authTime);
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setAuthenticated(true);
      } else {
        router.push("/");
      }
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  // Fetch leads
  const fetchLeads = async () => {
    try {
      const response = await fetch(
        "https://earnest-lemming-634.convex.cloud/api/query",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: "terminalSync:syncLeadsToTerminal",
            args: {},
          }),
        }
      );

      const data = await response.json();
      
      if (data.status === "success" && data.value) {
        const leadsData = data.value.completedLeads || [];
        // Add scoring to each lead
        const scoredLeads = leadsData.map((lead: Lead) => {
          const score = scoreLeadFromData(lead);
          return {
            ...lead,
            leadScore: score.grade,
            scoreDetails: score,
          };
        });
        setLeads(scoredLeads);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchLeads();
      const interval = setInterval(fetchLeads, 10000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  // Filter leads by status
  const filteredLeads = statusFilter === "all" 
    ? leads 
    : leads.filter(l => l.status === statusFilter);

  // Calculate stats for the header
  const stats = [
    {
      label: "Total Leads",
      value: leads.length,
      color: "text-white",
    },
    {
      label: "New Today",
      value: leads.filter(l => {
        const today = new Date().setHours(0,0,0,0);
        return new Date(l.createdAt).setHours(0,0,0,0) === today;
      }).length,
      color: "text-blue-400",
      trend: {
        value: 12,
        isPositive: true,
      },
    },
    {
      label: "Hot Leads",
      value: leads.filter(l => {
        const hoursSince = (Date.now() - l.createdAt) / (1000 * 60 * 60);
        return hoursSince <= 4 && l.leadScore === "A";
      }).length,
      color: "text-red-400",
    },
    {
      label: "Qualified",
      value: leads.filter(l => l.status === "qualified").length,
      color: "text-green-400",
    },
    {
      label: "Pipeline Value",
      value: `$${(leads
        .filter(l => !["lost", "won"].includes(l.status))
        .reduce((sum, l) => sum + (l.estimatedTotal || 0), 0) / 1000
      ).toFixed(0)}k`,
      color: "text-purple-400",
    },
    {
      label: "Avg Response",
      value: "2.3 hrs",
      color: "text-yellow-400",
      trend: {
        value: -15,
        isPositive: true,
      },
    },
  ];

  // Table columns configuration
  const columns: Column<Lead>[] = [
    {
      key: "leadScore",
      label: "Score",
      sortable: true,
      width: "80px",
      render: (lead: Lead & { leadScore?: string; scoreDetails?: any }) => (
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${
            lead.leadScore === "A" ? "text-green-400" :
            lead.leadScore === "B" ? "text-blue-400" :
            lead.leadScore === "C" ? "text-yellow-400" :
            lead.leadScore === "D" ? "text-orange-400" :
            "text-red-400"
          }`}>
            {lead.leadScore || "?"}
          </span>
          {lead.scoreDetails?.recommendations?.[0]?.includes("HOT") && (
            <span className="text-red-500 animate-pulse">🔥</span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      width: "120px",
      render: (lead) => new Date(lead.createdAt).toLocaleDateString(),
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (lead) => (
        <div className="font-medium">{lead.name || "No name"}</div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (lead) => (
        <div>
          <div className="text-sm">{lead.email}</div>
          <div className="text-sm text-gray-400">{lead.phone}</div>
        </div>
      ),
    },
    {
      key: "selectedPackage",
      label: "Package",
      sortable: true,
      render: (lead) => lead.selectedPackage || "-",
    },
    {
      key: "estimatedTotal",
      label: "Value",
      sortable: true,
      render: (lead) =>
        lead.estimatedTotal ? `$${lead.estimatedTotal.toLocaleString()}` : "-",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (lead) => (
        <span className={`px-2 py-1 rounded text-xs ${
          lead.status === "new" ? "bg-blue-500" :
          lead.status === "contacted" ? "bg-yellow-500" :
          lead.status === "qualified" ? "bg-purple-500" :
          lead.status === "won" ? "bg-green-500" :
          lead.status === "lost" ? "bg-red-500" :
          "bg-gray-500"
        }`}>
          {lead.status}
        </span>
      ),
    },
    {
      key: "siteSource",
      label: "Source",
      sortable: true,
      render: (lead) => (
        <span className={`px-2 py-1 rounded text-xs ${
          lead.siteSource === "treeshop.app" ? "bg-green-600" :
          lead.siteSource === "fltreeshop.com" ? "bg-blue-600" :
          "bg-gray-500"
        }`}>
          {lead.siteSource}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (lead) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/proposals/new?leadId=${lead._id}`;
          }}
          className="px-3 py-1 bg-green-500 hover:bg-green-400 rounded text-xs text-black font-medium"
        >
          Create Proposal
        </button>
      ),
    },
  ];

  const handleStatusUpdate = (leadId: string, newStatus: string) => {
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead._id === leadId ? { ...lead, status: newStatus } : lead
      )
    );
  };

  if (!authenticated || loading) {
    return null;
  }

  return (
    <DirectoryLayout
      title="Lead Management"
      subtitle="Track and convert your TreeShop leads"
      stats={stats}
      actions={
        <>
          <button
            onClick={() => setView(view === "table" ? "kpi" : "table")}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            {view === "table" ? "📊 KPIs" : "📋 Table"}
          </button>
          <button
            onClick={fetchLeads}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Refresh
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
          >
            Dashboard
          </button>
        </>
      }
    >
      {view === "kpi" ? (
        <LeadKPIDashboard leads={leads} />
      ) : (
        <DataTable
          data={filteredLeads}
          columns={columns}
          onRowClick={(lead) => setSelectedLead(lead)}
          searchKeys={["name", "email", "phone"]}
          filters={
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          }
          emptyMessage="No leads yet. Waiting for submissions from websites..."
        />
      )}

      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </DirectoryLayout>
  );
}