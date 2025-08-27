"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import DirectoryLayout from "@/components/shared/DirectoryLayout";
import DataTable, { Column } from "@/components/shared/DataTable";
import Button from "@/components/ui/Button";
import ProposalModal from "@/components/ProposalModal";
import ProposalStageKPIs from "@/components/kpi/ProposalStageKPIs";

interface Proposal extends Record<string, unknown> {
  _id: string;
  proposalNumber: string;
  leadId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  propertyAddress: string;
  acreage: number;
  services: {
    service: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "viewed" | "approved" | "rejected" | "expired";
  validUntil: number;
  version: number;
  previousVersionId?: string;
  sentAt?: number;
  viewedAt?: number;
  approvedAt?: number;
  createdAt: number;
  updatedAt: number;
}

// Mock data for now - will connect to Convex
const mockProposals: Proposal[] = [
  {
    _id: "1",
    proposalNumber: "PROP-2025-001",
    leadId: "lead1",
    customerName: "John Smith",
    customerEmail: "john@example.com",
    customerPhone: "555-0123",
    propertyAddress: "123 Oak Street",
    acreage: 2.5,
    services: [
      {
        service: "Forestry Mulching",
        description: "Complete forestry mulching of 2.5 acres",
        quantity: 2.5,
        unit: "acres",
        unitPrice: 3000,
        total: 7500,
      },
    ],
    subtotal: 7500,
    tax: 600,
    total: 8100,
    status: "sent",
    validUntil: Date.now() + 30 * 24 * 60 * 60 * 1000,
    version: 1,
    sentAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    _id: "2",
    proposalNumber: "PROP-2025-002",
    leadId: "lead2",
    customerName: "Jane Doe",
    customerEmail: "jane@example.com",
    customerPhone: "555-0456",
    propertyAddress: "456 Pine Road",
    acreage: 5,
    services: [
      {
        service: "Land Clearing",
        description: "Complete land clearing and grubbing",
        quantity: 5,
        unit: "acres",
        unitPrice: 5000,
        total: 25000,
      },
      {
        service: "Debris Hauling",
        description: "Hauling of cleared debris",
        quantity: 85,
        unit: "yards",
        unitPrice: 23,
        total: 1955,
      },
    ],
    subtotal: 26955,
    tax: 2156.4,
    total: 29111.4,
    status: "viewed",
    validUntil: Date.now() + 28 * 24 * 60 * 60 * 1000,
    version: 2,
    previousVersionId: "prop2-v1",
    sentAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    viewedAt: Date.now() - 12 * 60 * 60 * 1000,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
];

export default function ProposalsPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [view, setView] = useState<"table" | "kpi">("table");

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

  // Filter proposals by status
  const filteredProposals = statusFilter === "all" 
    ? proposals 
    : proposals.filter(p => p.status === statusFilter);

  // Calculate stats
  const stats = [
    {
      label: "Total Proposals",
      value: proposals.length,
      color: "text-white",
    },
    {
      label: "Active",
      value: proposals.filter(p => ["draft", "sent", "viewed"].includes(p.status)).length,
      color: "text-blue-400",
    },
    {
      label: "Approved",
      value: proposals.filter(p => p.status === "approved").length,
      color: "text-green-400",
      trend: {
        value: 25,
        isPositive: true,
      },
    },
    {
      label: "Pipeline Value",
      value: `$${(proposals
        .filter(p => ["sent", "viewed"].includes(p.status))
        .reduce((sum, p) => sum + p.total, 0) / 1000
      ).toFixed(0)}k`,
      color: "text-purple-400",
    },
    {
      label: "Avg Deal Size",
      value: `$${(proposals
        .reduce((sum, p) => sum + p.total, 0) / proposals.length / 1000
      ).toFixed(0)}k`,
      color: "text-yellow-400",
    },
    {
      label: "Win Rate",
      value: `${((proposals.filter(p => p.status === "approved").length / 
        proposals.filter(p => ["approved", "rejected"].includes(p.status)).length) * 100 || 0
      ).toFixed(0)}%`,
      color: "text-cyan-400",
    },
  ];

  // Table columns
  const columns: Column<Proposal>[] = [
    {
      key: "proposalNumber",
      label: "Proposal #",
      sortable: true,
      width: "140px",
      render: (proposal) => (
        <div className="font-mono font-medium text-blue-400">
          {proposal.proposalNumber}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      width: "120px",
      render: (proposal) => new Date(proposal.createdAt).toLocaleDateString(),
    },
    {
      key: "customerName",
      label: "Customer",
      sortable: true,
      render: (proposal) => (
        <div>
          <div className="font-medium">{proposal.customerName}</div>
          <div className="text-sm text-gray-400">{proposal.customerEmail}</div>
        </div>
      ),
    },
    {
      key: "propertyAddress",
      label: "Property",
      render: (proposal) => (
        <div>
          <div className="text-sm">{proposal.propertyAddress}</div>
          <div className="text-sm text-gray-400">{proposal.acreage} acres</div>
        </div>
      ),
    },
    {
      key: "services",
      label: "Services",
      render: (proposal) => (
        <div className="text-sm">
          {proposal.services.map(s => s.service).join(", ")}
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (proposal) => (
        <div className="font-medium text-green-400">
          ${proposal.total.toLocaleString()}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (proposal) => {
        const statusConfig = {
          draft: { bg: "bg-gray-500", text: "Draft" },
          sent: { bg: "bg-blue-500", text: "Sent" },
          viewed: { bg: "bg-yellow-500", text: "Viewed" },
          approved: { bg: "bg-green-500", text: "Approved" },
          rejected: { bg: "bg-red-500", text: "Rejected" },
          expired: { bg: "bg-gray-600", text: "Expired" },
        };
        const config = statusConfig[proposal.status];
        return (
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs ${config.bg}`}>
              {config.text}
            </span>
            {proposal.viewedAt && proposal.status === "viewed" && (
              <span className="text-xs text-gray-400">
                {new Date(proposal.viewedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "validUntil",
      label: "Valid Until",
      sortable: true,
      render: (proposal) => {
        const daysLeft = Math.floor((proposal.validUntil - Date.now()) / (1000 * 60 * 60 * 24));
        return (
          <div className={`text-sm ${daysLeft < 7 ? "text-red-400" : "text-gray-400"}`}>
            {daysLeft > 0 ? `${daysLeft} days` : "Expired"}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (proposal) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log("View proposal:", proposal._id);
            }}
            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log("Send proposal:", proposal._id);
            }}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
          >
            Send
          </button>
        </div>
      ),
    },
  ];

  if (!authenticated || loading) {
    return null;
  }

  return (
    <AuthenticatedLayout>
      <DirectoryLayout
        title="Proposal Management"
        subtitle="Track and manage your TreeShop proposals"
        stats={stats}
        actions={
          <>
            <Button
              onClick={() => setView(view === "table" ? "kpi" : "table")}
              variant="secondary"
              size="sm"
            >
              {view === "table" ? "📊 View KPIs" : "📋 View Table"}
            </Button>
            <Button
              onClick={() => router.push("/proposals/new-v2")}
              variant="primary"
              size="sm"
            >
              + New Proposal
            </Button>
          </>
        }
      >
      {view === "kpi" ? (
        <ProposalStageKPIs proposals={proposals} />
      ) : (
        <DataTable
          data={filteredProposals}
          columns={columns}
          onRowClick={(proposal) => setSelectedProposal(proposal)}
          searchKeys={["customerName", "customerEmail", "proposalNumber"]}
          filters={
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          }
          emptyMessage="No proposals yet. Create your first proposal from a qualified lead."
        />
      )}
      
      {/* Proposal Modal */}
      {selectedProposal && (
        <ProposalModal
          proposal={selectedProposal}
          onClose={() => setSelectedProposal(null)}
          onStatusUpdate={(proposalId, newStatus) => {
            setProposals(prev =>
              prev.map(p =>
                p._id === proposalId ? { ...p, status: newStatus as any } : p
              )
            );
            setSelectedProposal(prev =>
              prev && prev._id === proposalId ? { ...prev, status: newStatus as any } : prev
            );
          }}
          onEdit={(updatedProposal) => {
            setProposals(prev =>
              prev.map(p =>
                p._id === updatedProposal._id ? updatedProposal : p
              )
            );
            setSelectedProposal(updatedProposal);
          }}
        />
      )}
      </DirectoryLayout>
    </AuthenticatedLayout>
  );
}