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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-green-500">{title}</h1>
            {subtitle && <p className="text-sm sm:text-base text-gray-400">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">{actions}</div>}
        </div>

        {/* Stats Grid */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-700">
                <h3 className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2 truncate">{stat.label}</h3>
                <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${stat.color || "text-white"}`}>
                  {stat.value}
                </p>
                {stat.trend && (
                  <div className="flex items-center gap-1 mt-1 sm:mt-2">
                    <span
                      className={`text-xs ${
                        stat.trend.isPositive ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {stat.trend.isPositive ? "↑" : "↓"} {Math.abs(stat.trend.value)}%
                    </span>
                    <span className="text-xs text-gray-500 hidden sm:inline">vs last week</span>
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