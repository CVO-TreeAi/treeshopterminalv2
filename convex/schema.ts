import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User management - compatible with existing structure
  users: defineTable({
    email: v.string(),
    
    // Support existing structure
    googleId: v.optional(v.string()),
    profile: v.optional(v.object({
      name: v.string(),
      role: v.string(),
      department: v.optional(v.string()),
    })),
    permissions: v.optional(v.array(v.string())),
    preferences: v.optional(v.object({
      dashboard: v.optional(v.object({
        defaultView: v.optional(v.string()),
        panels: v.optional(v.array(v.string())),
      })),
      notifications: v.optional(v.object({
        newLeads: v.optional(v.boolean()),
        projectUpdates: v.optional(v.boolean()),
        systemAlerts: v.optional(v.boolean()),
      })),
      timezone: v.optional(v.string()),
    })),
    
    // Support new structure
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("operator"), v.literal("viewer"))),
    pin: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  // Lead management - compatible with existing data structure
  leads: defineTable({
    // Support both old and new data structures
    leadId: v.optional(v.string()),
    
    // Customer information (flexible structure)
    customerInfo: v.optional(v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.optional(v.object({
        street: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        zipCode: v.optional(v.string()),
      }))
    })),
    
    // Direct fields for new structure
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    
    // Service details
    serviceRequested: v.optional(v.string()),
    serviceDetails: v.optional(v.object({
      description: v.optional(v.string()),
      treeTypes: v.optional(v.array(v.string())),
      urgency: v.optional(v.string()),
      budget: v.optional(v.object({
        min: v.optional(v.number()),
        max: v.optional(v.number()),
      })),
    })),
    
    // Proposal information
    proposal: v.optional(v.object({
      scopeOfWork: v.optional(v.string()),
      estimatedCost: v.optional(v.number()),
      timeline: v.optional(v.string()),
      terms: v.optional(v.string()),
      validUntil: v.optional(v.number()),
    })),
    
    // Property details
    propertyAddress: v.optional(v.string()),
    estimatedAcreage: v.optional(v.number()),
    parcelId: v.optional(v.string()),
    
    // Package and pricing
    packageType: v.optional(v.union(
      v.literal("Small"), v.literal("Medium"), v.literal("Large"), 
      v.literal("X-Large"), v.literal("Max")
    )),
    instantQuote: v.optional(v.number()),
    additionalDetails: v.optional(v.string()),
    
    // Lead tracking
    source: v.union(
      v.literal("treeshop.app"), v.literal("fltreeshop.com"), 
      v.literal("social"), v.literal("youtube"), v.literal("referral")
    ),
    status: v.union(
      v.literal("new"), v.literal("contacted"), v.literal("validated"), 
      v.literal("quoted"), v.literal("accepted"), v.literal("rejected"), 
      v.literal("lost")
    ),
    priority: v.optional(v.string()),
    notes: v.optional(v.array(v.string())),
    
    // Follow-up and validation
    followedUpAt: v.optional(v.number()),
    validatedAt: v.optional(v.number()),
    wetlandsChecked: v.optional(v.boolean()),
    siteMapUrl: v.optional(v.string()),
    
    // System tracking
    createdAt: v.number(),
    updatedAt: v.number(),
    assignedTo: v.optional(v.id("users")),
  })
  .index("by_status", ["status"])
  .index("by_source", ["source"])
  .index("by_created", ["createdAt"])
  .index("by_assigned", ["assignedTo"]),

  // Proposals - validated quotes with site plans
  proposals: defineTable({
    leadId: v.id("leads"),
    
    // Site planning
    siteMapUrl: v.string(),
    workAreaAcreage: v.number(),
    propertyLines: v.optional(v.string()), // JSON string of coordinates
    orangeZones: v.optional(v.string()), // JSON string of work areas
    
    // Pricing breakdown
    packageRate: v.number(), // per acre rate
    totalAcreage: v.number(),
    subtotal: v.number(),
    transportCost: v.number(),
    finalPrice: v.number(), // after 1.15 markup
    
    // Proposal details
    scopeOfWork: v.string(),
    projectMinimum: v.number(),
    distanceMinimum: v.number(),
    estimatedDuration: v.optional(v.string()),
    
    // Status tracking
    status: v.union(
      v.literal("draft"), v.literal("sent"), v.literal("accepted"), 
      v.literal("rejected"), v.literal("expired")
    ),
    sentAt: v.optional(v.number()),
    respondedAt: v.optional(v.number()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
  .index("by_lead", ["leadId"])
  .index("by_status", ["status"])
  .index("by_created", ["createdAt"]),

  // Work Orders - approved projects ready for execution
  workOrders: defineTable({
    proposalId: v.id("proposals"),
    leadId: v.id("leads"),
    
    // Project details
    projectNumber: v.string(), // auto-generated
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    propertyAddress: v.string(),
    
    // Work specifications
    packageType: v.string(),
    workAreaAcreage: v.number(),
    scopeOfWork: v.string(),
    specialInstructions: v.optional(v.string()),
    
    // Scheduling
    scheduledDate: v.optional(v.number()),
    estimatedDuration: v.optional(v.string()),
    assignedCrew: v.optional(v.string()),
    equipment: v.optional(v.array(v.string())),
    
    // Status and progress
    status: v.union(
      v.literal("scheduled"), v.literal("in_progress"), v.literal("paused"),
      v.literal("completed"), v.literal("cancelled")
    ),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    
    // Payment tracking
    totalAmount: v.number(),
    depositAmount: v.number(),
    depositPaid: v.boolean(),
    depositPaidAt: v.optional(v.number()),
    balanceAmount: v.number(),
    
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
  .index("by_status", ["status"])
  .index("by_scheduled_date", ["scheduledDate"])
  .index("by_proposal", ["proposalId"])
  .index("by_lead", ["leadId"]),

  // Time Tracking - granular activity logging
  timeEntries: defineTable({
    workOrderId: v.id("workOrders"),
    
    // Activity details
    activityType: v.union(
      v.literal("forestry_mulching"), v.literal("land_clearing"),
      v.literal("transport"), v.literal("fueling"), v.literal("training"),
      v.literal("safety"), v.literal("client_walkthrough"), v.literal("cleanup")
    ),
    packageType: v.optional(v.string()), // for work-specific activities
    description: v.string(),
    
    // Time tracking
    startTime: v.number(),
    endTime: v.optional(v.number()),
    duration: v.optional(v.number()), // in minutes
    
    // Context and specifications
    acreageWorked: v.optional(v.number()),
    equipmentUsed: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    
    // Entry metadata
    recordedBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_work_order", ["workOrderId"])
  .index("by_activity", ["activityType"])
  .index("by_start_time", ["startTime"]),

  // Invoices - billing and payment tracking
  invoices: defineTable({
    workOrderId: v.id("workOrders"),
    proposalId: v.id("proposals"),
    leadId: v.id("leads"),
    
    // Invoice details
    invoiceNumber: v.string(), // auto-generated
    customerName: v.string(),
    customerEmail: v.string(),
    propertyAddress: v.string(),
    
    // Financial details
    subtotal: v.number(),
    depositAmount: v.number(),
    balanceAmount: v.number(),
    lateFee: v.optional(v.number()),
    totalAmount: v.number(),
    
    // Payment tracking
    status: v.union(
      v.literal("draft"), v.literal("sent"), v.literal("paid"),
      v.literal("overdue"), v.literal("cancelled")
    ),
    sentAt: v.optional(v.number()),
    dueAt: v.number(),
    paidAt: v.optional(v.number()),
    lateFeeAppliedAt: v.optional(v.number()),
    
    // Payment processing
    stripePaymentIntentId: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
    generatedBy: v.id("users"),
  })
  .index("by_work_order", ["workOrderId"])
  .index("by_status", ["status"])
  .index("by_due_date", ["dueAt"])
  .index("by_created", ["createdAt"]),

  // Project Reports - comprehensive project documentation
  projectReports: defineTable({
    workOrderId: v.id("workOrders"),
    
    // Project summary
    projectNumber: v.string(),
    customerName: v.string(),
    propertyAddress: v.string(),
    packageType: v.string(),
    totalAcreage: v.number(),
    
    // Time summary
    totalHours: v.number(),
    forestryHours: v.number(),
    transportHours: v.number(),
    otherHours: v.number(),
    
    // Equipment and crew
    equipmentUsed: v.array(v.string()),
    crewMembers: v.array(v.string()),
    
    // Project outcomes
    completionStatus: v.string(),
    qualityScore: v.optional(v.number()),
    customerSatisfaction: v.optional(v.number()),
    
    // Documentation
    beforePhotos: v.optional(v.array(v.string())),
    afterPhotos: v.optional(v.array(v.string())),
    siteMapUrls: v.optional(v.array(v.string())),
    
    // Journal entries and notes
    projectJournal: v.optional(v.string()), // free-form notes
    lessonsLearned: v.optional(v.string()),
    improvements: v.optional(v.string()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
    generatedBy: v.id("users"),
  })
  .index("by_work_order", ["workOrderId"])
  .index("by_created", ["createdAt"]),

  // System Settings and Configuration
  settings: defineTable({
    key: v.string(),
    value: v.string(),
    category: v.union(
      v.literal("pricing"), v.literal("notifications"), v.literal("general"),
      v.literal("integrations"), v.literal("business")
    ),
    description: v.optional(v.string()),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
  .index("by_key", ["key"])
  .index("by_category", ["category"]),

  // Notifications and alerts
  notifications: defineTable({
    type: v.union(
      v.literal("new_lead"), v.literal("work_started"), v.literal("work_completed"),
      v.literal("payment_due"), v.literal("payment_overdue"), v.literal("review_request")
    ),
    title: v.string(),
    message: v.string(),
    
    // Recipients and delivery
    recipientEmail: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
    
    // Related entities
    leadId: v.optional(v.id("leads")),
    workOrderId: v.optional(v.id("workOrders")),
    invoiceId: v.optional(v.id("invoices")),
    
    // Status tracking
    status: v.union(
      v.literal("pending"), v.literal("sent"), v.literal("delivered"), 
      v.literal("failed"), v.literal("cancelled")
    ),
    sentAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    
    createdAt: v.number(),
    createdBy: v.id("users"),
  })
  .index("by_type", ["type"])
  .index("by_status", ["status"])
  .index("by_created", ["createdAt"]),
});