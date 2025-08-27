// Tree Shop Business Configuration
// Standard packages, pricing, and terms

export const treeShopConfig = {
  company: {
    name: "Tree Shop",
    phone: "(386)843-5266",
    email: "office@fltreeshop.com",
    website: "treeshop.app",
    address: {
      street: "",
      city: "",
      state: "FL",
      zip: "",
    },
  },

  // Standard Service Packages
  packages: {
    forestryMulching: [
      {
        id: "fm-6dbh",
        name: "Forestry Mulching- 6\"DBH Package",
        description: "Grind vegetation up to 6\" diameter at breast height",
        basePrice: 1800,
        pricePerAcre: 1800,
        minAcres: 0.5,
        maxDBH: 6,
        includesDebrisHaul: false,
      },
      {
        id: "fm-8dbh",
        name: "Forestry Mulching- 8\"DBH Package",
        description: "Grind vegetation up to 8\" diameter at breast height",
        basePrice: 2200,
        pricePerAcre: 2200,
        minAcres: 0.5,
        maxDBH: 8,
        includesDebrisHaul: false,
      },
      {
        id: "fm-12dbh",
        name: "Forestry Mulching- 12\"DBH Package",
        description: "Grind vegetation up to 12\" diameter at breast height",
        basePrice: 3000,
        pricePerAcre: 3000,
        minAcres: 0.5,
        maxDBH: 12,
        includesDebrisHaul: false,
      },
    ],
    
    landClearing: {
      dayRate: 3500,
      equipmentRate: 4500, // Equipment + labor per day
      debrisHaulRate: 23, // Per cubic yard
      grubbing: {
        included: true,
        description: "Removal of organic material beneath surface",
      },
      averageDebrisPerAcre: 85, // Cubic yards
      daysPerQuarterAcre: 2,
    },

    treeServices: {
      removal: {
        smallTree: 350, // < 20ft
        mediumTree: 750, // 20-40ft
        largeTree: 1500, // > 40ft
      },
      trimming: {
        hourlyRate: 250,
        minHours: 2,
      },
      stumpGrinding: {
        perInch: 3, // Per inch of diameter
        minCharge: 150,
      },
    },
  },

  // Financing Options
  financing: {
    provider: "Wisetack",
    maxMonths: 24,
    apr: 0,
    prequalifyUrl: "https://wisetack.us/#/gc0y1lm/prequalify",
    features: [
      "0% APR up to 24 months",
      "No impact to credit score for prequalification",
      "No hidden fees",
      "No prepayment penalties",
    ],
  },

  // Standard Terms
  terms: {
    environmental: {
      title: "Environmental Responsibility",
      text: "Tree Shop is committed to environmental stewardship and will not impact federally protected wetlands. Any necessary changes to the project scope for environmental reasons will be communicated and approved before proceeding.",
    },
    permits: {
      title: "Permit Responsibility",
      text: "The landowner is responsible for obtaining all necessary permits. Tree Shop will adhere to all legal and environmental guidelines during the project.",
    },
    changeOrders: {
      title: "Change Orders",
      text: "Unforeseen conditions may necessitate a change in scope or budget. Any adjustments will be managed through formal change orders.",
    },
    payment: {
      title: "Payment Terms",
      depositPercent: 0.25, // 25% default
      minimumDeposit: 250,
      lateFeeDaily: 0.03, // 3% daily
      validityDays: 60,
      terms: [
        "Deposit required to secure scheduling",
        "Remaining balance due upon project completion",
        "3% daily fee applies to late payments",
        "Estimates valid for 60 days from proposal date",
      ],
    },
  },

  // Service Area
  serviceArea: {
    primary: ["Volusia", "Flagler", "St. Johns", "Putnam", "Marion"],
    extended: ["Lake", "Seminole", "Orange", "Brevard"],
    state: "FL",
  },

  // Lead Scoring Weights (for TreeAI integration)
  leadScoring: {
    factors: {
      acreage: {
        weight: 30,
        optimal: 2.5, // Optimal acreage for profitability
      },
      packageSelected: {
        weight: 25,
        preferredPackages: ["fm-12dbh", "land-clearing"],
      },
      location: {
        weight: 20,
        primaryAreaBonus: 10,
      },
      timeline: {
        weight: 15,
        urgentBonus: 10, // Within 2 weeks
      },
      budget: {
        weight: 10,
        minimumValue: 2000,
      },
    },
  },

  // Proposal Templates
  templates: {
    scopeOfWork: {
      forestryMulching: "Forestry Mulch the highlighted area ([ACRES] Acre) at the [PACKAGE] to open up the land for access per the attached site plan.",
      landClearing: "Remove trees that are declining, interfering with utilities, or marked. Day Rate $[RATE] x[DAYS]. All debris [DEBRIS_HANDLING].",
      treeRemoval: "Professional removal of [COUNT] trees from the property. All safety protocols will be followed.",
    },
  },

  // KPI Targets
  kpiTargets: {
    leadConversionRate: 0.25, // 25% target
    avgResponseTime: 2, // Hours
    proposalAcceptanceRate: 0.35, // 35%
    avgJobValue: 3500,
    customerSatisfaction: 4.8, // Out of 5
  },
};

// Helper Functions
export function calculatePackagePrice(
  packageId: string,
  acres: number
): number {
  const pkg = treeShopConfig.packages.forestryMulching.find(
    (p) => p.id === packageId
  );
  
  if (!pkg) return 0;
  
  // Minimum charge or per-acre rate
  const calculatedPrice = Math.max(
    pkg.basePrice,
    pkg.pricePerAcre * acres
  );
  
  return Math.round(calculatedPrice);
}

export function calculateLandClearingPrice(
  acres: number,
  includeHauling: boolean = true
): { labor: number; hauling: number; total: number } {
  const config = treeShopConfig.packages.landClearing;
  
  // Calculate days needed
  const days = Math.ceil((acres / 0.25) * config.daysPerQuarterAcre);
  
  // Labor cost
  const labor = days * config.equipmentRate;
  
  // Hauling cost
  const hauling = includeHauling
    ? Math.round(acres * config.averageDebrisPerAcre * config.debrisHaulRate)
    : 0;
  
  return {
    labor,
    hauling,
    total: labor + hauling,
  };
}

export function calculateDeposit(total: number): number {
  const { depositPercent, minimumDeposit } = treeShopConfig.terms.payment;
  
  return Math.max(
    minimumDeposit,
    Math.round(total * depositPercent)
  );
}

export function formatProposalNumber(): string {
  // Generate proposal number based on current count
  // In production, this would query the database for the next number
  const baseNumber = 1447; // Starting from your last proposal
  const randomOffset = Math.floor(Math.random() * 10);
  return (baseNumber + randomOffset).toString();
}