"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DirectoryLayout from "@/components/shared/DirectoryLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

interface ServiceLine {
  service: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface ProposalForm {
  // Customer Info (from lead or new)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  propertyAddress: string;
  zipCode: string;
  
  // Property Details
  acreage: number;
  
  // Services
  services: ServiceLine[];
  
  // Pricing
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  
  // Proposal Details
  validDays: number;
  terms: string;
  notes: string;
  
  // Tracking
  leadId?: string;
  stageHistory: {
    stage: string;
    timestamp: number;
    notes?: string;
  }[];
}

export default function NewProposalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get("leadId");
  const [loading, setLoading] = useState(!!leadId);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [proposal, setProposal] = useState<ProposalForm>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    propertyAddress: "",
    zipCode: "",
    acreage: 0,
    services: [],
    subtotal: 0,
    taxRate: 0.08, // 8% default
    tax: 0,
    total: 0,
    validDays: 30,
    terms: "Net 30 - Payment due within 30 days of approval",
    notes: "",
    leadId: leadId || undefined,
    stageHistory: [
      {
        stage: "proposal_created",
        timestamp: Date.now(),
        notes: leadId ? "Converted from lead" : "Created from scratch",
      },
    ],
  });

  // Load lead data if converting
  useEffect(() => {
    if (leadId) {
      fetchLeadData(leadId);
    }
  }, [leadId]);

  const fetchLeadData = async (id: string) => {
    try {
      // In production, fetch from Convex
      // For now, mock the data
      setProposal((prev) => ({
        ...prev,
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "555-0123",
        propertyAddress: "123 Oak Street",
        acreage: 2.5,
        stageHistory: [
          { stage: "lead_created", timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 },
          { stage: "lead_contacted", timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 },
          { stage: "lead_qualified", timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
          { stage: "proposal_created", timestamp: Date.now(), notes: "Converted from lead" },
        ],
      }));
      setLoading(false);
    } catch (error) {
      console.error("Error loading lead:", error);
      setLoading(false);
    }
  };

  const addServiceLine = () => {
    setProposal((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        {
          service: "",
          description: "",
          quantity: 1,
          unit: "hours",
          unitPrice: 0,
          total: 0,
        },
      ],
    }));
  };

  const updateServiceLine = (index: number, field: keyof ServiceLine, value: any) => {
    setProposal((prev) => {
      const newServices = [...prev.services];
      newServices[index] = {
        ...newServices[index],
        [field]: value,
      };
      
      // Recalculate line total
      newServices[index].total = newServices[index].quantity * newServices[index].unitPrice;
      
      // Recalculate totals
      const subtotal = newServices.reduce((sum, line) => sum + line.total, 0);
      const tax = subtotal * prev.taxRate;
      const total = subtotal + tax;
      
      return {
        ...prev,
        services: newServices,
        subtotal,
        tax,
        total,
      };
    });
  };

  const removeServiceLine = (index: number) => {
    setProposal((prev) => {
      const newServices = prev.services.filter((_, i) => i !== index);
      const subtotal = newServices.reduce((sum, line) => sum + line.total, 0);
      const tax = subtotal * prev.taxRate;
      const total = subtotal + tax;
      
      return {
        ...prev,
        services: newServices,
        subtotal,
        tax,
        total,
      };
    });
  };

  const saveProposal = async (status: "draft" | "sent" = "draft") => {
    try {
      // Save to Convex
      console.log("Saving proposal:", proposal);
      
      // Add to stage history
      setProposal((prev) => ({
        ...prev,
        stageHistory: [
          ...prev.stageHistory,
          {
            stage: status === "sent" ? "proposal_sent" : "proposal_saved",
            timestamp: Date.now(),
          },
        ],
      }));
      
      alert(`Proposal ${status === "sent" ? "sent" : "saved"} successfully!`);
      router.push("/proposals");
    } catch (error) {
      console.error("Error saving proposal:", error);
      alert("Failed to save proposal");
    }
  };

  const steps = [
    { id: 1, name: "Customer Info", icon: "👤" },
    { id: 2, name: "Services", icon: "🛠" },
    { id: 3, name: "Terms & Review", icon: "📋" },
  ];

  if (loading) {
    return (
      <DirectoryLayout title="Loading..." subtitle="Fetching lead data...">
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-400">Loading lead information...</div>
          </div>
        </Card>
      </DirectoryLayout>
    );
  }

  return (
    <DirectoryLayout
      title="Create Proposal"
      subtitle={leadId ? `Converting lead to proposal` : "New proposal from scratch"}
      actions={
        <>
          <Button variant="ghost" onClick={() => router.push("/proposals")}>
            Cancel
          </Button>
        </>
      }
    >
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex-1 text-center ${
                step.id <= currentStep ? "text-green-500" : "text-gray-500"
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl">{step.icon}</span>
              </div>
              <div className="text-sm">{step.name}</div>
              {step.id < steps.length && (
                <div
                  className={`h-1 mt-2 ${
                    step.id < currentStep ? "bg-green-500" : "bg-gray-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stage History (if from lead) */}
      {leadId && (
        <Card className="mb-6 bg-gray-900">
          <h3 className="text-lg font-medium text-green-500 mb-4">Conversion History</h3>
          <div className="space-y-2">
            {proposal.stageHistory.map((stage, index) => (
              <div key={index} className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">
                  {new Date(stage.timestamp).toLocaleDateString()}
                </span>
                <Badge variant="success" size="sm">
                  {stage.stage.replace(/_/g, " ").toUpperCase()}
                </Badge>
                {stage.notes && (
                  <span className="text-gray-400">{stage.notes}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Step 1: Customer Info */}
      {currentStep === 1 && (
        <Card>
          <h2 className="text-xl font-semibold text-green-500 mb-6">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Customer Name"
              value={proposal.customerName}
              onChange={(e) => setProposal({ ...proposal, customerName: e.target.value })}
              placeholder="John Doe"
            />
            <Input
              label="Email"
              type="email"
              value={proposal.customerEmail}
              onChange={(e) => setProposal({ ...proposal, customerEmail: e.target.value })}
              placeholder="customer@email.com"
            />
            <Input
              label="Phone"
              value={proposal.customerPhone}
              onChange={(e) => setProposal({ ...proposal, customerPhone: e.target.value })}
              placeholder="(555) 123-4567"
            />
            <Input
              label="Property Address"
              value={proposal.propertyAddress}
              onChange={(e) => setProposal({ ...proposal, propertyAddress: e.target.value })}
              placeholder="123 Oak Street"
            />
            <Input
              label="Zip Code"
              value={proposal.zipCode}
              onChange={(e) => setProposal({ ...proposal, zipCode: e.target.value })}
              placeholder="12345"
            />
            <Input
              label="Acreage"
              type="number"
              value={proposal.acreage}
              onChange={(e) => setProposal({ ...proposal, acreage: parseFloat(e.target.value) })}
              placeholder="2.5"
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setCurrentStep(2)} variant="primary">
              Next: Services
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Services */}
      {currentStep === 2 && (
        <Card>
          <h2 className="text-xl font-semibold text-green-500 mb-6">Services & Pricing</h2>
          
          {proposal.services.map((service, index) => (
            <Card key={index} className="mb-4 bg-gray-900">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Service"
                    value={service.service}
                    onChange={(e) => updateServiceLine(index, "service", e.target.value)}
                    placeholder="Forestry Mulching"
                  />
                </div>
                <Input
                  label="Quantity"
                  type="number"
                  value={service.quantity}
                  onChange={(e) => updateServiceLine(index, "quantity", parseFloat(e.target.value))}
                />
                <Input
                  label="Unit"
                  value={service.unit}
                  onChange={(e) => updateServiceLine(index, "unit", e.target.value)}
                  placeholder="acres"
                />
                <Input
                  label="Unit Price"
                  type="number"
                  value={service.unitPrice}
                  onChange={(e) => updateServiceLine(index, "unitPrice", parseFloat(e.target.value))}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Total</label>
                  <p className="text-2xl font-bold text-green-500">
                    ${service.total.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Input
                  label="Description"
                  value={service.description}
                  onChange={(e) => updateServiceLine(index, "description", e.target.value)}
                  placeholder="Complete forestry mulching of specified area"
                />
              </div>
              <Button
                onClick={() => removeServiceLine(index)}
                variant="danger"
                size="sm"
                className="mt-2"
              >
                Remove
              </Button>
            </Card>
          ))}
          
          <Button onClick={addServiceLine} variant="secondary" className="mb-6">
            + Add Service Line
          </Button>
          
          {/* Totals */}
          <Card className="bg-gray-900">
            <div className="space-y-2 text-right">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal:</span>
                <span className="text-xl">${proposal.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tax ({(proposal.taxRate * 100).toFixed(0)}%):</span>
                <span className="text-xl">${proposal.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2">
                <span className="text-gray-400">Total:</span>
                <span className="text-3xl font-bold text-green-500">
                  ${proposal.total.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
          
          <div className="mt-6 flex justify-between">
            <Button onClick={() => setCurrentStep(1)} variant="ghost">
              Back
            </Button>
            <Button onClick={() => setCurrentStep(3)} variant="primary">
              Next: Terms & Review
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Terms & Review */}
      {currentStep === 3 && (
        <Card>
          <h2 className="text-xl font-semibold text-green-500 mb-6">Terms & Review</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Proposal Valid For (Days)
              </label>
              <input
                type="number"
                value={proposal.validDays}
                onChange={(e) => setProposal({ ...proposal, validDays: parseInt(e.target.value) })}
                className="w-32 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Payment Terms
              </label>
              <textarea
                value={proposal.terms}
                onChange={(e) => setProposal({ ...proposal, terms: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Additional Notes
              </label>
              <textarea
                value={proposal.notes}
                onChange={(e) => setProposal({ ...proposal, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="Any additional notes or special conditions..."
              />
            </div>
          </div>
          
          {/* Review Summary */}
          <Card className="mt-6 bg-gray-900">
            <h3 className="text-lg font-medium text-green-500 mb-4">Proposal Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Customer:</span>{" "}
                <span className="text-white">{proposal.customerName}</span>
              </div>
              <div>
                <span className="text-gray-400">Property:</span>{" "}
                <span className="text-white">{proposal.propertyAddress}</span>
              </div>
              <div>
                <span className="text-gray-400">Services:</span>{" "}
                <span className="text-white">{proposal.services.length} items</span>
              </div>
              <div>
                <span className="text-gray-400">Total:</span>{" "}
                <span className="text-green-500 font-bold text-lg">
                  ${proposal.total.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
          
          <div className="mt-6 flex justify-between">
            <Button onClick={() => setCurrentStep(2)} variant="ghost">
              Back
            </Button>
            <div className="flex gap-4">
              <Button onClick={() => saveProposal("draft")} variant="secondary">
                Save as Draft
              </Button>
              <Button onClick={() => saveProposal("sent")} variant="primary">
                Send Proposal
              </Button>
            </div>
          </div>
        </Card>
      )}
    </DirectoryLayout>
  );
}