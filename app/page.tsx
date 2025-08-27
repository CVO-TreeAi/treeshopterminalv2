"use client";

import { useEffect, useState } from "react";
import LeadModal from "@/components/LeadModal";
import DualPinLogin from "@/components/DualPinLogin";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

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

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
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

  const handleLogout = () => {
    localStorage.removeItem("authenticated");
    localStorage.removeItem("authTime");
    setAuthenticated(false);
  };

  // Show login if not authenticated
  if (!authenticated) {
    return <DualPinLogin onSuccess={() => setAuthenticated(true)} />;
  }

  // Show dashboard
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-green-500">TreeShop Terminal</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              office@fltreeshop.com
            </div>
            <Badge variant={loading ? "warning" : "success"}>
              {loading ? "Loading" : "Live"}
            </Badge>
            <Button 
              onClick={() => window.location.href = "/leads"}
              variant="primary"
            >
              📊 Lead Center
            </Button>
            <Button 
              onClick={() => window.location.href = "/proposals"}
              variant="primary"
            >
              📄 Proposals
            </Button>
            <Button 
              onClick={fetchLeads}
              variant="secondary"
            >
              Refresh
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded p-4 mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card padding="sm">
            <h3 className="text-sm text-gray-400 mb-2">Total Leads</h3>
            <p className="text-3xl font-bold">{leads.length}</p>
          </Card>
          <Card padding="sm">
            <h3 className="text-sm text-gray-400 mb-2">New Leads</h3>
            <p className="text-3xl font-bold text-cyan-400">
              {leads.filter(l => l.status === "new").length}
            </p>
          </Card>
          <Card padding="sm">
            <h3 className="text-sm text-gray-400 mb-2">Contacted</h3>
            <p className="text-3xl font-bold text-green-500">
              {leads.filter(l => l.status === "contacted").length}
            </p>
          </Card>
          <Card padding="sm">
            <h3 className="text-sm text-gray-400 mb-2">Today</h3>
            <p className="text-3xl font-bold text-yellow-400">
              {leads.filter(l => {
                const today = new Date().setHours(0,0,0,0);
                return new Date(l.createdAt).setHours(0,0,0,0) === today;
              }).length}
            </p>
          </Card>
        </div>

        <Card padding="none" className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Package</th>
                <th className="px-4 py-3 text-left">Value</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Source</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr 
                  key={lead._id} 
                  className="border-t border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors"
                  onClick={() => handleLeadClick(lead)}
                >
                  <td className="px-4 py-3 text-sm">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{lead.name || "No name"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{lead.email}</div>
                    <div className="text-sm text-gray-400">{lead.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    {lead.selectedPackage || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {lead.estimatedTotal ? `$${lead.estimatedTotal.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        lead.status === "new" ? "info" : 
                        lead.status === "contacted" ? "warning" :
                        lead.status === "qualified" ? "purple" :
                        lead.status === "won" ? "success" :
                        lead.status === "lost" ? "error" :
                        "default"
                      }
                      size="sm"
                    >
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        lead.siteSource === "treeshop.app" ? "success" : 
                        lead.siteSource === "fltreeshop.com" ? "info" : 
                        "default"
                      }
                      size="sm"
                    >
                      {lead.siteSource}
                    </Badge>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No leads yet. Waiting for submissions from websites...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Lead Modal */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}