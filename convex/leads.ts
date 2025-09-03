import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query to get all leads - compatible with existing data structure
export const getLeads = query({
  args: {
    status: v.optional(v.union(
      v.literal("new"), v.literal("contacted"), v.literal("validated"), 
      v.literal("quoted"), v.literal("accepted"), v.literal("rejected"), 
      v.literal("lost")
    )),
    source: v.optional(v.union(
      v.literal("treeshop.app"), v.literal("fltreeshop.com"), 
      v.literal("social"), v.literal("youtube"), v.literal("referral")
    )),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("leads");
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    if (args.source) {
      query = query.filter((q) => q.eq(q.field("source"), args.source));
    }
    
    const leads = await query
      .order("desc")
      .take(args.limit || 50);
    
    // Transform to consistent structure for frontend
    return leads.map(lead => ({
      ...lead,
      // Ensure consistent field names
      name: lead.customerInfo?.name || lead.name || 'Unknown',
      email: lead.customerInfo?.email || lead.email || '',
      phone: lead.customerInfo?.phone || lead.phone || '',
      propertyAddress: lead.propertyAddress || 
        `${lead.customerInfo?.address?.street || ''}, ${lead.customerInfo?.address?.city || ''}, ${lead.customerInfo?.address?.state || ''}`.trim(),
      instantQuote: lead.proposal?.estimatedCost || lead.instantQuote || 0,
      packageType: lead.packageType || 'Standard',
      additionalDetails: lead.serviceDetails?.description || lead.additionalDetails || '',
    }));
  },
});

// Query to get a single lead by ID
export const getLead = query({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Mutation to create a new lead (called from treeshop.app)
export const createLead = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    propertyAddress: v.string(),
    estimatedAcreage: v.number(),
    packageType: v.union(
      v.literal("Small"), v.literal("Medium"), v.literal("Large"), 
      v.literal("X-Large"), v.literal("Max")
    ),
    instantQuote: v.number(),
    additionalDetails: v.optional(v.string()),
    source: v.union(
      v.literal("treeshop.app"), v.literal("fltreeshop.com"), 
      v.literal("social"), v.literal("youtube"), v.literal("referral")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const leadId = await ctx.db.insert("leads", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      propertyAddress: args.propertyAddress,
      estimatedAcreage: args.estimatedAcreage,
      packageType: args.packageType,
      instantQuote: args.instantQuote,
      additionalDetails: args.additionalDetails,
      source: args.source,
      status: "new",
      createdAt: now,
      updatedAt: now,
    });

    // Create notification for new lead
    await ctx.db.insert("notifications", {
      type: "new_lead",
      title: "New Lead Received",
      message: `New ${args.packageType} package lead from ${args.name} - ${args.propertyAddress}`,
      leadId: leadId,
      status: "pending",
      createdAt: now,
      createdBy: "temp" as any, // Will be updated when user system is ready
    });

    return leadId;
  },
});

// Mutation to update lead status and details
export const updateLead = mutation({
  args: {
    id: v.id("leads"),
    status: v.optional(v.union(
      v.literal("new"), v.literal("contacted"), v.literal("validated"), 
      v.literal("quoted"), v.literal("accepted"), v.literal("rejected"), 
      v.literal("lost")
    )),
    assignedTo: v.optional(v.id("users")),
    followedUpAt: v.optional(v.number()),
    validatedAt: v.optional(v.number()),
    wetlandsChecked: v.optional(v.boolean()),
    siteMapUrl: v.optional(v.string()),
    parcelId: v.optional(v.string()),
    additionalDetails: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const now = Date.now();
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
    });
    
    return id;
  },
});

// Mutation to mark lead as contacted
export const markLeadContacted = mutation({
  args: {
    id: v.id("leads"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.id, {
      status: "contacted",
      followedUpAt: now,
      updatedAt: now,
      ...(args.notes && { additionalDetails: args.notes }),
    });
    
    return args.id;
  },
});

// Mutation to validate lead with site planning
export const validateLead = mutation({
  args: {
    id: v.id("leads"),
    wetlandsChecked: v.boolean(),
    siteMapUrl: v.string(),
    parcelId: v.optional(v.string()),
    validationNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.id, {
      status: "validated",
      wetlandsChecked: args.wetlandsChecked,
      siteMapUrl: args.siteMapUrl,
      parcelId: args.parcelId,
      validatedAt: now,
      updatedAt: now,
      ...(args.validationNotes && { 
        additionalDetails: args.validationNotes 
      }),
    });
    
    return args.id;
  },
});

// Query for lead statistics and KPIs
export const getLeadStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const startDate = args.startDate || (Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = args.endDate || Date.now();
    
    const leads = await ctx.db
      .query("leads")
      .filter((q) => 
        q.and(
          q.gte(q.field("createdAt"), startDate),
          q.lte(q.field("createdAt"), endDate)
        )
      )
      .collect();
    
    // Calculate statistics
    const total = leads.length;
    const byStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const bySource = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalValue = leads.reduce((sum, lead) => sum + (lead.instantQuote || 0), 0);
    const averageValue = total > 0 ? totalValue / total : 0;
    
    const conversionRate = total > 0 
      ? ((byStatus.accepted || 0) / total * 100)
      : 0;
    
    return {
      total,
      byStatus,
      bySource,
      totalValue,
      averageValue,
      conversionRate,
      period: { startDate, endDate },
    };
  },
});

// Query to get recent leads for dashboard
export const getRecentLeads = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .order("desc")
      .take(args.limit || 10);
  },
});

// Query to get leads needing follow-up (24+ hours old, status = new)
export const getLeadsNeedingFollowUp = query({
  handler: async (ctx) => {
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    return await ctx.db
      .query("leads")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "new"),
          q.lt(q.field("createdAt"), twentyFourHoursAgo)
        )
      )
      .order("asc")
      .collect();
  },
});

// Mutation to delete a lead (admin only)
export const deleteLead = mutation({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    // In a real app, add user permission checks here
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Integration function for treeshop.app to sync leads
export const terminalSyncCreateLead = mutation({
  args: {
    source: v.string(),
    customerData: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      propertyAddress: v.string(),
      estimatedAcreage: v.number(),
      additionalDetails: v.optional(v.string()),
    }),
    packageSelection: v.string(),
    instantQuote: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Map package string to enum
    const packageMap: Record<string, any> = {
      "small": "Small",
      "medium": "Medium", 
      "large": "Large",
      "x-large": "X-Large",
      "max": "Max"
    };
    
    const packageType = packageMap[args.packageSelection.toLowerCase()] || "Medium";
    
    const leadId = await ctx.db.insert("leads", {
      name: args.customerData.name,
      email: args.customerData.email,
      phone: args.customerData.phone,
      propertyAddress: args.customerData.propertyAddress,
      estimatedAcreage: args.customerData.estimatedAcreage,
      packageType: packageType,
      instantQuote: args.instantQuote,
      additionalDetails: args.customerData.additionalDetails,
      source: args.source as any,
      status: "new",
      createdAt: now,
      updatedAt: now,
    });

    // Create notification for terminal
    await ctx.db.insert("notifications", {
      type: "new_lead",
      title: `New Lead from ${args.source}`,
      message: `${args.customerData.name} requested ${packageType} package - $${args.instantQuote}`,
      leadId: leadId,
      recipientEmail: "business@treeshop.app", // From settings
      status: "pending",
      createdAt: now,
      createdBy: "temp" as any, // Temporary, will use proper user ID when auth is ready
    });

    return { leadId, success: true };
  },
});