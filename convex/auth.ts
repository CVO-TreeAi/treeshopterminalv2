import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query to validate PIN authentication
export const validatePin = query({
  args: { 
    pin: v.string(),
    type: v.union(v.literal("business"), v.literal("admin"))
  },
  handler: async (ctx, args) => {
    // In production, these would be hashed and stored in database
    const validPins = {
      business: "2024",
      admin: "4747"
    };
    
    const isValid = validPins[args.type] === args.pin;
    
    if (isValid) {
      // Create or update user session
      const now = Date.now();
      const sessionExpiry = now + (24 * 60 * 60 * 1000); // 24 hours
      
      // For now, return simple validation
      // In production, create proper JWT tokens
      return {
        valid: true,
        userType: args.type,
        expiresAt: sessionExpiry,
        permissions: args.type === "admin" ? ["read", "write", "delete"] : ["read", "write"]
      };
    }
    
    return {
      valid: false,
      error: "Invalid PIN"
    };
  },
});

// Query to get current user info (placeholder)
export const getCurrentUser = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // In production, validate JWT token and return user data
    // For now, return mock admin user
    return {
      id: "admin-user",
      name: "Admin User",
      email: "admin@treeshop.app",
      role: "admin",
      isActive: true,
    };
  },
});

// Mutation to create initial admin user
export const createInitialUser = mutation({
  handler: async (ctx) => {
    // Check if any users exist
    const existingUsers = await ctx.db.query("users").take(1);
    
    if (existingUsers.length === 0) {
      const now = Date.now();
      
      const adminId = await ctx.db.insert("users", {
        email: "admin@treeshop.app",
        name: "Admin User",
        role: "admin",
        pin: "4747", // In production, this should be hashed
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      
      // Create business user
      const businessId = await ctx.db.insert("users", {
        email: "business@treeshop.app",
        name: "Business User",
        role: "operator",
        pin: "2024", // In production, this should be hashed
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      
      return { adminId, businessId };
    }
    
    return { message: "Users already exist" };
  },
});

// Query to get all users (admin only)
export const getUsers = query({
  handler: async (ctx) => {
    // In production, add proper authorization
    return await ctx.db.query("users").collect();
  },
});

// Mutation to create new user
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("operator"), v.literal("viewer")),
    pin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: args.role,
      pin: args.pin,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    
    return userId;
  },
});

// Mutation to update user
export const updateUser = mutation({
  args: {
    id: v.id("users"),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("operator"), v.literal("viewer"))),
    pin: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
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