"use client";

import { useState, useEffect } from "react";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Lead Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900 font-medium">{lead.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                  {lead.email}
                </a>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Phone</label>
                <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                  {formatPhone(lead.phone)}
                </a>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Source</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  lead.siteSource === "treeshop.app"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {lead.siteSource}
                </span>
              </div>
            </div>
          </div>

          {/* Property Information */}
          {(lead.address || lead.acreage) && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Property Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lead.address && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">Address</label>
                    <p className="text-gray-900">{lead.address}</p>
                  </div>
                )}
                {lead.acreage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Acreage</label>
                    <p className="text-gray-900">{lead.acreage} acres</p>
                  </div>
                )}
                {lead.zipCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Zip Code</label>
                    <p className="text-gray-900">{lead.zipCode}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Service Information */}
          {(lead.selectedPackage || lead.estimatedTotal) && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Service Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lead.selectedPackage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Package</label>
                    <p className="text-gray-900 font-medium">{lead.selectedPackage}</p>
                  </div>
                )}
                {lead.estimatedTotal && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Estimated Total</label>
                    <p className="text-gray-900 font-semibold text-lg">
                      ${lead.estimatedTotal.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Notes</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{lead.notes}</p>
              </div>
            </div>
          )}

          {/* Status Management */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Lead Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Current Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-600 mb-2">Add Note</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes about this lead..."
                />
              </div>
              
              <button
                onClick={handleStatusChange}
                disabled={isUpdating}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isUpdating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Lead ID:</span> {lead._id}
              </div>
              <div>
                <span className="font-medium">Lead Score:</span> {lead.leadScore || "N/A"}
              </div>
              <div>
                <span className="font-medium">Created:</span> {formatDate(lead.createdAt)}
              </div>
              {lead.updatedAt && (
                <div>
                  <span className="font-medium">Updated:</span> {formatDate(lead.updatedAt)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={() => window.open(`mailto:${lead.email}`)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Send Email
          </button>
          <button
            onClick={() => window.open(`tel:${lead.phone}`)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Call Now
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}