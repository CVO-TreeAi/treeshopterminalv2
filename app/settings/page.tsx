"use client";

import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import DirectoryLayout from "@/components/shared/DirectoryLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { treeShopConfig } from "@/lib/treeShopConfig";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("pricing");
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Pricing State - initialized from config
  const [forestryPackages, setForestryPackages] = useState(treeShopConfig.packages.forestryMulching);
  const [landClearingConfig, setLandClearingConfig] = useState(treeShopConfig.packages.landClearing);
  const [treeServicesConfig, setTreeServicesConfig] = useState(treeShopConfig.packages.treeServices);
  const [financingConfig, setFinancingConfig] = useState(treeShopConfig.financing);
  const [paymentTerms, setPaymentTerms] = useState(treeShopConfig.terms.payment);

  // Company Settings
  const [companyInfo, setCompanyInfo] = useState(treeShopConfig.company);
  const [serviceArea, setServiceArea] = useState(treeShopConfig.serviceArea);

  const tabs = [
    { id: "pricing", label: "Pricing & Packages", icon: "💰" },
    { id: "company", label: "Company Info", icon: "🏢" },
    { id: "terms", label: "Terms & Conditions", icon: "📋" },
    { id: "integrations", label: "Integrations", icon: "🔗" },
  ];

  const updateForestryPackage = (index: number, field: string, value: any) => {
    const updated = [...forestryPackages];
    updated[index] = { ...updated[index], [field]: value };
    setForestryPackages(updated);
    setHasChanges(true);
  };

  const updateLandClearing = (field: string, value: any) => {
    setLandClearingConfig(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const updateTreeService = (category: string, field: string, value: any) => {
    setTreeServicesConfig(prev => ({
      ...prev,
      [category]: { ...prev[category as keyof typeof prev], [field]: value }
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Here we would save to Convex or backend
      const settings = {
        forestryPackages,
        landClearingConfig,
        treeServicesConfig,
        financingConfig,
        paymentTerms,
        companyInfo,
        serviceArea,
        updatedAt: Date.now(),
      };
      
      console.log("Saving settings:", settings);
      
      // Save to localStorage for now
      localStorage.setItem("treeShopSettings", JSON.stringify(settings));
      
      setHasChanges(false);
      
      // Show success message
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <DirectoryLayout
        title="Settings"
        subtitle="Manage pricing, company info, and system configuration"
        actions={
          hasChanges && (
            <Button
              onClick={saveSettings}
              variant="primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )
        }
      >
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-green-500 text-black"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Pricing Tab */}
        {activeTab === "pricing" && (
          <div className="space-y-6">
            {/* Forestry Mulching Packages */}
            <Card>
              <h3 className="text-xl font-bold text-green-500 mb-6">🌲 Forestry Mulching Packages</h3>
              <div className="space-y-4">
                {forestryPackages.map((pkg, idx) => (
                  <div key={pkg.id} className="p-4 bg-gray-900 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <Input
                          label="Package Name"
                          value={pkg.name}
                          onChange={(e) => updateForestryPackage(idx, "name", e.target.value)}
                        />
                      </div>
                      <Input
                        label="Max DBH (inches)"
                        type="number"
                        value={pkg.maxDBH}
                        onChange={(e) => updateForestryPackage(idx, "maxDBH", parseInt(e.target.value))}
                      />
                      <Input
                        label="Price per Acre ($)"
                        type="number"
                        value={pkg.pricePerAcre}
                        onChange={(e) => updateForestryPackage(idx, "pricePerAcre", parseFloat(e.target.value))}
                      />
                      <Input
                        label="Minimum Charge ($)"
                        type="number"
                        value={pkg.basePrice}
                        onChange={(e) => updateForestryPackage(idx, "basePrice", parseFloat(e.target.value))}
                      />
                      <div className="md:col-span-3">
                        <Input
                          label="Description"
                          value={pkg.description}
                          onChange={(e) => updateForestryPackage(idx, "description", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Land Clearing Configuration */}
            <Card>
              <h3 className="text-xl font-bold text-green-500 mb-6">🚜 Land Clearing & Day Rates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Equipment + Labor Rate ($/day)"
                  type="number"
                  value={landClearingConfig.equipmentRate}
                  onChange={(e) => updateLandClearing("equipmentRate", parseFloat(e.target.value))}
                />
                <Input
                  label="Debris Haul Rate ($/cubic yard)"
                  type="number"
                  value={landClearingConfig.debrisHaulRate}
                  onChange={(e) => updateLandClearing("debrisHaulRate", parseFloat(e.target.value))}
                />
                <Input
                  label="Avg Debris per Acre (cubic yards)"
                  type="number"
                  value={landClearingConfig.averageDebrisPerAcre}
                  onChange={(e) => updateLandClearing("averageDebrisPerAcre", parseInt(e.target.value))}
                />
                <Input
                  label="Days per Quarter Acre"
                  type="number"
                  step="0.5"
                  value={landClearingConfig.daysPerQuarterAcre}
                  onChange={(e) => updateLandClearing("daysPerQuarterAcre", parseFloat(e.target.value))}
                />
                <Input
                  label="Day Rate (labor only) ($)"
                  type="number"
                  value={landClearingConfig.dayRate}
                  onChange={(e) => updateLandClearing("dayRate", parseFloat(e.target.value))}
                />
              </div>
            </Card>

            {/* Tree Services */}
            <Card>
              <h3 className="text-xl font-bold text-green-500 mb-6">🌳 Tree Services</h3>
              
              <div className="space-y-6">
                {/* Tree Removal */}
                <div>
                  <h4 className="font-medium text-gray-300 mb-3">Tree Removal</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Small Tree (< 20ft) ($)"
                      type="number"
                      value={treeServicesConfig.removal.smallTree}
                      onChange={(e) => updateTreeService("removal", "smallTree", parseFloat(e.target.value))}
                    />
                    <Input
                      label="Medium Tree (20-40ft) ($)"
                      type="number"
                      value={treeServicesConfig.removal.mediumTree}
                      onChange={(e) => updateTreeService("removal", "mediumTree", parseFloat(e.target.value))}
                    />
                    <Input
                      label="Large Tree (> 40ft) ($)"
                      type="number"
                      value={treeServicesConfig.removal.largeTree}
                      onChange={(e) => updateTreeService("removal", "largeTree", parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                {/* Trimming */}
                <div>
                  <h4 className="font-medium text-gray-300 mb-3">Tree Trimming</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Hourly Rate ($)"
                      type="number"
                      value={treeServicesConfig.trimming.hourlyRate}
                      onChange={(e) => updateTreeService("trimming", "hourlyRate", parseFloat(e.target.value))}
                    />
                    <Input
                      label="Minimum Hours"
                      type="number"
                      value={treeServicesConfig.trimming.minHours}
                      onChange={(e) => updateTreeService("trimming", "minHours", parseInt(e.target.value))}
                    />
                  </div>
                </div>

                {/* Stump Grinding */}
                <div>
                  <h4 className="font-medium text-gray-300 mb-3">Stump Grinding</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Per Inch of Diameter ($)"
                      type="number"
                      value={treeServicesConfig.stumpGrinding.perInch}
                      onChange={(e) => updateTreeService("stumpGrinding", "perInch", parseFloat(e.target.value))}
                    />
                    <Input
                      label="Minimum Charge ($)"
                      type="number"
                      value={treeServicesConfig.stumpGrinding.minCharge}
                      onChange={(e) => updateTreeService("stumpGrinding", "minCharge", parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Terms */}
            <Card>
              <h3 className="text-xl font-bold text-green-500 mb-6">💳 Payment Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Deposit Percent (%)"
                  type="number"
                  value={paymentTerms.depositPercent * 100}
                  onChange={(e) => setPaymentTerms(prev => ({ 
                    ...prev, 
                    depositPercent: parseFloat(e.target.value) / 100 
                  }))}
                />
                <Input
                  label="Minimum Deposit ($)"
                  type="number"
                  value={paymentTerms.minimumDeposit}
                  onChange={(e) => setPaymentTerms(prev => ({ 
                    ...prev, 
                    minimumDeposit: parseFloat(e.target.value) 
                  }))}
                />
                <Input
                  label="Late Fee Daily (%)"
                  type="number"
                  step="0.1"
                  value={paymentTerms.lateFeeDaily * 100}
                  onChange={(e) => setPaymentTerms(prev => ({ 
                    ...prev, 
                    lateFeeDaily: parseFloat(e.target.value) / 100 
                  }))}
                />
                <Input
                  label="Proposal Valid Days"
                  type="number"
                  value={paymentTerms.validityDays}
                  onChange={(e) => setPaymentTerms(prev => ({ 
                    ...prev, 
                    validityDays: parseInt(e.target.value) 
                  }))}
                />
              </div>
            </Card>

            {/* Financing Options */}
            <Card>
              <h3 className="text-xl font-bold text-green-500 mb-6">🏦 Financing Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Provider"
                  value={financingConfig.provider}
                  onChange={(e) => setFinancingConfig(prev => ({ ...prev, provider: e.target.value }))}
                />
                <Input
                  label="Max Months"
                  type="number"
                  value={financingConfig.maxMonths}
                  onChange={(e) => setFinancingConfig(prev => ({ ...prev, maxMonths: parseInt(e.target.value) }))}
                />
                <Input
                  label="APR (%)"
                  type="number"
                  value={financingConfig.apr}
                  onChange={(e) => setFinancingConfig(prev => ({ ...prev, apr: parseFloat(e.target.value) }))}
                />
                <div className="md:col-span-3">
                  <Input
                    label="Prequalify URL"
                    value={financingConfig.prequalifyUrl}
                    onChange={(e) => setFinancingConfig(prev => ({ ...prev, prequalifyUrl: e.target.value }))}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Company Tab */}
        {activeTab === "company" && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-bold text-green-500 mb-6">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  label="Phone"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, phone: e.target.value }))}
                />
                <Input
                  label="Email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  label="Website"
                  value={companyInfo.website}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-bold text-green-500 mb-6">Service Areas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Counties</label>
                  <textarea
                    value={serviceArea.primary.join(", ")}
                    onChange={(e) => setServiceArea(prev => ({ 
                      ...prev, 
                      primary: e.target.value.split(",").map(s => s.trim()) 
                    }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                    rows={3}
                    placeholder="Volusia, Flagler, St. Johns..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Extended Counties</label>
                  <textarea
                    value={serviceArea.extended.join(", ")}
                    onChange={(e) => setServiceArea(prev => ({ 
                      ...prev, 
                      extended: e.target.value.split(",").map(s => s.trim()) 
                    }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                    rows={3}
                    placeholder="Lake, Seminole, Orange..."
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Terms Tab */}
        {activeTab === "terms" && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-bold text-green-500 mb-6">Terms & Conditions Templates</h3>
              <div className="text-gray-400">
                <p>Terms and conditions templates will be configured here.</p>
                <p className="mt-2">This section will allow editing of:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Environmental Responsibility clauses</li>
                  <li>Permit Requirements</li>
                  <li>Change Order policies</li>
                  <li>Payment Terms details</li>
                  <li>Liability and Insurance</li>
                </ul>
              </div>
            </Card>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === "integrations" && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-bold text-green-500 mb-6">System Integrations</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-900 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Convex Backend</h4>
                    <p className="text-sm text-gray-400">Real-time data sync</p>
                  </div>
                  <Badge variant="success">Connected</Badge>
                </div>
                
                <div className="p-4 bg-gray-900 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Wisetack Financing</h4>
                    <p className="text-sm text-gray-400">Customer financing options</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                
                <div className="p-4 bg-gray-900 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">TreeShop.app</h4>
                    <p className="text-sm text-gray-400">Lead capture website</p>
                  </div>
                  <Badge variant="warning">Pending Integration</Badge>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Save Reminder */}
        {hasChanges && (
          <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
            <span>You have unsaved changes</span>
            <Button
              onClick={saveSettings}
              variant="primary"
              size="sm"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Now"}
            </Button>
          </div>
        )}
      </DirectoryLayout>
    </AuthenticatedLayout>
  );
}