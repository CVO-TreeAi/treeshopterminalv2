import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
    CLIENT_ID_PREFIX: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + "...",
  });
}