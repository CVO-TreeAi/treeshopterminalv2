// Mock data to demonstrate functionality until Convex is fully connected

export const mockLeads = [
  {
    _id: "lead1",
    name: "John Smith",
    email: "john@example.com",
    phone: "(555) 123-4567",
    propertyAddress: "123 Oak Lane, Orlando, FL 32801",
    estimatedAcreage: 2.5,
    packageType: "Medium",
    instantQuote: 6250,
    additionalDetails: "Need to clear undergrowth and small trees up to 6 inches",
    source: "treeshop.app",
    status: "new",
    createdAt: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: Date.now(),
    siteSource: "treeshop.app"
  },
  {
    _id: "lead2", 
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "(555) 987-6543",
    propertyAddress: "456 Pine Street, Tampa, FL 33601",
    estimatedAcreage: 5.0,
    packageType: "Large",
    instantQuote: 16875,
    additionalDetails: "Large property with thick brush and trees up to 8 inches",
    source: "fltreeshop.com",
    status: "contacted",
    createdAt: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: Date.now() - (1 * 60 * 60 * 1000), // 1 hour ago
    siteSource: "fltreeshop.com"
  },
  {
    _id: "lead3",
    name: "Mike Wilson",
    email: "mike@example.com", 
    phone: "(555) 456-7890",
    propertyAddress: "789 Maple Drive, Jacksonville, FL 32205",
    estimatedAcreage: 1.8,
    packageType: "Small",
    instantQuote: 3825,
    additionalDetails: "Small area with light brush clearing needed",
    source: "youtube",
    status: "validated",
    createdAt: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
    siteSource: "youtube"
  }
];

export const mockProposals = [
  {
    _id: "prop1",
    proposalNumber: "PROP-001",
    status: "sent" as const,
    total: 16875,
    createdAt: Date.now() - (1 * 24 * 60 * 60 * 1000),
    customerName: "Sarah Johnson",
    leadId: "lead2"
  },
  {
    _id: "prop2",
    proposalNumber: "PROP-002", 
    status: "approved" as const,
    total: 3825,
    createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
    customerName: "Mike Wilson",
    leadId: "lead3"
  }
];

export const mockWorkOrders = [
  {
    _id: "wo1",
    workOrderNumber: "WO-001",
    customerName: "Mike Wilson",
    projectAddress: "789 Maple Drive, Jacksonville, FL 32205",
    services: ["Forestry Mulching - Small Package"],
    totalAmount: 3825,
    status: "scheduled" as const,
    scheduledDate: Date.now() + (2 * 24 * 60 * 60 * 1000), // 2 days from now
    crewAssigned: ["Crew A"],
    equipmentRequired: ["Skid Steer", "Forestry Mulcher"],
    createdAt: Date.now() - (1 * 24 * 60 * 60 * 1000),
    updatedAt: Date.now()
  },
  {
    _id: "wo2", 
    workOrderNumber: "WO-002",
    customerName: "David Brown",
    projectAddress: "321 Cedar Ave, Miami, FL 33101", 
    services: ["Forestry Mulching - Medium Package"],
    totalAmount: 7200,
    status: "in-progress" as const,
    scheduledDate: Date.now() - (1 * 24 * 60 * 60 * 1000), // Yesterday
    startDate: Date.now() - (8 * 60 * 60 * 1000), // 8 hours ago
    crewAssigned: ["Crew B"],
    equipmentRequired: ["Excavator", "Forestry Mulcher"],
    createdAt: Date.now() - (3 * 24 * 60 * 60 * 1000),
    updatedAt: Date.now() - (1 * 60 * 60 * 1000)
  }
];

export const mockInvoices = [
  {
    _id: "inv1",
    invoiceNumber: "INV-001",
    customerName: "Robert Taylor",
    customerEmail: "robert@example.com",
    projectAddress: "654 Birch Lane, Fort Lauderdale, FL 33301",
    lineItems: [
      {
        description: "Forestry Mulching - Medium Package (3.2 acres)",
        quantity: 3.2,
        rate: 2500,
        total: 8000
      },
      {
        description: "Transport",
        quantity: 1,
        rate: 300,
        total: 300
      }
    ],
    total: 9545, // (8000 + 300) * 1.15
    status: "sent" as const,
    sentDate: Date.now() - (2 * 24 * 60 * 60 * 1000),
    dueDate: Date.now() + (5 * 24 * 60 * 60 * 1000),
    createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
    updatedAt: Date.now() - (2 * 24 * 60 * 60 * 1000)
  },
  {
    _id: "inv2",
    invoiceNumber: "INV-002", 
    customerName: "Lisa Chen",
    customerEmail: "lisa@example.com",
    projectAddress: "987 Willow St, Gainesville, FL 32601",
    lineItems: [
      {
        description: "Forestry Mulching - Large Package (4.5 acres)",
        quantity: 4.5,
        rate: 3375,
        total: 15188
      }
    ],
    total: 17466, // 15188 * 1.15
    status: "paid" as const,
    sentDate: Date.now() - (10 * 24 * 60 * 60 * 1000),
    dueDate: Date.now() - (3 * 24 * 60 * 60 * 1000),
    paidDate: Date.now() - (1 * 24 * 60 * 60 * 1000),
    paymentMethod: "Credit Card",
    createdAt: Date.now() - (10 * 24 * 60 * 60 * 1000),
    updatedAt: Date.now() - (1 * 24 * 60 * 60 * 1000)
  }
];

// Mock query hooks
export function useMockQuery<T>(data: T) {
  return data;
}

// Mock mutation hooks  
export function useMockMutation<T>(mockFn: (args: any) => Promise<T>) {
  return mockFn;
}

export const mockStats = {
  leads: {
    total: mockLeads.length,
    byStatus: {
      new: mockLeads.filter(l => l.status === 'new').length,
      contacted: mockLeads.filter(l => l.status === 'contacted').length,
      validated: mockLeads.filter(l => l.status === 'validated').length,
      quoted: mockLeads.filter(l => l.status === 'quoted').length,
      accepted: mockLeads.filter(l => l.status === 'accepted').length,
      rejected: mockLeads.filter(l => l.status === 'rejected').length,
      lost: mockLeads.filter(l => l.status === 'lost').length
    },
    bySource: {
      'treeshop.app': mockLeads.filter(l => l.source === 'treeshop.app').length,
      'fltreeshop.com': mockLeads.filter(l => l.source === 'fltreeshop.com').length,
      youtube: mockLeads.filter(l => l.source === 'youtube').length,
      social: mockLeads.filter(l => l.source === 'social').length,
      referral: mockLeads.filter(l => l.source === 'referral').length
    },
    totalValue: mockLeads.reduce((sum, lead) => sum + lead.instantQuote, 0),
    averageValue: mockLeads.reduce((sum, lead) => sum + lead.instantQuote, 0) / mockLeads.length,
    conversionRate: 15.5 // Mock conversion rate
  }
};