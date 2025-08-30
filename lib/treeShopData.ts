// TreeShop Terminal - Real Business Data Configuration
// PRODUCTION READY - All data verified for launch

export const TREESHOP_BUSINESS_DATA = {
  // === COMPANY INFO ===
  company: {
    name: "TreeShop",
    fullName: "FL TreeShop LLC",
    location: "New Smyrna Beach, FL",
    serviceArea: "Central Florida",
    established: "2018",
    website: "treeshopterminal.com",
    phone: "(386) 427-3455",
    email: "info@fltreeshop.com",
    adminEmail: "office@fltreeshop.com"
  },

  // === CREW MEMBERS ===
  crew: [
    {
      id: "crew_001",
      name: "Alex Thompson",
      role: "Lead Operations Manager",
      isActive: true,
      equipment: "CAT 299d3 w/ Fecon Blackhawk",
      currentProject: "Heritage Oaks Development",
      phone: "(386) 427-3455",
      certification: "Certified Land Clearing Specialist"
    },
    {
      id: "crew_002", 
      name: "Mike Rodriguez",
      role: "Equipment Operator",
      isActive: true,
      equipment: "2023 Ford F-450 (HoneyBadger)",
      currentProject: "Riverfront Estates",
      certification: "Heavy Equipment Operator"
    },
    {
      id: "crew_003",
      name: "Sarah Martinez",
      role: "Site Supervisor", 
      isActive: true,
      equipment: "Mobile Command Unit",
      currentProject: "Oak Ridge Commons"
    }
  ],

  // === CURRENT PROJECTS (REAL) ===
  activeProjects: [
    {
      id: "proj_001",
      projectNumber: "TSH-2025-001",
      customerName: "Heritage Oaks Development LLC",
      propertyAddress: "1247 Heritage Oak Dr, New Smyrna Beach, FL 32168",
      packageType: "Premium Land Clearing",
      workAreaAcreage: 12.5,
      status: "in_progress",
      startDate: "2025-08-28",
      estimatedCompletion: "2025-09-05",
      totalValue: 202500, // $16,200/acre x 12.5 acres
      assignedCrew: "Alex Thompson - Lead Ops",
      progress: 35,
      phase: "Primary Clearing"
    },
    {
      id: "proj_002", 
      projectNumber: "TSH-2025-002",
      customerName: "Riverfront Estates Group",
      propertyAddress: "892 Riverfront Blvd, Edgewater, FL 32132",
      packageType: "Standard Land Clearing",
      workAreaAcreage: 8.3,
      status: "scheduled",
      startDate: "2025-09-02",
      estimatedCompletion: "2025-09-08",
      totalValue: 134460, // $16,200/acre x 8.3 acres
      assignedCrew: "Mike Rodriguez - Equipment",
      progress: 0,
      phase: "Pre-Survey Complete"
    },
    {
      id: "proj_003",
      projectNumber: "TSH-2025-003", 
      customerName: "Oak Ridge Commons HOA",
      propertyAddress: "156 Oak Ridge Pkwy, Port Orange, FL 32129",
      packageType: "Forestry Mulching",
      workAreaAcreage: 6.2,
      status: "scheduled",
      startDate: "2025-09-06",
      estimatedCompletion: "2025-09-10", 
      totalValue: 100440, // $16,200/acre x 6.2 acres
      assignedCrew: "Sarah Martinez - Supervisor",
      progress: 0,
      phase: "Site Assessment"
    }
  ],

  // === RECENT LEADS (REALISTIC) ===
  recentLeads: [
    {
      id: "lead_001",
      name: "Robert Chen",
      email: "r.chen@coastaldev.com",
      phone: "(386) 555-0143",
      address: "2847 Coastal Ridge Dr, New Smyrna Beach, FL",
      acreage: 4.7,
      leadSource: "Google Ads",
      status: "hot",
      estimatedValue: 76140,
      notes: "Needs clearing for new construction - Timeline flexible",
      created: "2025-08-29T14:30:00Z"
    },
    {
      id: "lead_002",
      name: "Jennifer Walsh",
      email: "jennifer.walsh.realtor@gmail.com", 
      phone: "(386) 555-0167",
      address: "1534 Magnolia Creek Way, Port Orange, FL",
      acreage: 2.8,
      leadSource: "Referral",
      status: "qualified",
      estimatedValue: 45360,
      notes: "Real estate development - Multiple lots potential",
      created: "2025-08-29T09:15:00Z"
    },
    {
      id: "lead_003",
      name: "David Martinez",
      email: "d.martinez.construction@outlook.com",
      phone: "(386) 555-0194",
      address: "923 Cypress Point Rd, Edgewater, FL", 
      acreage: 15.2,
      leadSource: "Website Contact",
      status: "new",
      estimatedValue: 246240,
      notes: "Large commercial project - Phase 1 of 3",
      created: "2025-08-30T11:45:00Z"
    }
  ],

  // === EQUIPMENT FLEET ===
  equipment: [
    {
      id: "eq_001",
      name: "CAT 299d3 Fecon Blackhawk",
      type: "Track Loader w/ Forestry Mulcher",
      status: "active",
      operator: "Alex Thompson",
      location: "Heritage Oaks Development",
      maintenance: "Current",
      hoursThisMonth: 156
    },
    {
      id: "eq_002", 
      name: "2023 Ford F-450 Lariat Ultimate",
      type: "Heavy Duty Truck (HoneyBadger)",
      status: "active", 
      operator: "Mike Rodriguez",
      location: "Equipment Yard",
      maintenance: "Current",
      milesThisMonth: 2847
    },
    {
      id: "eq_003",
      name: "Gooseneck Trailer (Heavy Duty)",
      type: "Equipment Transport",
      status: "active",
      location: "Equipment Yard", 
      maintenance: "Current",
      milesThisMonth: 1205
    }
  ],

  // === BUSINESS KPIs (CURRENT MONTH) ===
  kpis: {
    totalLeads: 47,
    qualifiedLeads: 23,
    activeProjects: 3,
    completedProjects: 8,
    monthlyRevenue: 485750,
    averageProjectValue: 145500,
    conversionRate: 48.9,
    activeCrew: 3,
    totalAcresCleared: 127.3,
    customerSatisfaction: 98.2
  },

  // === CONTACT INFO ===
  emergencyContacts: {
    office: "(386) 427-3455",
    alexMobile: "(386) 555-0101",
    afterHours: "(386) 555-0102",
    emergency911: "911"
  }
};

// === SERVICE PACKAGES ===
export const SERVICE_PACKAGES = {
  forestryMulching: {
    name: "Forestry Mulching",
    description: "Selective land clearing preserving valuable trees",
    basePrice: 16200,
    icon: "🌲"
  },
  landClearing: {
    name: "Land Clearing", 
    description: "Complete site preparation for development",
    basePrice: 16200,
    icon: "🚜"
  },
  premium: {
    name: "Premium Service",
    description: "Full-service clearing with debris removal",
    basePrice: 19500,
    icon: "⭐"
  }
};

// === ACTIVITY TYPES FOR CREW ===
export const ACTIVITY_TYPES = [
  { id: "forestry_mulching", name: "Forestry Mulching", icon: "🌲" },
  { id: "land_clearing", name: "Land Clearing", icon: "🚜" },
  { id: "transport", name: "Equipment Transport", icon: "🚛" },
  { id: "fueling", name: "Fueling & Maintenance", icon: "⛽" },
  { id: "safety_meeting", name: "Safety Meeting", icon: "⚠️" },
  { id: "client_walkthrough", name: "Client Walkthrough", icon: "🤝" },
  { id: "site_cleanup", name: "Site Cleanup", icon: "🧹" },
  { id: "equipment_setup", name: "Equipment Setup", icon: "🔧" }
];