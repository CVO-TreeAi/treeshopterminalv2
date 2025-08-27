"use client";

import { useState, useEffect } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import Input from "./ui/Input";

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

interface LeadModalProps {
  lead: Lead | null;
  onClose: () => void;
  onStatusUpdate: (leadId: string, newStatus: string) => void;
}

export default function LeadModal({ lead, onClose, onStatusUpdate }: LeadModalProps) {
  const [status, setStatus] = useState(lead?.status || "new");
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
    }
  }, [lead]);

  if (!lead) return null;

  const handleStatusChange = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(
        "https://earnest-lemming-634.convex.cloud/api/mutation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: "terminalSync:updateLeadStatus",
            args: {
              leadId: lead._id,
              status,
              notes,
            },
          }),
        }
      );
      
      if (response.ok) {
        onStatusUpdate(lead._id, status);
        alert("Status updated successfully!");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-700 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-700 px-6 py-4 flex justify-between items-center bg-gray-900">
          <h2 className="text-xl font-semibold text-green-500">Lead Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Contact Information */}
          <Card className="mb-6">
            <h3 className="text-lg font-medium text-green-500 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <p className="text-white font-medium">{lead.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <a href={`mailto:${lead.email}`} className="text-cyan-400 hover:text-cyan-300">
                  {lead.email}
                </a>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <a href={`tel:${lead.phone}`} className="text-cyan-400 hover:text-cyan-300">
                  {formatPhone(lead.phone)}
                </a>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Source</label>
                <Badge
                  variant={lead.siteSource === "treeshop.app" ? "success" : "info"}
                >
                  {lead.siteSource}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Property Information */}
          {(lead.address || lead.acreage) && (
            <Card className="mb-6">
              <h3 className="text-lg font-medium text-green-500 mb-4">Property Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lead.address && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                    <p className="text-white">{lead.address}</p>
                  </div>
                )}
                {lead.acreage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Acreage</label>
                    <p className="text-white font-medium">{lead.acreage} acres</p>
                  </div>
                )}
                {lead.zipCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Zip Code</label>
                    <p className="text-white">{lead.zipCode}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Service Information */}
          {(lead.selectedPackage || lead.estimatedTotal) && (
            <Card className="mb-6">
              <h3 className="text-lg font-medium text-green-500 mb-4">Service Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lead.selectedPackage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Package</label>
                    <p className="text-white font-medium">{lead.selectedPackage}</p>
                  </div>
                )}
                {lead.estimatedTotal && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Estimated Total</label>
                    <p className="text-green-500 font-semibold text-2xl">
                      ${lead.estimatedTotal.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Notes */}
          {lead.notes && (
            <Card className="mb-6">
              <h3 className="text-lg font-medium text-green-500 mb-4">Customer Notes</h3>
              <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                <p className="text-gray-300">{lead.notes}</p>
              </div>
            </Card>
          )}

          {/* Status Management */}
          <Card className="mb-6">
            <h3 className="text-lg font-medium text-green-500 mb-4">Lead Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Current Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal Sent</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Add Note</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  placeholder="Add any notes about this lead..."
                />
              </div>
              
              <Button
                onClick={handleStatusChange}
                disabled={isUpdating}
                variant="primary"
                fullWidth
              >
                {isUpdating ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </Card>

          {/* Metadata */}
          <Card className="bg-gray-900 border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Lead ID:</span>{" "}
                <span className="text-gray-300 font-mono">{lead._id}</span>
              </div>
              <div>
                <span className="text-gray-400">Lead Score:</span>{" "}
                <Badge
                  variant={
                    lead.leadScore === "A" ? "success" :
                    lead.leadScore === "B" ? "info" :
                    lead.leadScore === "C" ? "warning" :
                    "error"
                  }
                >
                  {lead.leadScore || "N/A"}
                </Badge>
              </div>
              <div>
                <span className="text-gray-400">Created:</span>{" "}
                <span className="text-gray-300">{formatDate(lead.createdAt)}</span>
              </div>
              {lead.updatedAt && (
                <div>
                  <span className="text-gray-400">Updated:</span>{" "}
                  <span className="text-gray-300">{formatDate(lead.updatedAt)}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-700 px-6 py-4 flex justify-end space-x-3 bg-gray-900">
          <Button
            onClick={() => window.open(`mailto:${lead.email}`)}
            variant="secondary"
          >
            📧 Send Email
          </Button>
          <Button
            onClick={() => window.open(`tel:${lead.phone}`)}
            variant="primary"
          >
            📞 Call Now
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}