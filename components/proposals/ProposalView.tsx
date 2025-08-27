"use client";

import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

interface ProposalViewProps {
  proposal: any;
  onClose?: () => void;
  onEdit?: () => void;
  onSend?: () => void;
}

export default function ProposalView({ proposal, onClose, onEdit, onSend }: ProposalViewProps) {
  const [showFinancing, setShowFinancing] = useState(false);

  // Format phone number
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)})${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Calculate deposit based on total
  const calculateDeposit = () => {
    if (proposal.total < 1000) return 250;
    return Math.round(proposal.total * 0.25);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header with Tree Shop Logo */}
      <Card className="mb-6 bg-black border-green-500/30">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-green-500 mb-2">Tree Shop</h1>
            <p className="text-gray-400">{formatPhone("3868435266")}</p>
          </div>
          <div className="text-right">
            <Badge variant="warning" size="lg">
              Proposal #{proposal.proposalNumber || "DRAFT"}
            </Badge>
            <p className="text-sm text-gray-400 mt-2">
              {new Date(proposal.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Customer Information */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-green-500 mb-4">Prepared For</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-white font-medium">{proposal.customerName}</p>
            <p className="text-gray-400">{proposal.propertyAddress}</p>
            {proposal.zipCode && (
              <p className="text-gray-400">{proposal.city || "FL"} {proposal.zipCode}</p>
            )}
          </div>
          <div className="text-right md:text-left">
            <p className="text-gray-400">{proposal.customerEmail}</p>
            <p className="text-gray-400">{formatPhone(proposal.customerPhone)}</p>
            {proposal.acreage && (
              <p className="text-gray-400">Property Size: {proposal.acreage} acres</p>
            )}
          </div>
        </div>
      </Card>

      {/* Project Site Info */}
      {proposal.parcelId && (
        <Card className="mb-6 bg-gray-900">
          <h3 className="text-lg font-medium text-green-500 mb-3">PROJECT SITE</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Parcel ID:</span>{" "}
              <span className="text-white">{proposal.parcelId}</span>
            </div>
            <div>
              <span className="text-gray-400">Size:</span>{" "}
              <span className="text-white">{proposal.acreage} Acres</span>
            </div>
          </div>
        </Card>
      )}

      {/* Scope of Work */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-green-500 mb-4">Scope of Work</h2>
        <p className="text-white whitespace-pre-wrap">
          {proposal.scopeOfWork || proposal.notes || "Detailed scope to be provided"}
        </p>
      </Card>

      {/* Pricing Table */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-green-500 mb-4">Pricing</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">Description</th>
                <th className="text-right py-3 px-4 text-gray-400">Rate</th>
                <th className="text-right py-3 px-4 text-gray-400">Qty</th>
                <th className="text-right py-3 px-4 text-gray-400">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Project Site Line (always $0) */}
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-4">
                  <div className="text-white font-medium">PROJECT SITE</div>
                  <div className="text-sm text-gray-400">
                    Parcel ID: {proposal.parcelId || "TBD"}
                  </div>
                  <div className="text-sm text-gray-400">
                    Size: {proposal.acreage} Acres
                  </div>
                </td>
                <td className="text-right py-3 px-4 text-gray-400">$0.00</td>
                <td className="text-right py-3 px-4 text-gray-400">1</td>
                <td className="text-right py-3 px-4 text-gray-400">$0.00</td>
              </tr>

              {/* Service Lines */}
              {proposal.services?.map((service: any, index: number) => (
                <tr key={index} className="border-b border-gray-700/50">
                  <td className="py-3 px-4">
                    <div className="text-white font-medium">{service.service}</div>
                    <div className="text-sm text-gray-300 mt-2 max-w-2xl">
                      {service.description || getServiceDescription(service.service)}
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-white">
                    ${service.unitPrice.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-white">
                    {service.quantity} {service.unit}
                  </td>
                  <td className="text-right py-3 px-4 text-white font-medium">
                    ${service.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="text-right py-2 px-4 text-gray-400">
                  Subtotal
                </td>
                <td className="text-right py-2 px-4 text-white">
                  ${proposal.subtotal?.toLocaleString() || "0"}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="text-right py-2 px-4 text-gray-400">
                  Tax
                </td>
                <td className="text-right py-2 px-4 text-white">
                  ${proposal.tax?.toFixed(2) || "0.00"}
                </td>
              </tr>
              <tr className="border-t border-gray-700">
                <td colSpan={3} className="text-right py-3 px-4 text-green-500 font-semibold">
                  Proposal Total (USD)
                </td>
                <td className="text-right py-3 px-4 text-green-500 text-2xl font-bold">
                  ${proposal.total?.toLocaleString() || "0"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Notes & Financing */}
      <Card className="mb-6 bg-gray-900">
        <h2 className="text-xl font-semibold text-green-500 mb-4">Notes</h2>
        <div className="space-y-4">
          <p className="text-white">
            Prefer to pay over time?{" "}
            <span className="text-green-500 font-medium">
              We offer 0% APR financing up to 24 months*.
            </span>{" "}
            Prequalify for financing without impacting your credit score to see how much you're approved for!
          </p>
          <Button
            onClick={() => setShowFinancing(!showFinancing)}
            variant="primary"
            size="sm"
          >
            View Financing Options
          </Button>
          {showFinancing && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-gray-300">
                Visit: https://wisetack.us/#/gc0y1lm/prequalify
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-300">
                <li>✓ Fast and easy - Quick application</li>
                <li>✓ No hidden fees - No prepayment penalties</li>
                <li>✓ Options for you - Choose monthly payment that works</li>
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Terms */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-green-500 mb-4">Terms</h2>
        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="text-white font-medium mb-2">Environmental Responsibility</h3>
            <p>
              Tree Shop is committed to environmental stewardship and will not impact federally protected wetlands. 
              Any necessary changes to the project scope for environmental reasons will be communicated and approved before proceeding.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-2">Permit Responsibility</h3>
            <p>
              The landowner is responsible for obtaining all necessary permits. 
              Tree Shop will adhere to all legal and environmental guidelines during the project.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-2">Change Orders</h3>
            <p>
              Unforeseen conditions may necessitate a change in scope or budget. 
              Any adjustments will be managed through formal change orders.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-2">Payment Terms</h3>
            <ul className="space-y-1">
              <li>• A ${calculateDeposit()} deposit is required to secure scheduling.</li>
              <li>• The remaining balance is due upon project completion.</li>
              <li>• A 3% daily fee applies to late payments.</li>
              <li>• Estimates are valid for {proposal.validDays || 60} days from the proposal date.</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm">
            Prepared by: {proposal.preparedBy || "Tree Shop Team"}
          </p>
          <p className="text-gray-400 text-sm">
            Valid until: {new Date(Date.now() + (proposal.validDays || 60) * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-4">
          {onEdit && (
            <Button onClick={onEdit} variant="secondary">
              Edit Proposal
            </Button>
          )}
          {onSend && (
            <Button onClick={onSend} variant="primary">
              Send to Customer
            </Button>
          )}
          {onClose && (
            <Button onClick={onClose} variant="ghost">
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get standard service descriptions
function getServiceDescription(service: string): string {
  const descriptions: Record<string, string> = {
    "Forestry Mulching- 8\"DBH Package": `At Tree Shop, we are committed to providing high-quality land clearing services tailored to your project's needs. Our approach is designed to ensure efficiency and the highest quality outcome through a phased process.

Service Phase:
Forestry Mulching- Grind up unwanted trees, shrubs, palmettos, and other vegetation with a diameter at breast height (DBH) not exceeding 8 inches. The mulch produced is evenly spread across the job site, enhancing soil protection and fertility. Our method ensures minimal soil disturbance and preserves root structures.

If non-vegetative debris, such as construction materials, trash, or discarded items, is present throughout the property, it is the responsibility of the landowner to remove it prior to our arrival.`,
    
    "Land Clearing Services": `Comprehensive, Transparent, and Tailored for Success!

At Tree Shop, we are committed to providing high-quality land clearing services tailored to your project's needs. Our approach begins with the selective removal of trees and excavation of stumps to prepare the site for development. All removed material is sorted into logs, brush, and stumps to streamline processing and disposal.

Following the clearing, we proceed with grubbing, which involves removing organic material beneath the surface that may impact the soil's stability. This ensures a strong foundation for future construction, minimizing the risk of settling.`,
    
    "Forestry Mulching- 12\"DBH Package": "Complete forestry mulching for trees up to 12 inches DBH. Includes grinding of all vegetation and even distribution of mulch across the site.",
    
    "Forestry Mulching- 6\"DBH Package": "Forestry mulching for smaller vegetation up to 6 inches DBH. Perfect for maintaining trails and clearing underbrush.",
  };

  return descriptions[service] || "Professional service as discussed.";
}