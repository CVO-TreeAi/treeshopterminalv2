"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
// import { mockLeads, mockProposals } from "@/lib/mockData";
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

  // Using REAL Convex data now!
  const realLeads = useQuery(api.leads.getLeads, { limit: 50 });
  const realProposals = useQuery(api.proposals.getProposals, { limit: 50 });

  const fetchLeads = async () => {
    try {
      if (realLeads) {
        console.log("Loading REAL leads from Convex...", realLeads);
        // Transform real data to match expected interface
        const transformedLeads = realLeads.map(lead => ({
          _id: lead._id,
          name: lead.customerInfo?.name || lead.name || 'Unknown',
          email: lead.customerInfo?.email || lead.email || '',
          phone: lead.customerInfo?.phone || lead.phone || '',
          address: lead.propertyAddress || `${lead.customerInfo?.address?.street || ''}, ${lead.customerInfo?.address?.city || ''}, ${lead.customerInfo?.address?.state || ''}`,
          acreage: lead.estimatedAcreage || 0,
          selectedPackage: lead.packageType || 'Unknown',
          estimatedTotal: lead.instantQuote || lead.proposal?.estimatedCost || 0,
          notes: lead.additionalDetails || lead.serviceDetails?.description || '',
          siteSource: lead.source,
          status: lead.status,
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt,
          leadSource: lead.source,
          leadScore: lead.priority || (lead.status === 'new' ? 'High' : 'Medium'),
          obstacles: []
        }));
        setLeads(transformedLeads);
        setError("");
        console.log(`Loaded ${transformedLeads.length} REAL leads from Convex!`);
      }
    } catch (err) {
      console.error("Error loading real leads:", err);
      setError("Error loading data: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchLeads();
      if (realProposals) {
        setProposals(realProposals.map(prop => ({
          _id: prop._id,
          proposalNumber: `PROP-${prop._id.slice(-6)}`,
          status: prop.status as any,
          total: prop.finalPrice || 0,
          createdAt: prop.createdAt
        })));
      }
    }
  }, [authenticated, realLeads, realProposals]); // Update when real data changes

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