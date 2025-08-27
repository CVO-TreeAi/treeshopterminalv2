"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import DirectoryLayout from "@/components/shared/DirectoryLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import PricingCalculator, { PricingResult } from "@/components/pricing/PricingCalculator";
import { treeShopConfig, formatProposalNumber } from "@/lib/treeShopConfig";
import { pdf, PDFDownloadLink } from "@react-pdf/renderer";
import ProposalPDFDocument from "@/components/proposals/ProposalPDF";

// Dynamic import for PDF viewer to avoid SSR issues
const ProposalPDFViewer = dynamic(
  () => import("@/components/proposals/ProposalPDF").then(mod => mod.ProposalPDFViewer),
  { 
    ssr: false,
    loading: () => <div className="text-center py-8 text-gray-400">Loading PDF preview...</div>
  }
);

interface ProposalData {
  // Meta
  proposalNumber: string;
  leadId?: string;
  status: "draft" | "sent" | "viewed" | "approved" | "rejected";
  
  // Customer
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  
  // Property
  propertyAddress: string;
  zipCode: string;
  acreage: number;
  serviceType: "forestry-mulching" | "land-clearing" | null;
  
  // Pricing
  pricingResult: PricingResult | null;
  
  // Additional
  notes: string;
  validDays: number;
  createdAt: number;
}

function ProposalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get("leadId");
  
  const [loading, setLoading] = useState(!!leadId);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  
  const [proposal, setProposal] = useState<ProposalData>({
    proposalNumber: formatProposalNumber(),
    leadId: leadId || undefined,
    status: "draft",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    propertyAddress: "",
    zipCode: "",
    acreage: 1,
    serviceType: null,
    pricingResult: null,
    notes: "",
    validDays: 60,
    createdAt: Date.now(),
  });

  // Fetch lead data if converting from lead
  useEffect(() => {
    if (leadId) {
      fetchLeadData(leadId);
    }
  }, [leadId]);

  const fetchLeadData = async (id: string) => {
    try {
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
      if (data.status === "success" && data.value?.completedLeads) {
        const lead = data.value.completedLeads.find((l: any) => l._id === id);
        
        if (lead) {
          setProposal(prev => ({
            ...prev,
            customerName: lead.name || "",
            customerEmail: lead.email || "",
            customerPhone: lead.phone || "",
            customerAddress: lead.address || "",
            propertyAddress: lead.address || "",
            zipCode: lead.zipCode || "",
            acreage: lead.acreage || 1,
            serviceType: lead.selectedPackage?.includes("fm-") ? "forestry-mulching" : 
                        lead.selectedPackage?.includes("land") ? "land-clearing" : null,
            notes: lead.notes || "",
          }));
          
          // Auto-advance if we have enough data
          if (lead.name && lead.email && lead.phone) {
            setCurrentStep(2);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching lead:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProposal = async (status: "draft" | "sent") => {
    try {
      // Here we would save to Convex
      const proposalData = {
        ...proposal,
        status,
        updatedAt: Date.now(),
      };
      
      // For now, just log it
      console.log("Saving proposal:", proposalData);
      
      // Generate PDF if sending
      if (status === "sent" && proposal.pricingResult) {
        await generateAndSendPDF();
      }
      
      // Navigate back to proposals list
      router.push("/proposals");
    } catch (error) {
      console.error("Error saving proposal:", error);
    }
  };

  const generateAndSendPDF = async () => {
    if (!proposal.pricingResult) return;
    
    const pdfData = {
      proposalNumber: proposal.proposalNumber,
      createdAt: proposal.createdAt,
      validUntil: Date.now() + (proposal.validDays * 24 * 60 * 60 * 1000),
      customer: {
        name: proposal.customerName,
        email: proposal.customerEmail,
        phone: proposal.customerPhone,
        address: proposal.customerAddress,
        zipCode: proposal.zipCode,
      },
      property: {
        address: proposal.propertyAddress,
        acreage: proposal.acreage,
      },
      services: proposal.pricingResult.breakdown.map((item: any) => ({
        service: item.item || item.service,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      pricing: {
        subtotal: proposal.pricingResult.subtotal,
        tax: proposal.pricingResult.tax,
        total: proposal.pricingResult.total,
        deposit: proposal.pricingResult.deposit,
      },
      notes: proposal.notes,
    };
    
    // Generate PDF blob
    const blob = await pdf(<ProposalPDFDocument proposal={pdfData} />).toBlob();
    
    // For now, just download it
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Proposal-${proposal.proposalNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const steps = [
    { id: 1, name: "Customer Info", icon: "👤" },
    { id: 2, name: "Property & Service", icon: "🏡" },
    { id: 3, name: "Pricing", icon: "💰" },
    { id: 4, name: "Review & Send", icon: "📄" },
  ];

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(proposal.customerName && proposal.customerEmail && proposal.customerPhone);
      case 2:
        return !!(proposal.propertyAddress && proposal.acreage > 0 && proposal.serviceType);
      case 3:
        return !!proposal.pricingResult;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <DirectoryLayout title="Loading..." subtitle="Fetching lead data...">
          <Card>
            <div className="text-center py-12">
              <div className="text-gray-400">Loading lead information...</div>
            </div>
          </Card>
        </DirectoryLayout>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <DirectoryLayout
        title="Create Proposal"
        subtitle={`Proposal #${proposal.proposalNumber}`}
        actions={
          <Button variant="ghost" onClick={() => router.push("/proposals")}>
            Cancel
          </Button>
        }
      >
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex-1 text-center cursor-pointer ${
                  step.id === currentStep 
                    ? "text-green-500" 
                    : step.id < currentStep 
                    ? "text-green-400" 
                    : "text-gray-500"
                }`}
                onClick={() => {
                  if (step.id < currentStep || isStepValid(currentStep)) {
                    setCurrentStep(step.id);
                  }
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-2">{step.icon}</span>
                  <div className="text-sm">{step.name}</div>
                  {step.id < steps.length && (
                    <div className={`h-1 w-full mt-2 ${
                      step.id < currentStep ? "bg-green-500" : "bg-gray-700"
                    }`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Customer Info */}
        {currentStep === 1 && (
          <Card>
            <h2 className="text-xl font-semibold text-green-500 mb-6">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Customer Name *"
                value={proposal.customerName}
                onChange={(e) => setProposal(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="John Smith"
              />
              <Input
                label="Email *"
                type="email"
                value={proposal.customerEmail}
                onChange={(e) => setProposal(prev => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="john@example.com"
              />
              <Input
                label="Phone *"
                value={proposal.customerPhone}
                onChange={(e) => setProposal(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
              <Input
                label="Customer Address"
                value={proposal.customerAddress}
                onChange={(e) => setProposal(prev => ({ ...prev, customerAddress: e.target.value }))}
                placeholder="123 Main St, City, FL"
              />
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!isStepValid(1)}
                variant="primary"
              >
                Next: Property Details
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Property & Service */}
        {currentStep === 2 && (
          <Card>
            <h2 className="text-xl font-semibold text-green-500 mb-6">Property & Service</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Input
                label="Property Address *"
                value={proposal.propertyAddress}
                onChange={(e) => setProposal(prev => ({ ...prev, propertyAddress: e.target.value }))}
                placeholder="456 Oak Rd, City, FL"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Acreage *"
                  type="number"
                  step="0.25"
                  value={proposal.acreage}
                  onChange={(e) => setProposal(prev => ({ ...prev, acreage: parseFloat(e.target.value) || 0 }))}
                  placeholder="2.5"
                />
                <Input
                  label="ZIP Code"
                  value={proposal.zipCode}
                  onChange={(e) => setProposal(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="32174"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Service Type *</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setProposal(prev => ({ ...prev, serviceType: "forestry-mulching" }))}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    proposal.serviceType === "forestry-mulching"
                      ? "border-green-500 bg-green-500/10"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                >
                  <h4 className="font-medium">🌲 Forestry Mulching</h4>
                  <p className="text-sm text-gray-400 mt-1">DBH packages with per-acre pricing</p>
                  <p className="text-xs text-gray-500 mt-2">Best for: Light to medium vegetation</p>
                </button>
                <button
                  onClick={() => setProposal(prev => ({ ...prev, serviceType: "land-clearing" }))}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    proposal.serviceType === "land-clearing"
                      ? "border-green-500 bg-green-500/10"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                >
                  <h4 className="font-medium">🚜 Land Clearing</h4>
                  <p className="text-sm text-gray-400 mt-1">Day rate with debris hauling option</p>
                  <p className="text-xs text-gray-500 mt-2">Best for: Heavy clearing & grubbing</p>
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <Button onClick={() => setCurrentStep(1)} variant="ghost">
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!isStepValid(2)}
                variant="primary"
              >
                Next: Calculate Pricing
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Pricing */}
        {currentStep === 3 && (
          <div>
            <PricingCalculator
              serviceType={proposal.serviceType}
              acreage={proposal.acreage}
              onPricingCalculated={(pricing: PricingResult) => {
                setProposal(prev => ({ ...prev, pricingResult: pricing }));
              }}
            />
            
            <div className="mt-6 flex justify-between">
              <Button onClick={() => setCurrentStep(2)} variant="ghost">
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
                disabled={!isStepValid(3)}
                variant="primary"
              >
                Next: Review Proposal
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Send */}
        {currentStep === 4 && proposal.pricingResult && (
          <Card>
            <h2 className="text-xl font-semibold text-green-500 mb-6">Review & Send</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Additional Notes</label>
              <textarea
                value={proposal.notes}
                onChange={(e) => setProposal(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                rows={3}
                placeholder="Any additional notes or special instructions..."
              />
            </div>

            {/* PDF Preview Toggle */}
            <div className="mb-6">
              <Button
                onClick={() => setShowPDFPreview(!showPDFPreview)}
                variant="secondary"
                fullWidth
              >
                {showPDFPreview ? "Hide" : "Show"} PDF Preview
              </Button>
            </div>

            {/* PDF Preview */}
            {showPDFPreview && (
              <div className="mb-6">
                <ProposalPDFViewer
                  proposal={{
                    proposalNumber: proposal.proposalNumber,
                    createdAt: proposal.createdAt,
                    validUntil: Date.now() + (proposal.validDays * 24 * 60 * 60 * 1000),
                    customer: {
                      name: proposal.customerName,
                      email: proposal.customerEmail,
                      phone: proposal.customerPhone,
                      address: proposal.customerAddress,
                      zipCode: proposal.zipCode,
                    },
                    property: {
                      address: proposal.propertyAddress,
                      acreage: proposal.acreage,
                    },
                    services: proposal.pricingResult.breakdown.map((item: any) => ({
        service: item.item || item.service,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
                    pricing: {
                      subtotal: proposal.pricingResult.subtotal,
                      tax: proposal.pricingResult.tax,
                      total: proposal.pricingResult.total,
                      deposit: proposal.pricingResult.deposit,
                    },
                    notes: proposal.notes,
                  }}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button onClick={() => setCurrentStep(3)} variant="ghost">
                Back
              </Button>
              <div className="flex gap-4">
                <Button onClick={() => saveProposal("draft")} variant="secondary">
                  Save as Draft
                </Button>
                <PDFDownloadLink
                  document={
                    <ProposalPDFDocument
                      proposal={{
                        proposalNumber: proposal.proposalNumber,
                        createdAt: proposal.createdAt,
                        validUntil: Date.now() + (proposal.validDays * 24 * 60 * 60 * 1000),
                        customer: {
                          name: proposal.customerName,
                          email: proposal.customerEmail,
                          phone: proposal.customerPhone,
                          address: proposal.customerAddress,
                          zipCode: proposal.zipCode,
                        },
                        property: {
                          address: proposal.propertyAddress,
                          acreage: proposal.acreage,
                        },
                        services: proposal.pricingResult.breakdown.map((item: any) => ({
        service: item.item || item.service,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
                        pricing: {
                          subtotal: proposal.pricingResult.subtotal,
                          tax: proposal.pricingResult.tax,
                          total: proposal.pricingResult.total,
                          deposit: proposal.pricingResult.deposit,
                        },
                        notes: proposal.notes,
                      }}
                    />
                  }
                  fileName={`Proposal-${proposal.proposalNumber}.pdf`}
                >
                  {({ loading: pdfLoading }) => (
                    <Button variant="success" disabled={pdfLoading}>
                      {pdfLoading ? "Generating PDF..." : "Download PDF"}
                    </Button>
                  )}
                </PDFDownloadLink>
                <Button onClick={() => saveProposal("sent")} variant="primary">
                  Send Proposal
                </Button>
              </div>
            </div>
          </Card>
        )}
      </DirectoryLayout>
    </AuthenticatedLayout>
  );
}

export default function NewProposalV2Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-green-500">Loading...</div></div>}>
      <ProposalForm />
    </Suspense>
  );
}