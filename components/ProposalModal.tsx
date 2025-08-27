"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ProposalPDFDocument from "@/components/proposals/ProposalPDF";
import dynamic from "next/dynamic";

// Dynamic import for PDF viewer
const ProposalPDFViewer = dynamic(
  () => import("@/components/proposals/ProposalPDF").then(mod => mod.ProposalPDFViewer),
  { 
    ssr: false,
    loading: () => <div className="text-center py-8 text-gray-400">Loading PDF preview...</div>
  }
);

interface Proposal extends Record<string, unknown> {
  _id: string;
  proposalNumber: string;
  leadId?: string;
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
  total: number;
  status: "draft" | "sent" | "viewed" | "approved" | "rejected" | "expired";
  validUntil: number;
  version: number;
  sentAt?: number;
  viewedAt?: number;
  approvedAt?: number;
  createdAt: number;
  updatedAt: number;
  notes?: string;
}

interface ProposalModalProps {
  proposal: Proposal;
  onClose: () => void;
  onStatusUpdate?: (proposalId: string, newStatus: string) => void;
  onEdit?: (proposal: Proposal) => void;
}

export default function ProposalModal({ proposal, onClose, onStatusUpdate, onEdit }: ProposalModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProposal, setEditedProposal] = useState(proposal);
  const [showPDF, setShowPDF] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Status colors and labels
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "draft": return { variant: "default" as const, label: "Draft", color: "text-gray-400" };
      case "sent": return { variant: "info" as const, label: "Sent", color: "text-blue-400" };
      case "viewed": return { variant: "warning" as const, label: "Viewed", color: "text-yellow-400" };
      case "approved": return { variant: "success" as const, label: "Approved", color: "text-green-400" };
      case "rejected": return { variant: "error" as const, label: "Rejected", color: "text-red-400" };
      case "expired": return { variant: "default" as const, label: "Expired", color: "text-gray-500" };
      default: return { variant: "default" as const, label: status, color: "text-gray-400" };
    }
  };

  const handleSaveEdits = async () => {
    setIsUpdating(true);
    try {
      // Here we would save to Convex
      console.log("Saving proposal edits:", editedProposal);
      
      if (onEdit) {
        onEdit(editedProposal);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving proposal:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      // Update status in backend
      console.log("Updating proposal status:", newStatus);
      
      if (onStatusUpdate) {
        onStatusUpdate(proposal._id, newStatus);
      }
      
      setEditedProposal(prev => ({ ...prev, status: newStatus as any }));
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateService = (index: number, field: string, value: any) => {
    const updatedServices = [...editedProposal.services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value,
    };
    
    // Recalculate totals
    if (field === "quantity" || field === "unitPrice") {
      updatedServices[index].total = updatedServices[index].quantity * updatedServices[index].unitPrice;
    }
    
    const total = updatedServices.reduce((sum, s) => sum + s.total, 0);
    
    setEditedProposal(prev => ({
      ...prev,
      services: updatedServices,
      total,
    }));
  };

  const statusConfig = getStatusConfig(editedProposal.status);
  const daysLeft = Math.floor((proposal.validUntil - Date.now()) / (1000 * 60 * 60 * 24));

  // Prepare PDF data
  const pdfProposal = {
    proposalNumber: editedProposal.proposalNumber,
    createdAt: editedProposal.createdAt,
    validUntil: editedProposal.validUntil,
    customer: {
      name: editedProposal.customerName,
      email: editedProposal.customerEmail,
      phone: editedProposal.customerPhone,
      address: editedProposal.propertyAddress,
      zipCode: "",
    },
    property: {
      address: editedProposal.propertyAddress,
      acreage: editedProposal.acreage,
    },
    services: editedProposal.services,
    pricing: {
      total: editedProposal.total,
      deposit: editedProposal.total * 0.25,
    },
    notes: editedProposal.notes || "",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-green-500">
              Proposal #{editedProposal.proposalNumber}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              {daysLeft > 0 ? (
                <span className="text-xs sm:text-sm text-gray-400">Valid for {daysLeft} days</span>
              ) : (
                <span className="text-xs sm:text-sm text-red-400">Expired</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl sm:text-2xl p-1"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Customer Information */}
          <Card className="mb-6">
            <h3 className="text-lg font-medium text-green-500 mb-4">Customer Information</h3>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={editedProposal.customerName}
                  onChange={(e) => setEditedProposal(prev => ({ ...prev, customerName: e.target.value }))}
                />
                <Input
                  label="Email"
                  value={editedProposal.customerEmail}
                  onChange={(e) => setEditedProposal(prev => ({ ...prev, customerEmail: e.target.value }))}
                />
                <Input
                  label="Phone"
                  value={editedProposal.customerPhone}
                  onChange={(e) => setEditedProposal(prev => ({ ...prev, customerPhone: e.target.value }))}
                />
                <Input
                  label="Property Address"
                  value={editedProposal.propertyAddress}
                  onChange={(e) => setEditedProposal(prev => ({ ...prev, propertyAddress: e.target.value }))}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="font-medium">{editedProposal.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium">{editedProposal.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="font-medium">{editedProposal.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Property</p>
                  <p className="font-medium">{editedProposal.propertyAddress}</p>
                  <p className="text-sm text-gray-400">{editedProposal.acreage} acres</p>
                </div>
              </div>
            )}
          </Card>

          {/* Services */}
          <Card className="mb-6">
            <h3 className="text-lg font-medium text-green-500 mb-4">Services & Pricing</h3>
            {isEditing ? (
              <div className="space-y-4">
                {editedProposal.services.map((service, idx) => (
                  <div key={idx} className="p-4 bg-gray-900 rounded-lg space-y-3">
                    <Input
                      label="Service"
                      value={service.service}
                      onChange={(e) => updateService(idx, "service", e.target.value)}
                    />
                    <Input
                      label="Description"
                      value={service.description}
                      onChange={(e) => updateService(idx, "description", e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        label="Quantity"
                        type="number"
                        value={service.quantity}
                        onChange={(e) => updateService(idx, "quantity", parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        label="Unit Price"
                        type="number"
                        value={service.unitPrice}
                        onChange={(e) => updateService(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                      />
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Total</p>
                        <p className="text-xl font-bold text-green-400">${service.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {editedProposal.services.map((service, idx) => (
                  <div key={idx} className="flex justify-between items-start py-3 border-b border-gray-700">
                    <div className="flex-1">
                      <p className="font-medium">{service.service}</p>
                      <p className="text-sm text-gray-400">{service.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {service.quantity} {service.unit} × ${service.unitPrice}/{service.unit.slice(0, -1)}
                      </p>
                    </div>
                    <p className="font-bold text-green-400">${service.total.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-gray-700 space-y-2">
              <div className="flex justify-between text-lg font-bold">
                <p>Total</p>
                <p className="text-green-400">${editedProposal.total.toFixed(2)}</p>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-700">
                <p>Required Deposit (25%)</p>
                <p className="font-bold text-yellow-400">${(editedProposal.total * 0.25).toFixed(2)}</p>
              </div>
            </div>
          </Card>

          {/* Status Management */}
          {!isEditing && (
            <Card className="mb-6">
              <h3 className="text-lg font-medium text-green-500 mb-4">Status Management</h3>
              <div className="flex gap-2 flex-wrap">
                {["draft", "sent", "viewed", "approved", "rejected"].map((status) => {
                  const config = getStatusConfig(status);
                  return (
                    <Button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      variant={editedProposal.status === status ? "primary" : "secondary"}
                      size="sm"
                      disabled={isUpdating}
                    >
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* PDF Preview */}
          {showPDF && (
            <Card className="mb-6">
              <h3 className="text-lg font-medium text-green-500 mb-4">PDF Preview</h3>
              <div className="bg-white rounded-lg overflow-hidden">
                <ProposalPDFViewer proposal={pdfProposal} />
              </div>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            <Button
              onClick={() => setShowPDF(!showPDF)}
              variant="secondary"
              size="sm"
              className="flex-1 sm:flex-initial"
            >
              {showPDF ? "Hide PDF" : "Show PDF"}
            </Button>
            <PDFDownloadLink
              document={<ProposalPDFDocument proposal={pdfProposal} />}
              fileName={`Proposal-${editedProposal.proposalNumber}.pdf`}
              className="flex-1 sm:flex-initial"
            >
              {({ loading }) => (
                <Button variant="secondary" size="sm" disabled={loading} fullWidth>
                  {loading ? "Generating..." : "Download PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
          
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {isEditing ? (
              <>
                <Button
                  onClick={() => {
                    setEditedProposal(proposal);
                    setIsEditing(false);
                  }}
                  variant="ghost"
                  size="sm"
                  className="flex-1 sm:flex-initial"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdits}
                  variant="primary"
                  size="sm"
                  disabled={isUpdating}
                  className="flex-1 sm:flex-initial"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="primary"
                  size="sm"
                  className="flex-1 sm:flex-initial"
                >
                  <span className="hidden sm:inline">✏️ </span>Edit
                </Button>
                <Button
                  onClick={() => {
                    // Send proposal logic
                    console.log("Sending proposal...");
                    handleStatusChange("sent");
                  }}
                  variant="success"
                  size="sm"
                  className="flex-1 sm:flex-initial"
                >
                  <span className="hidden sm:inline">📧 </span>Send
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}