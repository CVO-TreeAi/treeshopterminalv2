import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Main mutation for sites to send completed leads
export const createLead = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    acreage: v.optional(v.number()),
    selectedPackage: v.optional(v.string()),
    estimatedTotal: v.optional(v.number()),
    notes: v.optional(v.string()),
    siteSource: v.string(),
    status: v.string(),
    createdAt: v.number(),
    zipCode: v.optional(v.string()),
    leadScore: v.optional(v.string()),
    leadSource: v.optional(v.string()),
    obstacles: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const leadId = await ctx.db.insert("terminalLeads", {
      ...args,
      updatedAt: Date.now(),
    });
    return { success: true, leadId };
  },
});

// Query for Terminal to fetch all leads
export const syncLeadsToTerminal = query({
  args: {},
  handler: async (ctx) => {
    const completedLeads = await ctx.db
      .query("terminalLeads")
      .order("desc")
      .take(100);
    
    const partialLeads = await ctx.db
      .query("partialLeads")
      .order("desc")
      .take(50);
    
    // Calculate stats
    const total = completedLeads.length;
    const thisMonth = completedLeads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      const now = new Date();
      return leadDate.getMonth() === now.getMonth() && 
             leadDate.getFullYear() === now.getFullYear();
    }).length;
    
    const converted = completedLeads.filter(lead => 
      lead.status === "won" || lead.status === "converted"
    ).length;
    
    return {
      completedLeads,
      partialLeads,
      stats: {
        total,
        thisMonth,
        converted,
      }
    };
  },
});

// Update lead status from Terminal
export const updateLeadStatus = mutation({
  args: {
    leadId: v.string(),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId as any);
    if (!lead) {
      throw new Error("Lead not found");
    }
    
    await ctx.db.patch(args.leadId as any, {
      status: args.status,
      updatedAt: Date.now(),
      ...(args.notes && { 
        notes: lead.notes ? `${lead.notes}\n\n[Update]: ${args.notes}` : args.notes 
      }),
    });
    
    return { success: true };
  },
});

// Progressive tracking: Update partial lead data
export const updatePartialLead = mutation({
  args: {
    sessionId: v.string(),
    field: v.string(),
    value: v.any(),
    siteSource: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("partialLeads")
      .filter(q => q.eq(q.field("sessionId"), args.sessionId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        [args.field]: args.value,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("partialLeads", {
        sessionId: args.sessionId,
        [args.field]: args.value,
        siteSource: args.siteSource,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});

// Upsert lead for real-time progressive tracking
export const upsertPartialLead = mutation({
  args: {
    leadId: v.optional(v.string()),
    sessionId: v.string(),
    data: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      acreage: v.optional(v.number()),
      selectedPackage: v.optional(v.string()),
      estimatedTotal: v.optional(v.number()),
      notes: v.optional(v.string()),
    }),
    siteSource: v.string(),
    currentStep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.leadId) {
      // Update existing lead
      await ctx.db.patch(args.leadId as any, {
        ...args.data,
        updatedAt: Date.now(),
        currentStep: args.currentStep,
      });
      return { success: true, leadId: args.leadId };
    } else {
      // Create new partial lead
      const leadId = await ctx.db.insert("partialLeads", {
        sessionId: args.sessionId,
        ...args.data,
        siteSource: args.siteSource,
        status: "partial",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        currentStep: args.currentStep,
      });
      return { success: true, leadId };
    }
  },
});