import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query to get time entries for a work order
export const getTimeEntries = query({
  args: { 
    workOrderId: v.id("workOrders"),
    activityType: v.optional(v.union(
      v.literal("forestry_mulching"), v.literal("land_clearing"),
      v.literal("transport"), v.literal("fueling"), v.literal("training"),
      v.literal("safety"), v.literal("client_walkthrough"), v.literal("cleanup")
    ))
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("timeEntries")
      .withIndex("by_work_order", (q) => q.eq("workOrderId", args.workOrderId));
    
    if (args.activityType) {
      query = query.filter((q) => q.eq(q.field("activityType"), args.activityType));
    }
    
    const entries = await query.order("asc").collect();
    
    // Enrich with user data
    const enriched = await Promise.all(
      entries.map(async (entry) => {
        const user = await ctx.db.get(entry.recordedBy);
        return { ...entry, recordedByUser: user };
      })
    );
    
    return enriched;
  },
});

// Query to get active (ongoing) time entries
export const getActiveTimeEntries = query({
  args: { workOrderId: v.optional(v.id("workOrders")) },
  handler: async (ctx, args) => {
    let query = ctx.db.query("timeEntries");
    
    if (args.workOrderId) {
      query = query.withIndex("by_work_order", (q) => q.eq("workOrderId", args.workOrderId));
    }
    
    const activeEntries = await query
      .filter((q) => q.eq(q.field("endTime"), undefined))
      .collect();
    
    // Enrich with work order and user data
    const enriched = await Promise.all(
      activeEntries.map(async (entry) => {
        const workOrder = await ctx.db.get(entry.workOrderId);
        const user = await ctx.db.get(entry.recordedBy);
        return { ...entry, workOrder, recordedByUser: user };
      })
    );
    
    return enriched;
  },
});

// Mutation to start a time entry
export const startTimeEntry = mutation({
  args: {
    workOrderId: v.id("workOrders"),
    activityType: v.union(
      v.literal("forestry_mulching"), v.literal("land_clearing"),
      v.literal("transport"), v.literal("fueling"), v.literal("training"),
      v.literal("safety"), v.literal("client_walkthrough"), v.literal("cleanup")
    ),
    description: v.string(),
    packageType: v.optional(v.string()),
    equipmentUsed: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    recordedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // End any active entries for this user on this work order
    const activeEntries = await ctx.db
      .query("timeEntries")
      .withIndex("by_work_order", (q) => q.eq("workOrderId", args.workOrderId))
      .filter((q) => 
        q.and(
          q.eq(q.field("recordedBy"), args.recordedBy),
          q.eq(q.field("endTime"), undefined)
        )
      )
      .collect();
    
    for (const entry of activeEntries) {
      const duration = Math.round((now - entry.startTime) / (1000 * 60)); // minutes
      await ctx.db.patch(entry._id, {
        endTime: now,
        duration: duration,
        updatedAt: now,
      });
    }
    
    // Create new time entry
    const timeEntryId = await ctx.db.insert("timeEntries", {
      workOrderId: args.workOrderId,
      activityType: args.activityType,
      description: args.description,
      packageType: args.packageType,
      startTime: now,
      equipmentUsed: args.equipmentUsed,
      notes: args.notes,
      recordedBy: args.recordedBy,
      createdAt: now,
      updatedAt: now,
    });
    
    return timeEntryId;
  },
});

// Mutation to end a time entry
export const endTimeEntry = mutation({
  args: {
    id: v.id("timeEntries"),
    acreageWorked: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const timeEntry = await ctx.db.get(args.id);
    if (!timeEntry) {
      throw new Error("Time entry not found");
    }
    
    if (timeEntry.endTime) {
      throw new Error("Time entry already ended");
    }
    
    const now = Date.now();
    const duration = Math.round((now - timeEntry.startTime) / (1000 * 60)); // minutes
    
    await ctx.db.patch(args.id, {
      endTime: now,
      duration: duration,
      acreageWorked: args.acreageWorked,
      notes: args.notes ? `${timeEntry.notes || ""} ${args.notes}`.trim() : timeEntry.notes,
      updatedAt: now,
    });
    
    return args.id;
  },
});

// Mutation to update time entry details
export const updateTimeEntry = mutation({
  args: {
    id: v.id("timeEntries"),
    description: v.optional(v.string()),
    activityType: v.optional(v.union(
      v.literal("forestry_mulching"), v.literal("land_clearing"),
      v.literal("transport"), v.literal("fueling"), v.literal("training"),
      v.literal("safety"), v.literal("client_walkthrough"), v.literal("cleanup")
    )),
    packageType: v.optional(v.string()),
    acreageWorked: v.optional(v.number()),
    equipmentUsed: v.optional(v.array(v.string())),
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

// Mutation to manually create time entry (for corrections)
export const createTimeEntry = mutation({
  args: {
    workOrderId: v.id("workOrders"),
    activityType: v.union(
      v.literal("forestry_mulching"), v.literal("land_clearing"),
      v.literal("transport"), v.literal("fueling"), v.literal("training"),
      v.literal("safety"), v.literal("client_walkthrough"), v.literal("cleanup")
    ),
    description: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    packageType: v.optional(v.string()),
    acreageWorked: v.optional(v.number()),
    equipmentUsed: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    recordedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const duration = Math.round((args.endTime - args.startTime) / (1000 * 60));
    
    const timeEntryId = await ctx.db.insert("timeEntries", {
      workOrderId: args.workOrderId,
      activityType: args.activityType,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      duration: duration,
      packageType: args.packageType,
      acreageWorked: args.acreageWorked,
      equipmentUsed: args.equipmentUsed,
      notes: args.notes,
      recordedBy: args.recordedBy,
      createdAt: now,
      updatedAt: now,
    });
    
    return timeEntryId;
  },
});

// Query to get time summary for a work order
export const getWorkOrderTimeSummary = query({
  args: { workOrderId: v.id("workOrders") },
  handler: async (ctx, args) => {
    const timeEntries = await ctx.db
      .query("timeEntries")
      .withIndex("by_work_order", (q) => q.eq("workOrderId", args.workOrderId))
      .collect();
    
    const totalMinutes = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const totalHours = Math.round(totalMinutes / 60 * 100) / 100;
    
    // Break down by activity type
    const byActivity = timeEntries.reduce((acc, entry) => {
      const minutes = entry.duration || 0;
      if (!acc[entry.activityType]) {
        acc[entry.activityType] = { minutes: 0, hours: 0, count: 0 };
      }
      acc[entry.activityType].minutes += minutes;
      acc[entry.activityType].hours = Math.round(acc[entry.activityType].minutes / 60 * 100) / 100;
      acc[entry.activityType].count += 1;
      return acc;
    }, {} as Record<string, { minutes: number; hours: number; count: number }>);
    
    // Package-specific work time
    const packageWork = timeEntries.filter(e => 
      ["forestry_mulching", "land_clearing"].includes(e.activityType)
    );
    const packageMinutes = packageWork.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const packageHours = Math.round(packageMinutes / 60 * 100) / 100;
    
    // Total acreage worked
    const totalAcreageWorked = timeEntries
      .reduce((sum, entry) => sum + (entry.acreageWorked || 0), 0);
    
    // Equipment usage
    const equipmentUsed = [...new Set(
      timeEntries.flatMap(entry => entry.equipmentUsed || [])
    )];
    
    return {
      totalHours,
      totalMinutes,
      packageHours,
      packageMinutes,
      byActivity,
      totalAcreageWorked,
      equipmentUsed,
      entryCount: timeEntries.length,
    };
  },
});

// Query for time tracking analytics
export const getTimeTrackingStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    activityType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const startDate = args.startDate || (Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = args.endDate || Date.now();
    
    let query = ctx.db.query("timeEntries");
    
    const timeEntries = await query
      .filter((q) => 
        q.and(
          q.gte(q.field("startTime"), startDate),
          q.lte(q.field("startTime"), endDate),
          args.activityType ? q.eq(q.field("activityType"), args.activityType) : true
        )
      )
      .collect();
    
    const totalHours = timeEntries.reduce((sum, entry) => 
      sum + (entry.duration || 0), 0) / 60;
    
    // Hours by activity type
    const hoursByActivity = timeEntries.reduce((acc, entry) => {
      const hours = (entry.duration || 0) / 60;
      acc[entry.activityType] = (acc[entry.activityType] || 0) + hours;
      return acc;
    }, {} as Record<string, number>);
    
    // Hours by package type
    const hoursByPackage = timeEntries
      .filter(e => e.packageType)
      .reduce((acc, entry) => {
        const hours = (entry.duration || 0) / 60;
        acc[entry.packageType!] = (acc[entry.packageType!] || 0) + hours;
        return acc;
      }, {} as Record<string, number>);
    
    // Productivity metrics (for forestry mulching)
    const forestryEntries = timeEntries.filter(e => 
      e.activityType === "forestry_mulching" && e.acreageWorked
    );
    
    const totalAcres = forestryEntries.reduce((sum, entry) => 
      sum + (entry.acreageWorked || 0), 0);
    const forestryHours = forestryEntries.reduce((sum, entry) => 
      sum + (entry.duration || 0), 0) / 60;
    
    const acresPerHour = forestryHours > 0 ? totalAcres / forestryHours : 0;
    
    return {
      totalHours: Math.round(totalHours * 100) / 100,
      hoursByActivity: Object.entries(hoursByActivity).map(([activity, hours]) => ({
        activity,
        hours: Math.round(hours * 100) / 100,
      })),
      hoursByPackage: Object.entries(hoursByPackage).map(([packageType, hours]) => ({
        packageType,
        hours: Math.round(hours * 100) / 100,
      })),
      productivity: {
        totalAcres: Math.round(totalAcres * 100) / 100,
        forestryHours: Math.round(forestryHours * 100) / 100,
        acresPerHour: Math.round(acresPerHour * 100) / 100,
      },
      entryCount: timeEntries.length,
    };
  },
});

// Mutation to delete time entry
export const deleteTimeEntry = mutation({
  args: { id: v.id("timeEntries") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Query to get daily time summary for crew dashboard
export const getDailyTimeSummary = query({
  args: { 
    date: v.optional(v.number()), // Unix timestamp for the date
    userId: v.optional(v.id("users"))
  },
  handler: async (ctx, args) => {
    const targetDate = args.date || Date.now();
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    let query = ctx.db.query("timeEntries");
    
    if (args.userId) {
      query = query.filter((q) => q.eq(q.field("recordedBy"), args.userId));
    }
    
    const dayEntries = await query
      .filter((q) => 
        q.and(
          q.gte(q.field("startTime"), dayStart.getTime()),
          q.lte(q.field("startTime"), dayEnd.getTime())
        )
      )
      .collect();
    
    const totalHours = dayEntries.reduce((sum, entry) => 
      sum + (entry.duration || 0), 0) / 60;
    
    const workOrderSummary = dayEntries.reduce((acc, entry) => {
      const workOrderId = entry.workOrderId;
      if (!acc[workOrderId]) {
        acc[workOrderId] = { hours: 0, entries: [] };
      }
      acc[workOrderId].hours += (entry.duration || 0) / 60;
      acc[workOrderId].entries.push(entry);
      return acc;
    }, {} as Record<string, { hours: number; entries: any[] }>);
    
    return {
      date: targetDate,
      totalHours: Math.round(totalHours * 100) / 100,
      entryCount: dayEntries.length,
      workOrderSummary: Object.entries(workOrderSummary).map(([workOrderId, summary]) => ({
        workOrderId,
        hours: Math.round(summary.hours * 100) / 100,
        entryCount: summary.entries.length,
      })),
    };
  },
});