// TreeAI Design System - Black Background Theme
export const theme = {
  colors: {
    // Core Brand
    black: "#000000",        // Primary background
    white: "#FFFFFF",        // Primary text
    green: {
      400: "#86EFAC",        // Hover states
      500: "#4ADE80",        // Primary brand - buttons, links
      600: "#22C55E",        // Active/pressed states
    },
    
    // High-Contrast Accent Colors
    cyan: {
      400: "#22D3EE",        // Info alerts, secondary CTAs
    },
    yellow: {
      400: "#FACC15",        // Warnings, attention grabbers
    },
    orange: {
      500: "#FB923C",        // Notifications, badges
    },
    red: {
      500: "#EF4444",        // Errors, destructive actions
    },
    purple: {
      500: "#A855F7",        // Premium features, special
    },
    blue: {
      400: "#60A5FA",        // Links, info
      500: "#3B82F6",        // Primary actions
      600: "#2563EB",        // Hover states
    },
    
    // UI Elements
    gray: {
      100: "#F3F4F6",        // High contrast text on dark
      200: "#E5E7EB",        // Secondary text
      300: "#D1D5DB",        // Tertiary text
      400: "#9CA3AF",        // Muted text
      600: "#4B5563",        // Borders
      700: "#374151",        // Subtle borders
      800: "#1F2937",        // Card backgrounds
      900: "#111827",        // Elevated surfaces
    },
    
    // Functional Colors
    success: "#4ADE80",
    warning: "#FACC15",
    error: "#EF4444",
    info: "#22D3EE",
  },
  
  // Semantic Tokens
  background: {
    primary: "#000000",
    secondary: "#111827",
    card: "#1F2937",
    elevated: "#374151",
  },
  
  text: {
    primary: "#FFFFFF",
    secondary: "#E5E7EB",
    muted: "#9CA3AF",
    inverse: "#000000",
  },
  
  border: {
    default: "#374151",
    focus: "#4ADE80",
    error: "#EF4444",
  },
  
  // Component Specific
  button: {
    primary: {
      bg: "#4ADE80",
      hover: "#86EFAC",
      active: "#22C55E",
      text: "#000000",
    },
    secondary: {
      bg: "#1F2937",
      hover: "#374151",
      active: "#111827",
      text: "#FFFFFF",
    },
    danger: {
      bg: "#EF4444",
      hover: "#F87171",
      active: "#DC2626",
      text: "#FFFFFF",
    },
  },
  
  status: {
    new: "#3B82F6",
    contacted: "#FACC15",
    qualified: "#A855F7",
    won: "#4ADE80",
    lost: "#EF4444",
    pending: "#FB923C",
  },
};

// Tailwind class mappings for consistency
export const tw = {
  // Backgrounds
  bgPrimary: "bg-black",
  bgSecondary: "bg-gray-900",
  bgCard: "bg-gray-800",
  bgElevated: "bg-gray-700",
  
  // Text
  textPrimary: "text-white",
  textSecondary: "text-gray-200",
  textMuted: "text-gray-400",
  
  // Borders
  borderDefault: "border-gray-700",
  borderFocus: "border-green-500",
  
  // Buttons
  btnPrimary: "bg-green-500 hover:bg-green-400 active:bg-green-600 text-black",
  btnSecondary: "bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white",
  btnDanger: "bg-red-500 hover:bg-red-400 active:bg-red-600 text-white",
  
  // Cards
  card: "bg-gray-800 border border-gray-700 rounded-lg",
  cardHover: "hover:bg-gray-700 hover:border-gray-600",
  
  // Inputs
  input: "bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500",
  
  // Status badges
  statusNew: "bg-blue-500 text-white",
  statusContacted: "bg-yellow-400 text-black",
  statusQualified: "bg-purple-500 text-white",
  statusWon: "bg-green-500 text-black",
  statusLost: "bg-red-500 text-white",
};