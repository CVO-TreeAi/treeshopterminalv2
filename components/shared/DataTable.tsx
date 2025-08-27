"use client";

import { useState, useMemo, useEffect } from "react";
import MobileDataCard from "./MobileDataCard";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  searchKeys?: (keyof T)[];
  filters?: React.ReactNode;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  searchKeys = [],
  filters,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Search filter
    if (searchTerm && searchKeys.length > 0) {
      filtered = data.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Sort
    if (sortKey) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, searchKeys, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3">
          {searchKeys.length > 0 && (
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-green-500 text-white placeholder-gray-400"
            />
          )}
          {filters}
        </div>
      </div>

      {/* Mobile Cards View */}
      {isMobile ? (
        <div className="p-4 space-y-3">
          {processedData.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {emptyMessage}
            </div>
          ) : (
            processedData.map((item, index) => {
              // Get first few columns for mobile display
              const primaryCol = columns[0];
              const secondaryCol = columns.find(c => c.key === 'email' || c.key === 'customerEmail') || columns[1];
              const statusCol = columns.find(c => c.key === 'status');
              const valueCol = columns.find(c => c.key === 'total' || c.key === 'estimatedTotal');
              const actionCol = columns.find(c => c.key === 'actions');

              return (
                <MobileDataCard
                  key={index}
                  item={item}
                  primaryField={primaryCol.key as keyof T}
                  secondaryField={secondaryCol?.key as keyof T}
                  statusField={statusCol?.key as keyof T}
                  valueField={valueCol?.key as keyof T}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  renderStatus={statusCol?.render ? () => statusCol.render!(item) : undefined}
                  renderActions={actionCol?.render ? () => actionCol.render!(item) : undefined}
                />
              );
            })
          )}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`px-4 py-3 text-left text-sm font-medium ${
                      column.sortable ? "cursor-pointer hover:bg-gray-600" : ""
                    }`}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortKey === String(column.key) && (
                        <span className="text-green-400">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                processedData.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-t border-gray-700 ${
                      onRowClick
                        ? "hover:bg-gray-700/50 cursor-pointer transition-colors"
                        : ""
                    }`}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="px-4 py-3 text-sm"
                        style={{ width: column.width }}
                      >
                        {column.render
                          ? column.render(item)
                          : String(item[column.key as keyof T] || '')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Info */}
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400 text-center sm:text-left">
        Showing {processedData.length} of {data.length} entries
      </div>
    </div>
  );
}