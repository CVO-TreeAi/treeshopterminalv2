import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query to get all invoices
export const getInvoices = query({
  args: {
    status: v.optional(v.union(
      v.literal("draft"), v.literal("sent"), v.literal("paid"),
      v.literal("overdue"), v.literal("cancelled")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("invoices");
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    const invoices = await query
      .order("desc")
      .take(args.limit || 50);
    
    return invoices;
  },
});

// Query to get a single invoice
export const getInvoice = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id);
    if (!invoice) return null;
    
    // Get related work order, proposal, and lead
    const workOrder = await ctx.db.get(invoice.workOrderId);
    const proposal = workOrder ? await ctx.db.get(workOrder.proposalId) : null;
    const lead = proposal ? await ctx.db.get(proposal.leadId) : null;
    
    return { ...invoice, workOrder, proposal, lead };
  },
});

// Mutation to send invoice to customer
export const sendInvoice = mutation({
  args: {
    id: v.id("invoices"),
    emailSubject: v.optional(v.string()),
    emailBody: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    
    const now = Date.now();
    
    // Update invoice status to sent
    await ctx.db.patch(args.id, {
      status: "sent",
      sentAt: now,
      updatedAt: now,
    });
    
    // Create notification to send email
    await ctx.db.insert("notifications", {
      type: "payment_due",
      title: "Invoice Sent",
      message: `Invoice ${invoice.invoiceNumber} sent to ${invoice.customerName}`,
      recipientEmail: invoice.customerEmail,
      invoiceId: args.id,
      status: "pending",
      createdAt: now,
      createdBy: invoice.generatedBy,
    });
    
    return args.id;
  },
});

// Mutation to create a manual invoice
export const createInvoice = mutation({
  args: {
    workOrderId: v.optional(v.id("workOrders")),
    proposalId: v.optional(v.id("proposals")),
    leadId: v.optional(v.id("leads")),
    customerName: v.string(),
    customerEmail: v.string(),
    propertyAddress: v.string(),
    subtotal: v.number(),
    depositAmount: v.number(),
    balanceAmount: v.number(),
    totalAmount: v.number(),
    dueAt: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    
    const invoiceId = await ctx.db.insert("invoices", {
      workOrderId: args.workOrderId || ("manual" as any),
      proposalId: args.proposalId || ("manual" as any),
      leadId: args.leadId || ("manual" as any),
      invoiceNumber: invoiceNumber,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      propertyAddress: args.propertyAddress,
      subtotal: args.subtotal,
      depositAmount: args.depositAmount,
      balanceAmount: args.balanceAmount,
      totalAmount: args.totalAmount,
      status: "draft",
      dueAt: args.dueAt,
      createdAt: now,
      updatedAt: now,
      generatedBy: ("manual" as any), // Will be updated when user system is ready
    });
    
    return invoiceId;
  },
});

// Mutation to update invoice status
export const updateInvoiceStatus = mutation({
  args: {
    id: v.id("invoices"),
    status: v.union(
      v.literal("draft"), v.literal("sent"), v.literal("paid"),
      v.literal("overdue"), v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: now,
    });
    
    return args.id;
  },
});

// Mutation to delete invoice
export const deleteInvoice = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Mutation to record payment
export const recordPayment = mutation({
  args: {
    id: v.id("invoices"),
    paymentAmount: v.number(),
    paymentMethod: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    
    const now = Date.now();
    
    // Update invoice status to paid
    await ctx.db.patch(args.id, {
      status: "paid",
      paidAt: now,
      paymentMethod: args.paymentMethod,
      stripePaymentIntentId: args.stripePaymentIntentId,
      updatedAt: now,
    });
    
    // Create completion notification
    await ctx.db.insert("notifications", {
      type: "payment_due", // Will expand types
      title: "Payment Received",
      message: `Payment of $${args.paymentAmount} received for Invoice ${invoice.invoiceNumber}`,
      invoiceId: args.id,
      status: "pending",
      createdAt: now,
      createdBy: invoice.generatedBy,
    });
    
    return args.id;
  },
});

// Automated function to check for overdue invoices and apply late fees
export const processOverdueInvoices = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    
    // Find invoices that are overdue (sent more than 24 hours ago, not paid)
    const overdueInvoices = await ctx.db
      .query("invoices")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "sent"),
          q.lt(q.field("dueAt"), now),
          q.lt(q.field("sentAt"), twentyFourHoursAgo)
        )
      )
      .collect();
    
    const processed = [];
    
    for (const invoice of overdueInvoices) {
      // Apply 3% late fee if not already applied
      if (!invoice.lateFeeAppliedAt) {
        const lateFee = Math.round(invoice.totalAmount * 0.03);
        const newTotal = invoice.totalAmount + lateFee;
        
        await ctx.db.patch(invoice._id, {
          status: "overdue",
          lateFee: lateFee,
          totalAmount: newTotal,
          lateFeeAppliedAt: now,
          updatedAt: now,
        });
        
        // Send overdue notification
        await ctx.db.insert("notifications", {
          type: "payment_overdue",
          title: "Payment Overdue",
          message: `Invoice ${invoice.invoiceNumber} is overdue. 3% late fee applied.`,
          recipientEmail: invoice.customerEmail,
          invoiceId: invoice._id,
          status: "pending",
          createdAt: now,
          createdBy: invoice.generatedBy,
        });
        
        processed.push(invoice._id);
      }
    }
    
    return { processedCount: processed.length, invoiceIds: processed };
  },
});

// Query to get overdue invoices
export const getOverdueInvoices = query({
  handler: async (ctx) => {
    const now = Date.now();
    
    return await ctx.db
      .query("invoices")
      .filter((q) => 
        q.and(
          q.or(
            q.eq(q.field("status"), "overdue"),
            q.and(
              q.eq(q.field("status"), "sent"),
              q.lt(q.field("dueAt"), now)
            )
          )
        )
      )
      .order("asc")
      .collect();
  },
});

// Query for invoice statistics
export const getInvoiceStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const startDate = args.startDate || (Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = args.endDate || Date.now();
    
    const invoices = await ctx.db
      .query("invoices")
      .filter((q) => 
        q.and(
          q.gte(q.field("createdAt"), startDate),
          q.lte(q.field("createdAt"), endDate)
        )
      )
      .collect();
    
    const total = invoices.length;
    const paid = invoices.filter(inv => inv.status === "paid").length;
    const sent = invoices.filter(inv => inv.status === "sent").length;
    const overdue = invoices.filter(inv => inv.status === "overdue").length;
    
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidAmount = invoices
      .filter(inv => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    const outstandingAmount = invoices
      .filter(inv => ["sent", "overdue"].includes(inv.status))
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    const totalLateFees = invoices
      .reduce((sum, inv) => sum + (inv.lateFee || 0), 0);
    
    return {
      total,
      paid,
      sent,
      overdue,
      totalAmount,
      paidAmount,
      outstandingAmount,
      totalLateFees,
      collectionRate: total > 0 ? (paid / total * 100) : 0,
    };
  },
});

// Mutation to update invoice
export const updateInvoice = mutation({
  args: {
    id: v.id("invoices"),
    dueAt: v.optional(v.number()),
    notes: v.optional(v.string()),
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

// Mutation to cancel invoice
export const cancelInvoice = mutation({
  args: {
    id: v.id("invoices"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.id, {
      status: "cancelled",
      updatedAt: now,
    });
    
    return args.id;
  },
});

// Query to get recent invoices for dashboard
export const getRecentInvoices = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invoices")
      .order("desc")
      .take(args.limit || 10);
  },
});

// Query to get invoices due soon (next 7 days)
export const getInvoicesDueSoon = query({
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDaysFromNow = now + (7 * 24 * 60 * 60 * 1000);
    
    return await ctx.db
      .query("invoices")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "sent"),
          q.gte(q.field("dueAt"), now),
          q.lte(q.field("dueAt"), sevenDaysFromNow)
        )
      )
      .order("asc")
      .collect();
  },
});