"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { treeShopConfig, calculatePackagePrice, calculateLandClearingPrice, calculateDeposit } from "@/lib/treeShopConfig";

interface PricingCalculatorProps {
  serviceType: "forestry-mulching" | "land-clearing" | null;
  acreage: number;
  onPricingCalculated: (pricing: PricingResult) => void;
  onApplyToProposal?: () => void;
  initialData?: {
    packageId?: string;
    includeHauling?: boolean;
    customizations?: any;
  };
}

export interface PricingResult {
  serviceType: "forestry-mulching" | "land-clearing";
  acreage: number;
  packageId?: string;
  packageName?: string;
  laborCost: number;
  haulingCost: number;
  total: number;
  deposit: number;
  breakdown: {
    item: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }[];
}

export default function PricingCalculator({
  serviceType,
  acreage,
  onPricingCalculated,
  onApplyToProposal,
  initialData,
}: PricingCalculatorProps) {
  const [selectedPackage, setSelectedPackage] = useState(initialData?.packageId || "");
  const [includeHauling, setIncludeHauling] = useState(initialData?.includeHauling ?? true);
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [pricing, setPricing] = useState<PricingResult | null>(null);


  useEffect(() => {
    calculatePricing();
  }, [serviceType, acreage, selectedPackage, includeHauling, customRate]);

  const calculatePricing = () => {
    if (!serviceType || !acreage) return;

    let result: PricingResult = {
      serviceType,
      acreage,
      laborCost: 0,
      haulingCost: 0,
      total: 0,
      deposit: 0,
      breakdown: [],
    };

    if (serviceType === "forestry-mulching" && selectedPackage) {
      // Forestry Mulching Pricing
      const pkg = treeShopConfig.packages.forestryMulching.find(p => p.id === selectedPackage);
      if (pkg) {
        const basePrice = calculatePackagePrice(selectedPackage, acreage);
        
        result.packageId = pkg.id;
        result.packageName = pkg.name;
        result.laborCost = basePrice;
        result.haulingCost = 0; // Forestry mulching doesn't include hauling
        result.total = basePrice;
        result.deposit = calculateDeposit(result.total);
        
        result.breakdown = [
          {
            item: pkg.name,
            description: `Grind vegetation up to ${pkg.maxDBH}" diameter`,
            quantity: acreage,
            unit: "acres",
            unitPrice: pkg.pricePerAcre,
            total: basePrice,
          },
        ];
      }
    } else if (serviceType === "land-clearing") {
      // Land Clearing Pricing
      const clearingPrices = calculateLandClearingPrice(acreage, includeHauling);
      
      result.laborCost = clearingPrices.labor;
      result.haulingCost = clearingPrices.hauling;
      result.total = clearingPrices.total;
      result.deposit = calculateDeposit(result.total);
      
      const config = treeShopConfig.packages.landClearing;
      const days = Math.ceil((acreage / 0.25) * config.daysPerQuarterAcre);
      
      result.breakdown = [
        {
          item: "Land Clearing & Grubbing",
          description: "Complete removal with equipment and labor",
          quantity: days,
          unit: "days",
          unitPrice: config.equipmentRate,
          total: clearingPrices.labor,
        },
      ];
      
      if (includeHauling) {
        result.breakdown.push({
          item: "Debris Hauling",
          description: "Load and haul all cleared material",
          quantity: Math.round(acreage * config.averageDebrisPerAcre),
          unit: "cubic yards",
          unitPrice: config.debrisHaulRate,
          total: clearingPrices.hauling,
        });
      }
    }

    setPricing(result);
    onPricingCalculated(result);
  };

  if (!serviceType) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-400">Please select a service type to calculate pricing</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Service Type Selection */}
      <Card>
        <h3 className="text-lg font-bold text-green-500 mb-4">Service Configuration</h3>
        
        {serviceType === "forestry-mulching" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Package</label>
              <div className="grid grid-cols-1 gap-2">
                {treeShopConfig.packages.forestryMulching.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      selectedPackage === pkg.id
                        ? "border-green-500 bg-green-500/10"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{pkg.name}</h4>
                        <p className="text-sm text-gray-400 mt-1">{pkg.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">${pkg.pricePerAcre}/acre</p>
                        <p className="text-xs text-gray-400">Min: ${pkg.basePrice}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {serviceType === "land-clearing" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Service Options</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-gray-600 rounded-lg hover:border-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeHauling}
                    onChange={(e) => setIncludeHauling(e.target.checked)}
                    className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                  />
                  <div>
                    <p className="font-medium">Include Debris Hauling</p>
                    <p className="text-sm text-gray-400">
                      ${treeShopConfig.packages.landClearing.debrisHaulRate}/cubic yard 
                      (~{treeShopConfig.packages.landClearing.averageDebrisPerAcre} yards per acre)
                    </p>
                  </div>
                </label>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">
                Equipment Rate: ${treeShopConfig.packages.landClearing.equipmentRate}/day
              </p>
              <p className="text-sm text-gray-400">
                Estimated: {Math.ceil((acreage / 0.25) * treeShopConfig.packages.landClearing.daysPerQuarterAcre)} days for {acreage} acres
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Pricing Breakdown */}
      {pricing && (
        <Card>
          <h3 className="text-lg font-bold text-green-500 mb-4">Pricing Breakdown</h3>
          
          <div className="space-y-3">
            {pricing.breakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start py-2 border-b border-gray-700">
                <div className="flex-1">
                  <p className="font-medium">{item.item}</p>
                  <p className="text-sm text-gray-400">{item.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.quantity} {item.unit} × ${item.unitPrice.toLocaleString()}/{item.unit.slice(0, -1)}
                  </p>
                </div>
                <p className="font-bold text-green-400">${item.total.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
            <div className="flex justify-between text-lg font-bold">
              <p>Total</p>
              <p className="text-green-400">${pricing.total.toFixed(2)}</p>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-700">
              <p>Required Deposit (25%)</p>
              <p className="font-bold text-yellow-400">${pricing.deposit.toFixed(2)}</p>
            </div>
          </div>

          {/* Financing Option */}
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-green-400 mb-1">Financing Available</p>
            <p className="text-xs text-gray-400">
              As low as ${(pricing.total / 24).toFixed(2)}/month with {treeShopConfig.financing.provider} 
              ({treeShopConfig.financing.apr}% APR for {treeShopConfig.financing.maxMonths} months)
            </p>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      {pricing && (
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              // Copy pricing to clipboard
              const text = `TreeShop Estimate\n${pricing.breakdown.map(i => `${i.item}: $${i.total}`).join('\n')}\nTotal: $${pricing.total.toFixed(2)}`;
              navigator.clipboard.writeText(text);
            }}
          >
            Copy Pricing
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              onPricingCalculated(pricing);
              if (onApplyToProposal) {
                onApplyToProposal();
              }
            }}
          >
            Apply to Proposal
          </Button>
        </div>
      )}
    </div>
  );
}