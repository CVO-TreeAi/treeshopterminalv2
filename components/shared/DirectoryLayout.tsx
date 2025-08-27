"use client";

import { ReactNode } from "react";

interface DirectoryLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  stats?: {
    label: string;
    value: string | number;
    color?: string;
    trend?: {
      value: number;
      isPositive: boolean;
    };
  }[];
  children: ReactNode;
}

export default function DirectoryLayout({
  title,
  subtitle,
  actions,
  stats,
  children,
}: DirectoryLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-green-500">{title}</h1>
            {subtitle && <p className="text-gray-400">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-4">{actions}</div>}
        </div>

        {/* Stats Grid */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm text-gray-400 mb-2">{stat.label}</h3>
                <p className={`text-2xl font-bold ${stat.color || "text-white"}`}>
                  {stat.value}
                </p>
                {stat.trend && (
                  <div className="flex items-center gap-1 mt-2">
                    <span
                      className={`text-xs ${
                        stat.trend.isPositive ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {stat.trend.isPositive ? "↑" : "↓"} {Math.abs(stat.trend.value)}%
                    </span>
                    <span className="text-xs text-gray-500">vs last week</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
}