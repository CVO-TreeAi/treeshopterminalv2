import { query } from "./_generated/server";

// Debug function to see what's actually in the database
export const checkExistingData = query({
  handler: async (ctx) => {
    try {
      // Check existing leads
      const leads = await ctx.db.query("leads").take(5);
      const users = await ctx.db.query("users").take(3);
      
      return {
        success: true,
        leadCount: leads.length,
        userCount: users.length,
        sampleLead: leads[0] || null,
        sampleUser: users[0] || null,
        message: "Database connection successful!"
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Database connection failed"
      };
    }
  },
});