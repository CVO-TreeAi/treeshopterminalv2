"use client";

import { useEffect, useState } from "react";

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  acreage?: string;
  selectedPackage?: string;
  message?: string;
  source: string;
  createdAt: number;
}

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setError("Connection error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">TreeShop Terminal</h1>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded ${loading ? "bg-yellow-500" : "bg-green-500"}`}>
              {loading ? "Loading..." : "Live"}
            </span>
            <button 
              onClick={fetchLeads}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded p-4 mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-sm text-gray-400 mb-2">Total Leads</h3>
            <p className="text-3xl font-bold">{leads.length}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-sm text-gray-400 mb-2">From TreeShop.app</h3>
            <p className="text-3xl font-bold text-blue-400">
              {leads.filter(l => l.source === "treeshop.app").length}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-sm text-gray-400 mb-2">From FLTreeShop.com</h3>
            <p className="text-3xl font-bold text-green-400">
              {leads.filter(l => l.source === "fltreeshop.com").length}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-sm text-gray-400 mb-2">Today</h3>
            <p className="text-3xl font-bold text-yellow-400">
              {leads.filter(l => {
                const today = new Date().setHours(0,0,0,0);
                return new Date(l.createdAt).setHours(0,0,0,0) === today;
              }).length}
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Package</th>
                <th className="px-4 py-3 text-left">Acreage</th>
                <th className="px-4 py-3 text-left">Source</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id} className="border-t border-gray-700 hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm">
                    {new Date(lead.createdAt).toLocaleString()}
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
                    {lead.acreage || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      lead.source === "treeshop.app" ? "bg-blue-500" : 
                      lead.source === "fltreeshop.com" ? "bg-green-500" : 
                      "bg-gray-500"
                    }`}>
                      {lead.source}
                    </span>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No leads yet. Waiting for submissions from websites...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
