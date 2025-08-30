import { mutation } from "./_generated/server";

// Initialize the database with sample data for testing
export const initializeDatabase = mutation({
  handler: async (ctx) => {
    // Create initial admin user
    const adminUser = await ctx.db.insert("users", {
      email: "admin@treeshop.app",
      name: "Admin User",
      role: "admin",
      pin: "4747",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create business user
    const businessUser = await ctx.db.insert("users", {
      email: "business@treeshop.app", 
      name: "Business User",
      role: "operator",
      pin: "2024",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create sample lead
    const lead = await ctx.db.insert("leads", {
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
    });

    // Create sample notification
    await ctx.db.insert("notifications", {
      type: "new_lead",
      title: "New Lead Received",
      message: "New Medium package lead from John Smith - 123 Oak Lane, Orlando, FL",
      leadId: lead,
      recipientEmail: "business@treeshop.app",
      status: "pending",
      createdAt: Date.now(),
      createdBy: adminUser,
    });

    return {
      message: "Database initialized successfully",
      users: { adminUser, businessUser },
      sampleLead: lead,
    };
  },
});