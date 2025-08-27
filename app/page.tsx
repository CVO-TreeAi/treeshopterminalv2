"use client";

import { useEffect, useState } from "react";
import LeadModal from "@/components/LeadModal";
import DualPinLogin from "@/components/DualPinLogin";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import Button from "@/components/ui/Button";
import BusinessDashboard from "@/components/dashboard/BusinessDashboard";

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

interface Proposal {
  _id: string;
  proposalNumber: string;
  status: "draft" | "sent" | "viewed" | "approved" | "rejected" | "expired";
  total: number;
  createdAt: number;
}

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [error, setError] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const auth = localStorage.getItem("authenticated");
    const authTime = localStorage.getItem("authTime");
    
    // Check if authenticated and within 24 hours
    if (auth === "true" && authTime) {
      const timeDiff = Date.now() - parseInt(authTime);
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setAuthenticated(true);
      } else {
        // Session expired
        localStorage.removeItem("authenticated");
        localStorage.removeItem("authTime");
      }
    }
    setLoading(false);
  }, []);

  // Mock proposals data - will be replaced with Convex sync
  const mockProposals: Proposal[] = [
    {
      _id: "1",
      proposalNumber: "PROP-2025-001",
      status: "sent",
      total: 8100,
      createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    },
    {
      _id: "2",
      proposalNumber: "PROP-2025-002",
      status: "viewed",
      total: 29111.4,
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    },
  ];

  const fetchLeads = async () => {
    try {
      console.log("Fetching leads from Convex...");
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
      console.log("Convex response:", data);
      
      if (data.status === "success" && data.value) {
        const leads = data.value.completedLeads || [];
        console.log(`Found ${leads.length} leads`);
        setLeads(leads);
        setError("");
      } else {
        console.error("Failed response:", data);
        setError("Failed to fetch leads");
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Connection error: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchLeads();
      setProposals(mockProposals); // Set mock proposals
      const interval = setInterval(fetchLeads, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleStatusUpdate = (leadId: string, newStatus: string) => {
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead._id === leadId ? { ...lead, status: newStatus } : lead
      )
    );
  };

  // Show login if not authenticated
  if (!authenticated) {
    return <DualPinLogin onSuccess={() => setAuthenticated(true)} />;
  }

  // Show dashboard with sidebar
  return (
    <AuthenticatedLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-500">Dashboard</h1>
              <p className="text-gray-400 mt-2">Business Operations & KPIs</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={fetchLeads}
                variant="secondary"
                size="sm"
              >
                ↻ Refresh
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded p-4 mb-4">
              {error}
            </div>
          )}

          <BusinessDashboard leads={leads} proposals={proposals} />

        {/* Lead Modal */}
        {selectedLead && (
          <LeadModal
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </div>
    </AuthenticatedLayout>
  );
}