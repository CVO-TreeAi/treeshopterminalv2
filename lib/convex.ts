import { ConvexReactClient } from "convex/react";

// In production, this would come from environment variables
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://dynamic-sparrow-401.convex.site";

export const convex = new ConvexReactClient(convexUrl);