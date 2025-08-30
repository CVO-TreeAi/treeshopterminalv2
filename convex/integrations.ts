import { mutation, action } from "./_generated/server";
import { v } from "convex/values";

// Main integration endpoint for treeshop.app lead sync
export const terminalSync = {
  // Create lead from treeshop.app form submission
  createLead: mutation({
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
      
      // Map package string to enum values
      const packageMap: Record<string, any> = {
        "small": "Small",
        "medium": "Medium",
        "large": "Large", 
        "x-large": "X-Large",
        "xlarge": "X-Large",
        "max": "Max"
      };
      
      const packageType = packageMap[args.packageSelection.toLowerCase()] || "Medium";
      
      // Validate source
      const validSources = ["treeshop.app", "fltreeshop.com", "social", "youtube", "referral"];
      const source = validSources.includes(args.source) ? args.source : "treeshop.app";
      
      try {
        // Create lead in database
        const leadId = await ctx.db.insert("leads", {
          name: args.customerData.name,
          email: args.customerData.email,
          phone: args.customerData.phone,
          propertyAddress: args.customerData.propertyAddress,
          estimatedAcreage: args.customerData.estimatedAcreage,
          packageType: packageType as any,
          instantQuote: args.instantQuote,
          additionalDetails: args.customerData.additionalDetails,
          source: source as any,
          status: "new",
          createdAt: now,
          updatedAt: now,
        });

        // Create notification for terminal dashboard
        await ctx.db.insert("notifications", {
          type: "new_lead",
          title: `New Lead from ${source}`,
          message: `${args.customerData.name} requested ${packageType} package - $${args.instantQuote.toLocaleString()}`,
          leadId: leadId,
          recipientEmail: "business@treeshop.app",
          recipientPhone: "+1234567890", // From settings
          status: "pending",
          createdAt: now,
          createdBy: leadId, // Will be updated when proper user system is ready
        });

        return { 
          success: true, 
          leadId: leadId,
          message: "Lead created successfully"
        };
        
      } catch (error) {
        console.error("Failed to create lead:", error);
        return {
          success: false,
          error: "Failed to create lead",
          details: error instanceof Error ? error.message : "Unknown error"
        };
      }
    },
  }),

  // Update lead status from external systems
  updateLeadStatus: mutation({
    args: {
      leadId: v.id("leads"),
      status: v.union(
        v.literal("contacted"), v.literal("validated"),
        v.literal("quoted"), v.literal("accepted"), v.literal("rejected")
      ),
      notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      const now = Date.now();
      
      await ctx.db.patch(args.leadId, {
        status: args.status,
        updatedAt: now,
        ...(args.notes && { additionalDetails: args.notes }),
      });
      
      return { success: true, leadId: args.leadId };
    },
  })
};

// Webhook handler for Stripe payment processing
export const stripeWebhook = action({
  args: {
    eventType: v.string(),
    paymentIntentId: v.string(),
    amount: v.number(),
    customerEmail: v.string(),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    // Handle successful payment for deposit
    if (args.eventType === "payment_intent.succeeded") {
      // Find proposal by customer email and amount
      const proposals = await ctx.runQuery("proposals", {});
      const matchingProposal = proposals.find(p => 
        p.lead?.email === args.customerEmail &&
        Math.round(p.finalPrice * 0.25) === Math.round(args.amount / 100)
      );
      
      if (matchingProposal) {
        // Accept the proposal and create work order
        await ctx.runMutation("proposals", {
          id: matchingProposal._id,
          paymentIntentId: args.paymentIntentId,
        });
        
        return { success: true, proposalId: matchingProposal._id };
      }
    }
    
    return { success: false, message: "No matching proposal found" };
  },
});

// Email service integration
export const emailService = {
  // Send proposal email
  sendProposalEmail: action({
    args: {
      proposalId: v.id("proposals"),
      recipientEmail: v.string(),
      subject: v.string(),
      body: v.string(),
    },
    handler: async (ctx, args) => {
      // In production, integrate with email service like SendGrid, Resend, etc.
      // For now, just mark as sent
      
      await ctx.runMutation("notifications", {
        type: "new_lead",
        title: "Proposal Email Sent",
        message: `Proposal sent to ${args.recipientEmail}`,
        status: "sent",
        createdAt: Date.now(),
      });
      
      return { success: true, proposalId: args.proposalId };
    },
  }),

  // Send invoice email
  sendInvoiceEmail: action({
    args: {
      invoiceId: v.id("invoices"),
      recipientEmail: v.string(),
      subject: v.string(),
      body: v.string(),
    },
    handler: async (ctx, args) => {
      // In production, integrate with email service
      
      await ctx.runMutation("notifications", {
        type: "payment_due",
        title: "Invoice Email Sent", 
        message: `Invoice sent to ${args.recipientEmail}`,
        status: "sent",
        createdAt: Date.now(),
      });
      
      return { success: true, invoiceId: args.invoiceId };
    },
  })
};

// SMS service integration for notifications
export const smsService = {
  // Send Google review link via SMS
  sendReviewLink: action({
    args: {
      workOrderId: v.id("workOrders"),
      customerPhone: v.string(),
      googleReviewUrl: v.string(),
    },
    handler: async (ctx, args) => {
      // In production, integrate with Twilio or similar SMS service
      
      const message = `Hi! Thanks for choosing TreeShop. Please leave us a review: ${args.googleReviewUrl}`;
      
      await ctx.runMutation("notifications", {
        type: "review_request",
        title: "Review Request Sent",
        message: `Review link sent to ${args.customerPhone}`,
        recipientPhone: args.customerPhone,
        workOrderId: args.workOrderId,
        status: "sent",
        createdAt: Date.now(),
      });
      
      return { success: true, workOrderId: args.workOrderId };
    },
  }),

  // Send schedule notification
  sendScheduleNotification: action({
    args: {
      workOrderId: v.id("workOrders"),
      customerPhone: v.string(),
      scheduledDate: v.number(),
      message: v.string(),
    },
    handler: async (ctx, args) => {
      // In production, integrate with SMS service
      
      await ctx.runMutation("notifications", {
        type: "new_lead",
        title: "Schedule SMS Sent",
        message: `Schedule notification sent to ${args.customerPhone}`,
        recipientPhone: args.customerPhone,
        workOrderId: args.workOrderId,
        status: "sent",
        createdAt: Date.now(),
      });
      
      return { success: true, workOrderId: args.workOrderId };
    },
  })
};

// Automated tasks and cron jobs
export const automationTasks = {
  // Process overdue invoices (run daily)
  processOverdueInvoices: action({
    handler: async (ctx) => {
      const result = await ctx.runMutation("invoices.processOverdueInvoices");
      return result;
    },
  }),

  // Send follow-up notifications for stale leads
  processStaleLeads: action({
    handler: async (ctx) => {
      const staleLeads = await ctx.runQuery("leads.getLeadsNeedingFollowUp");
      
      for (const lead of staleLeads) {
        await ctx.runMutation("notifications", {
          type: "new_lead",
          title: "Follow-up Required",
          message: `Lead from ${lead.name} needs follow-up (${Math.floor((Date.now() - lead.createdAt) / (1000 * 60 * 60))} hours old)`,
          leadId: lead._id,
          status: "pending",
          createdAt: Date.now(),
        });
      }
      
      return { processedCount: staleLeads.length };
    },
  }),

  // Generate daily reports
  generateDailyReport: action({
    handler: async (ctx) => {
      const now = Date.now();
      const yesterday = now - (24 * 60 * 60 * 1000);
      
      // Get stats for yesterday
      const leadStats = await ctx.runQuery("leads.getLeadStats", {
        startDate: yesterday,
        endDate: now,
      });
      
      const proposalStats = await ctx.runQuery("proposals.getProposalStats", {
        startDate: yesterday,
        endDate: now,
      });
      
      const workOrderStats = await ctx.runQuery("workOrders.getWorkOrderStats", {
        startDate: yesterday,
        endDate: now,
      });
      
      // Send daily report notification
      await ctx.runMutation("notifications", {
        type: "new_lead",
        title: "Daily Report Generated",
        message: `Yesterday: ${leadStats.total} leads, ${proposalStats.accepted} proposals accepted, $${workOrderStats.totalRevenue.toLocaleString()} revenue`,
        recipientEmail: "business@treeshop.app",
        status: "pending",
        createdAt: now,
      });
      
      return { 
        leadStats, 
        proposalStats, 
        workOrderStats 
      };
    },
  })
};