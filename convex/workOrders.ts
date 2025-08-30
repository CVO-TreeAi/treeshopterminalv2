import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query to get all work orders
export const getWorkOrders = query({
  args: {
    status: v.optional(v.union(
      v.literal("scheduled"), v.literal("in_progress"), v.literal("paused"),
      v.literal("completed"), v.literal("cancelled")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("workOrders");
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    const workOrders = await query
      .order("desc")
      .take(args.limit || 50);
    
    return workOrders;
  },
});

// Query to get work orders scheduled for today
export const getTodaysWorkOrders = query({
  handler: async (ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await ctx.db
      .query("workOrders")
      .filter((q) => 
        q.and(
          q.gte(q.field("scheduledDate"), today.getTime()),
          q.lt(q.field("scheduledDate"), tomorrow.getTime()),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .order("asc")
      .collect();
  },
});

// Query to get a single work order with related data
export const getWorkOrder = query({
  args: { id: v.id("workOrders") },
  handler: async (ctx, args) => {
    const workOrder = await ctx.db.get(args.id);
    if (!workOrder) return null;
    
    // Get related proposal and lead
    const proposal = await ctx.db.get(workOrder.proposalId);
    const lead = proposal ? await ctx.db.get(proposal.leadId) : null;
    
    // Get time entries
    const timeEntries = await ctx.db
      .query("timeEntries")
      .withIndex("by_work_order", (q) => q.eq("workOrderId", args.id))
      .collect();
    
    return { 
      ...workOrder, 
      proposal, 
      lead, 
      timeEntries 
    };
  },
});

// Mutation to schedule a work order
export const scheduleWorkOrder = mutation({
  args: {
    id: v.id("workOrders"),
    scheduledDate: v.number(),
    assignedCrew: v.optional(v.string()),
    equipment: v.optional(v.array(v.string())),
    estimatedDuration: v.optional(v.string()),
    specialInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const now = Date.now();
    
    await ctx.db.patch(id, {
      ...updates,
      status: "scheduled",
      updatedAt: now,
    });
    
    // Get work order for notification
    const workOrder = await ctx.db.get(id);
    if (workOrder) {
      // Create notification to customer
      await ctx.db.insert("notifications", {
        type: "new_lead", // Will expand types
        title: "Work Scheduled",
        message: `Your ${workOrder.packageType} project at ${workOrder.propertyAddress} has been scheduled`,
        recipientEmail: workOrder.customerEmail,
        recipientPhone: workOrder.customerPhone,
        workOrderId: id,
        status: "pending",
        createdAt: now,
        createdBy: workOrder.createdBy,
      });
    }
    
    return id;
  },
});

// Mutation to start work on a work order
export const startWork = mutation({
  args: {
    id: v.id("workOrders"),
    startedBy: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.id, {
      status: "in_progress",
      startedAt: now,
      updatedAt: now,
    });
    
    // Create initial time entry for work start
    await ctx.db.insert("timeEntries", {
      workOrderId: args.id,
      activityType: "forestry_mulching", // Default, can be updated
      description: "Work started",
      startTime: now,
      notes: args.notes,
      recordedBy: args.startedBy,
      createdAt: now,
      updatedAt: now,
    });
    
    // Notify customer work has started
    const workOrder = await ctx.db.get(args.id);
    if (workOrder) {
      await ctx.db.insert("notifications", {
        type: "work_started",
        title: "Work Started",
        message: `Work has begun on your ${workOrder.packageType} project at ${workOrder.propertyAddress}`,
        recipientEmail: workOrder.customerEmail,
        recipientPhone: workOrder.customerPhone,
        workOrderId: args.id,
        status: "pending",
        createdAt: now,
        createdBy: args.startedBy,
      });
    }
    
    return args.id;
  },
});

// Mutation to complete work order
export const completeWork = mutation({
  args: {
    id: v.id("workOrders"),
    completedBy: v.id("users"),
    completionNotes: v.optional(v.string()),
    beforePhotos: v.optional(v.array(v.string())),
    afterPhotos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Update work order status
    await ctx.db.patch(args.id, {
      status: "completed",
      completedAt: now,
      updatedAt: now,
    });
    
    // Close any open time entries
    const openTimeEntries = await ctx.db
      .query("timeEntries")
      .withIndex("by_work_order", (q) => q.eq("workOrderId", args.id))
      .filter((q) => q.eq(q.field("endTime"), undefined))
      .collect();
    
    for (const entry of openTimeEntries) {
      const duration = Math.round((now - entry.startTime) / (1000 * 60)); // minutes
      await ctx.db.patch(entry._id, {
        endTime: now,
        duration: duration,
        updatedAt: now,
      });
    }
    
    // Generate project report
    const workOrder = await ctx.db.get(args.id);
    if (workOrder) {
      const allTimeEntries = await ctx.db
        .query("timeEntries")
        .withIndex("by_work_order", (q) => q.eq("workOrderId", args.id))
        .collect();
      
      const totalHours = allTimeEntries.reduce((sum, entry) => 
        sum + (entry.duration || 0), 0) / 60;
      
      const forestryHours = allTimeEntries
        .filter(e => e.activityType === "forestry_mulching")
        .reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60;
      
      const transportHours = allTimeEntries
        .filter(e => e.activityType === "transport")
        .reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60;
      
      const otherHours = totalHours - forestryHours - transportHours;
      
      const equipmentUsed = [...new Set(
        allTimeEntries.flatMap(e => e.equipmentUsed || [])
      )];
      
      await ctx.db.insert("projectReports", {
        workOrderId: args.id,
        projectNumber: workOrder.projectNumber,
        customerName: workOrder.customerName,
        propertyAddress: workOrder.propertyAddress,
        packageType: workOrder.packageType,
        totalAcreage: workOrder.workAreaAcreage,
        totalHours: Math.round(totalHours * 100) / 100,
        forestryHours: Math.round(forestryHours * 100) / 100,
        transportHours: Math.round(transportHours * 100) / 100,
        otherHours: Math.round(otherHours * 100) / 100,
        equipmentUsed: equipmentUsed,
        crewMembers: [], // Will be populated when crew management is added
        completionStatus: "completed",
        beforePhotos: args.beforePhotos,
        afterPhotos: args.afterPhotos,
        projectJournal: args.completionNotes,
        createdAt: now,
        updatedAt: now,
        generatedBy: args.completedBy,
      });
      
      // Notify customer of completion
      await ctx.db.insert("notifications", {
        type: "work_completed",
        title: "Work Completed",
        message: `Your ${workOrder.packageType} project at ${workOrder.propertyAddress} has been completed!`,
        recipientEmail: workOrder.customerEmail,
        recipientPhone: workOrder.customerPhone,
        workOrderId: args.id,
        status: "pending",
        createdAt: now,
        createdBy: args.completedBy,
      });
      
      // Auto-generate invoice
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      await ctx.db.insert("invoices", {
        workOrderId: args.id,
        proposalId: workOrder.proposalId,
        leadId: workOrder.leadId,
        invoiceNumber: invoiceNumber,
        customerName: workOrder.customerName,
        customerEmail: workOrder.customerEmail,
        propertyAddress: workOrder.propertyAddress,
        subtotal: workOrder.totalAmount,
        depositAmount: workOrder.depositAmount,
        balanceAmount: workOrder.balanceAmount,
        totalAmount: workOrder.balanceAmount, // What's still owed
        status: "draft",
        dueAt: now + (24 * 60 * 60 * 1000), // Due in 24 hours
        createdAt: now,
        updatedAt: now,
        generatedBy: args.completedBy,
      });
    }
    
    return args.id;
  },
});

// Mutation to pause/resume work
export const pauseWork = mutation({
  args: {
    id: v.id("workOrders"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workOrder = await ctx.db.get(args.id);
    const now = Date.now();
    
    const newStatus = workOrder?.status === "paused" ? "in_progress" : "paused";
    
    await ctx.db.patch(args.id, {
      status: newStatus,
      updatedAt: now,
    });
    
    // Close open time entries if pausing
    if (newStatus === "paused") {
      const openTimeEntries = await ctx.db
        .query("timeEntries")
        .withIndex("by_work_order", (q) => q.eq("workOrderId", args.id))
        .filter((q) => q.eq(q.field("endTime"), undefined))
        .collect();
      
      for (const entry of openTimeEntries) {
        const duration = Math.round((now - entry.startTime) / (1000 * 60));
        await ctx.db.patch(entry._id, {
          endTime: now,
          duration: duration,
          notes: entry.notes ? `${entry.notes} - Paused: ${args.reason}` : `Paused: ${args.reason}`,
          updatedAt: now,
        });
      }
    }
    
    return args.id;
  },
});

// Query for work order statistics
export const getWorkOrderStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const startDate = args.startDate || (Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = args.endDate || Date.now();
    
    const workOrders = await ctx.db
      .query("workOrders")
      .filter((q) => 
        q.and(
          q.gte(q.field("createdAt"), startDate),
          q.lte(q.field("createdAt"), endDate)
        )
      )
      .collect();
    
    const total = workOrders.length;
    const completed = workOrders.filter(wo => wo.status === "completed").length;
    const inProgress = workOrders.filter(wo => wo.status === "in_progress").length;
    const scheduled = workOrders.filter(wo => wo.status === "scheduled").length;
    
    const totalRevenue = workOrders
      .filter(wo => wo.status === "completed")
      .reduce((sum, wo) => sum + wo.totalAmount, 0);
    
    return {
      total,
      completed,
      inProgress,
      scheduled,
      totalRevenue,
      averageValue: completed > 0 ? totalRevenue / completed : 0,
      completionRate: total > 0 ? (completed / total * 100) : 0,
    };
  },
});

// Query to get upcoming work orders (next 7 days)
export const getUpcomingWorkOrders = query({
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDaysFromNow = now + (7 * 24 * 60 * 60 * 1000);
    
    return await ctx.db
      .query("workOrders")
      .filter((q) => 
        q.and(
          q.gte(q.field("scheduledDate"), now),
          q.lte(q.field("scheduledDate"), sevenDaysFromNow),
          q.eq(q.field("status"), "scheduled")
        )
      )
      .order("asc")
      .collect();
  },
});

// Mutation to update work order details
export const updateWorkOrder = mutation({
  args: {
    id: v.id("workOrders"),
    scheduledDate: v.optional(v.number()),
    assignedCrew: v.optional(v.string()),
    equipment: v.optional(v.array(v.string())),
    specialInstructions: v.optional(v.string()),
    estimatedDuration: v.optional(v.string()),
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