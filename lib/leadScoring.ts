// Lead Scoring System for TreeShop
// Scores leads based on multiple factors to prioritize follow-up

export interface LeadScoringFactors {
  // Contact Information Completeness (0-25 points)
  hasEmail: boolean;
  hasPhone: boolean;
  hasAddress: boolean;
  hasName: boolean;

  // Project Details (0-35 points)
  hasAcreage: boolean;
  acreageSize?: number;
  hasPackageSelected: boolean;
  estimatedValue?: number;
  hasNotes: boolean;

  // Engagement (0-20 points)
  source: string;
  timeOnSite?: number; // in seconds
  pagesViewed?: number;
  
  // Timing (0-20 points)
  hoursSinceSubmission: number;
  season?: "spring" | "summer" | "fall" | "winter";
}

export interface LeadScore {
  total: number;
  grade: "A" | "B" | "C" | "D" | "F";
  factors: {
    contactCompleteness: number;
    projectQuality: number;
    engagement: number;
    timing: number;
  };
  recommendations: string[];
}

export function calculateLeadScore(factors: LeadScoringFactors): LeadScore {
  const scores = {
    contactCompleteness: 0,
    projectQuality: 0,
    engagement: 0,
    timing: 0,
  };
  const recommendations: string[] = [];

  // Contact Information Completeness (0-25 points)
  if (factors.hasEmail) scores.contactCompleteness += 8;
  else recommendations.push("Request email address");
  
  if (factors.hasPhone) scores.contactCompleteness += 10;
  else recommendations.push("Request phone number");
  
  if (factors.hasAddress) scores.contactCompleteness += 5;
  else recommendations.push("Request property address");
  
  if (factors.hasName) scores.contactCompleteness += 2;
  else recommendations.push("Request full name");

  // Project Details (0-35 points)
  if (factors.hasAcreage) {
    scores.projectQuality += 10;
    
    // Bonus for larger projects
    if (factors.acreageSize) {
      if (factors.acreageSize >= 5) scores.projectQuality += 10;
      else if (factors.acreageSize >= 2) scores.projectQuality += 5;
      else if (factors.acreageSize >= 1) scores.projectQuality += 2;
    }
  } else {
    recommendations.push("Determine property size");
  }

  if (factors.hasPackageSelected) {
    scores.projectQuality += 8;
  } else {
    recommendations.push("Discuss service package options");
  }

  if (factors.estimatedValue) {
    // Higher value projects get more points
    if (factors.estimatedValue >= 50000) scores.projectQuality += 7;
    else if (factors.estimatedValue >= 20000) scores.projectQuality += 5;
    else if (factors.estimatedValue >= 10000) scores.projectQuality += 3;
    else if (factors.estimatedValue >= 5000) scores.projectQuality += 1;
  }

  if (factors.hasNotes) {
    scores.projectQuality += 2;
  }

  // Engagement (0-20 points)
  // Premium sources get higher scores
  if (factors.source === "treeshop.app") {
    scores.engagement += 10; // Direct site visitor
  } else if (factors.source === "fltreeshop.com") {
    scores.engagement += 8; // Regional site
  } else if (factors.source === "referral") {
    scores.engagement += 12; // Referrals are gold
  } else {
    scores.engagement += 5; // Other sources
  }

  // Time on site and pages viewed (if available)
  if (factors.timeOnSite) {
    if (factors.timeOnSite >= 300) scores.engagement += 5; // 5+ minutes
    else if (factors.timeOnSite >= 120) scores.engagement += 3; // 2+ minutes
    else if (factors.timeOnSite >= 60) scores.engagement += 1; // 1+ minute
  }

  if (factors.pagesViewed) {
    if (factors.pagesViewed >= 5) scores.engagement += 3;
    else if (factors.pagesViewed >= 3) scores.engagement += 2;
    else if (factors.pagesViewed >= 2) scores.engagement += 1;
  }

  // Timing (0-20 points)
  // Fresh leads are hot leads
  if (factors.hoursSinceSubmission <= 1) {
    scores.timing += 20;
    recommendations.unshift("🔥 HOT LEAD - Contact immediately!");
  } else if (factors.hoursSinceSubmission <= 4) {
    scores.timing += 15;
    recommendations.unshift("Contact within next hour");
  } else if (factors.hoursSinceSubmission <= 24) {
    scores.timing += 10;
    recommendations.push("Follow up today");
  } else if (factors.hoursSinceSubmission <= 48) {
    scores.timing += 5;
    recommendations.push("Follow up within 24 hours");
  } else if (factors.hoursSinceSubmission <= 168) { // 1 week
    scores.timing += 2;
    recommendations.push("Lead cooling - contact ASAP");
  } else {
    recommendations.push("⚠️ Cold lead - needs re-engagement");
  }

  // Seasonal bonus (tree work is seasonal)
  if (factors.season === "spring" || factors.season === "fall") {
    scores.timing += 2; // Peak seasons
  }

  // Calculate total
  const total = 
    scores.contactCompleteness +
    scores.projectQuality +
    scores.engagement +
    scores.timing;

  // Determine grade
  let grade: LeadScore["grade"];
  if (total >= 85) {
    grade = "A";
    recommendations.unshift("⭐ Premium lead - prioritize!");
  } else if (total >= 70) {
    grade = "B";
    recommendations.unshift("Strong lead - follow up promptly");
  } else if (total >= 55) {
    grade = "C";
    recommendations.unshift("Average lead - standard follow-up");
  } else if (total >= 40) {
    grade = "D";
    recommendations.unshift("Needs nurturing");
  } else {
    grade = "F";
    recommendations.unshift("Low priority - automated follow-up");
  }

  return {
    total,
    grade,
    factors: scores,
    recommendations: recommendations.slice(0, 5), // Top 5 recommendations
  };
}

// Helper function to score a lead from database
export function scoreLeadFromData(lead: {
  email?: string;
  phone?: string;
  address?: string;
  name?: string;
  acreage?: number;
  selectedPackage?: string;
  estimatedTotal?: number;
  notes?: string;
  siteSource?: string;
  createdAt: number;
  timeOnSite?: number;
  pagesViewed?: number;
}): LeadScore {
  const now = Date.now();
  const hoursSinceSubmission = (now - lead.createdAt) / (1000 * 60 * 60);
  
  // Determine season
  const month = new Date().getMonth();
  let season: LeadScoringFactors["season"];
  if (month >= 2 && month <= 4) season = "spring";
  else if (month >= 5 && month <= 7) season = "summer";
  else if (month >= 8 && month <= 10) season = "fall";
  else season = "winter";

  return calculateLeadScore({
    hasEmail: !!lead.email,
    hasPhone: !!lead.phone,
    hasAddress: !!lead.address,
    hasName: !!lead.name,
    hasAcreage: !!lead.acreage,
    acreageSize: lead.acreage,
    hasPackageSelected: !!lead.selectedPackage,
    estimatedValue: lead.estimatedTotal,
    hasNotes: !!lead.notes,
    source: lead.siteSource || "unknown",
    hoursSinceSubmission,
    season,
    // These would come from analytics tracking
    timeOnSite: lead.timeOnSite,
    pagesViewed: lead.pagesViewed,
  });
}