import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query to get all proposals
export const getProposals = query({
  args: {
    status: v.optional(v.union(
      v.literal("draft"), v.literal("sent"), v.literal("accepted"), 
      v.literal("rejected"), v.literal("expired")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("proposals");
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    const proposals = await query
      .order("desc")
      .take(args.limit || 50);
    
    // Enrich with lead data
    const enriched = await Promise.all(
      proposals.map(async (proposal) => {
        const lead = await ctx.db.get(proposal.leadId);
        return { ...proposal, lead };
      })
    );
    
    return enriched;
  },
});

// Query to get a single proposal
export const getProposal = query({
  args: { id: v.id("proposals") },
  handler: async (ctx, args) => {
    const proposal = await ctx.db.get(args.id);
    if (!proposal) return null;
    
    const lead = await ctx.db.get(proposal.leadId);
    return { ...proposal, lead };
  },
});

// Mutation to create a proposal from a validated lead
export const createProposal = mutation({
  args: {
    leadId: v.id("leads"),
    siteMapUrl: v.string(),
    workAreaAcreage: v.number(),
    propertyLines: v.optional(v.string()),
    orangeZones: v.optional(v.string()),
    scopeOfWork: v.string(),
    estimatedDuration: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }
    
    // Calculate pricing based on package type and acreage
    const packageRates = {
      "Small": 2125,    // 4" DBH limit - $2,125/acre
      "Medium": 2500,   // 6" DBH limit - $2,500/acre
      "Large": 3375,    // 8" DBH limit - $3,375/acre
      "X-Large": 4250,  // 10" DBH limit - $4,250/acre
      "Max": 4500,      // Land clearing - $4,500/day (estimated per acre)
    };
    
    const packageRate = packageRates[lead.packageType || "Medium"] || packageRates["Medium"];
    const subtotal = packageRate * args.workAreaAcreage;
    
    // Transport cost calculation (simplified - in real app, use zip code database)
    const transportCost = 150 * 2; // $150/hour round trip, estimate 2 hours
    
    // Project minimums
    const projectMinimum = 1900;
    const distanceMinimum = 3500; // For 2.5+ hours one-way
    
    // Apply minimum pricing
    let finalSubtotal = Math.max(subtotal, projectMinimum);
    
    // Add transport and apply 1.15 markup
    const finalPrice = (finalSubtotal + transportCost) * 1.15;
    
    const now = Date.now();
    
    const proposalId = await ctx.db.insert("proposals", {
      leadId: args.leadId,
      siteMapUrl: args.siteMapUrl,
      workAreaAcreage: args.workAreaAcreage,
      propertyLines: args.propertyLines,
      orangeZones: args.orangeZones,
      packageRate: packageRate,
      totalAcreage: args.workAreaAcreage,
      subtotal: finalSubtotal,
      transportCost: transportCost,
      finalPrice: Math.round(finalPrice),
      scopeOfWork: args.scopeOfWork,
      projectMinimum: projectMinimum,
      distanceMinimum: distanceMinimum,
      estimatedDuration: args.estimatedDuration,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
    });
    
    // Update lead status to quoted
    await ctx.db.patch(args.leadId, {
      status: "quoted",
      updatedAt: now,
    });
    
    return proposalId;
  },
});

// Mutation to send proposal to customer
export const sendProposal = mutation({
  args: {
    id: v.id("proposals"),
    emailSubject: v.optional(v.string()),
    emailBody: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const proposal = await ctx.db.get(args.id);
    if (!proposal) {
      throw new Error("Proposal not found");
    }
    
    const lead = await ctx.db.get(proposal.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }
    
    const now = Date.now();
    
    // Update proposal status
    await ctx.db.patch(args.id, {
      status: "sent",
      sentAt: now,
      updatedAt: now,
    });
    
    // Create notification to send email (will be processed by email service)
    await ctx.db.insert("notifications", {
      type: "new_lead", // Will expand notification types
      title: "Proposal Sent",
      message: `Proposal sent to ${lead.name} for ${proposal.workAreaAcreage} acre ${lead.packageType} project`,
      recipientEmail: lead.email,
      leadId: proposal.leadId,
      status: "pending",
      createdAt: now,
      createdBy: proposal.createdBy,
    });
    
    return args.id;
  },
});

// Mutation to accept proposal (creates work order and processes payment)
export const acceptProposal = mutation({
  args: {
    id: v.id("proposals"),
    paymentIntentId: v.optional(v.string()), // From Stripe
  },
  handler: async (ctx, args) => {
    const proposal = await ctx.db.get(args.id);
    if (!proposal) {
      throw new Error("Proposal not found");
    }
    
    const lead = await ctx.db.get(proposal.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }
    
    const now = Date.now();
    
    // Update proposal status
    await ctx.db.patch(args.id, {
      status: "accepted",
      respondedAt: now,
      updatedAt: now,
    });
    
    // Update lead status
    await ctx.db.patch(proposal.leadId, {
      status: "accepted",
      updatedAt: now,
    });
    
    // Create work order
    const projectNumber = `WO-${Date.now().toString().slice(-6)}`;
    const depositAmount = Math.round(proposal.finalPrice * 0.25); // 25% deposit
    const balanceAmount = proposal.finalPrice - depositAmount;
    
    const workOrderId = await ctx.db.insert("workOrders", {
      proposalId: args.id,
      leadId: proposal.leadId,
      projectNumber: projectNumber,
      customerName: lead.name || '',
      customerEmail: lead.email || '',
      customerPhone: lead.phone || '',
      propertyAddress: lead.propertyAddress || '',
      packageType: lead.packageType || 'Medium',
      workAreaAcreage: proposal.workAreaAcreage,
      scopeOfWork: proposal.scopeOfWork,
      status: "scheduled",
      totalAmount: proposal.finalPrice,
      depositAmount: depositAmount,
      depositPaid: !!args.paymentIntentId,
      depositPaidAt: args.paymentIntentId ? now : undefined,
      balanceAmount: balanceAmount,
      createdAt: now,
      updatedAt: now,
      createdBy: proposal.createdBy,
    });
    
    // Create notification
    await ctx.db.insert("notifications", {
      type: "new_lead",
      title: "Work Order Created",
      message: `${lead.name} accepted proposal - Work Order ${projectNumber} created`,
      leadId: proposal.leadId,
      workOrderId: workOrderId,
      status: "pending",
      createdAt: now,
      createdBy: proposal.createdBy,
    });
    
    return { workOrderId, projectNumber };
  },
});

// Mutation to update proposal
export const updateProposal = mutation({
  args: {
    id: v.id("proposals"),
    siteMapUrl: v.optional(v.string()),
    workAreaAcreage: v.optional(v.number()),
    propertyLines: v.optional(v.string()),
    orangeZones: v.optional(v.string()),
    scopeOfWork: v.optional(v.string()),
    estimatedDuration: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const now = Date.now();
    
    // Recalculate pricing if acreage changed
    if (args.workAreaAcreage) {
      const proposal = await ctx.db.get(id);
      if (proposal) {
        const lead = await ctx.db.get(proposal.leadId);
        if (lead) {
          const packageRates = {
            "Small": 2125, "Medium": 2500, "Large": 3375, 
            "X-Large": 4250, "Max": 4500,
          };
          
          const packageRate = packageRates[lead.packageType || "Medium"] || packageRates["Medium"];
          const subtotal = Math.max(packageRate * args.workAreaAcreage, 1900);
          const transportCost = 150 * 2;
          const finalPrice = Math.round((subtotal + transportCost) * 1.15);
          
          await ctx.db.patch(id, {
            ...updates,
            packageRate: packageRate,
            totalAcreage: args.workAreaAcreage,
            subtotal: subtotal,
            finalPrice: finalPrice,
            updatedAt: now,
          });
          
          return id;
        }
      }
    }
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
    });
    
    return id;
  },
});

// Query for proposal statistics
export const getProposalStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const startDate = args.startDate || (Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = args.endDate || Date.now();
    
    const proposals = await ctx.db
      .query("proposals")
      .filter((q) => 
        q.and(
          q.gte(q.field("createdAt"), startDate),
          q.lte(q.field("createdAt"), endDate)
        )
      )
      .collect();
    
    const total = proposals.length;
    const accepted = proposals.filter(p => p.status === "accepted").length;
    const sent = proposals.filter(p => p.status === "sent").length;
    const draft = proposals.filter(p => p.status === "draft").length;
    
    const totalValue = proposals.reduce((sum, p) => sum + p.finalPrice, 0);
    const acceptedValue = proposals
      .filter(p => p.status === "accepted")
      .reduce((sum, p) => sum + p.finalPrice, 0);
    
    const conversionRate = sent > 0 ? (accepted / sent * 100) : 0;
    
    return {
      total,
      accepted,
      sent,
      draft,
      totalValue,
      acceptedValue,
      conversionRate,
      averageValue: total > 0 ? totalValue / total : 0,
    };
  },
});

// Query to get proposals needing attention
export const getProposalsNeedingAttention = query({
  handler: async (ctx) => {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // Sent proposals older than 7 days without response
    const staleProposals = await ctx.db
      .query("proposals")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "sent"),
          q.lt(q.field("sentAt"), sevenDaysAgo)
        )
      )
      .collect();
    
    return staleProposals;
  },
});