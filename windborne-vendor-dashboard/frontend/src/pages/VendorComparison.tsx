import React, { useState, useEffect } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  RefreshCw,
  X,
} from "lucide-react";
import { vendorApi } from "../services/api";
import type { VendorSummary } from "../types/vendor";
import { formatPercentageValue, formatNumber } from "../utils/formatters";
import { useDynamicVendors } from "../contexts/DynamicVendorsContext";

type SortDirection = "asc" | "desc" | null;
type SortableField = keyof VendorSummary;

interface SortConfig {
  field: SortableField | null;
  direction: SortDirection;
}

const VendorComparison: React.FC = () => {
  const [vendors, setVendors] = useState<VendorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: null,
  });
  const { dynamicVendors, removeDynamicVendor } = useDynamicVendors();

  useEffect(() => {
    loadVendorData();
  }, []);

  // Reload data when dynamic vendors change
  useEffect(() => {
    if (dynamicVendors.length > 0 || vendors.length > 0) {
      loadVendorData();
    }
  }, [dynamicVendors]);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      setError(null);
      const comparison = await vendorApi.getVendorComparison();
      // Combine main vendors with dynamic vendors
      setVendors([...comparison.vendors, ...dynamicVendors]);
    } catch (err) {
      console.error("Failed to load vendor comparison:", err);
      setError("Failed to load vendor data");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortableField) => {
    let direction: SortDirection = "asc";

    if (sortConfig.field === field) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = null;
      } else {
        direction = "asc";
      }
    }

    setSortConfig({ field, direction });
  };

  const sortedVendors = React.useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction) {
      return vendors;
    }

    return [...vendors].sort((a, b) => {
      const aValue = a[sortConfig.field!];
      const bValue = b[sortConfig.field!];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      if (bValue === null || bValue === undefined) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }

      // Compare values
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      // String comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortConfig.direction === "asc") {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [vendors, sortConfig]);

  const getSortIcon = (field: SortableField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="w-4 h-4 text-secondary-400" />;
    }

    if (sortConfig.direction === "asc") {
      return <ArrowUp className="w-4 h-4 text-primary-400" />;
    } else if (sortConfig.direction === "desc") {
      return <ArrowDown className="w-4 h-4 text-primary-400" />;
    } else {
      return <ArrowUpDown className="w-4 h-4 text-secondary-400" />;
    }
  };

  const exportToCSV = () => {
    if (vendors.length === 0) return;

    // Define headers with readable names
    const headers = [
      "Ticker",
      "Company Name",
      "Sector",
      "Revenue ($B)",
      "Net Income ($B)",
      "Total Assets ($B)",
      "Market Cap ($B)",
      "Current Ratio",
      "Quick Ratio",
      "Debt-to-Equity",
      "Debt Ratio",
      "Net Margin (%)",
      "Operating Margin (%)",
      "Return on Equity (%)",
      "Revenue CAGR 3Y (%)",
      "OCF-to-Net Income (%)",
    ];

    // Convert vendor data to CSV rows
    const csvData = vendors.map((vendor) => [
      vendor.ticker,
      vendor.name,
      vendor.sector || "N/A",
      vendor.total_revenue ? (vendor.total_revenue / 1e9).toFixed(1) : "N/A",
      vendor.net_income ? (vendor.net_income / 1e9).toFixed(1) : "N/A",
      vendor.total_assets ? (vendor.total_assets / 1e9).toFixed(1) : "N/A",
      vendor.market_cap ? (vendor.market_cap / 1e9).toFixed(1) : "N/A",
      vendor.current_ratio ? vendor.current_ratio.toFixed(2) : "N/A",
      vendor.quick_ratio ? vendor.quick_ratio.toFixed(2) : "N/A",
      vendor.debt_to_equity ? vendor.debt_to_equity.toFixed(2) : "N/A",
      vendor.debt_ratio ? vendor.debt_ratio.toFixed(2) : "N/A",
      vendor.net_margin ? vendor.net_margin.toFixed(1) : "N/A",
      vendor.operating_margin ? vendor.operating_margin.toFixed(1) : "N/A",
      vendor.return_on_equity ? vendor.return_on_equity.toFixed(1) : "N/A",
      vendor.revenue_cagr_3y ? vendor.revenue_cagr_3y.toFixed(1) : "N/A",
      vendor.ocf_to_net_income ? vendor.ocf_to_net_income.toFixed(1) : "N/A",
    ]);

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `windborne-vendor-comparison-${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortableHeader: React.FC<{
    field: SortableField;
    label: string;
    className?: string;
  }> = ({ field, label, className = "" }) => (
    <th
      className={`px-4 py-3 text-left cursor-pointer hover:bg-secondary-700 transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-secondary-200">{label}</span>
        {getSortIcon(field)}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-400" />
        <p className="text-secondary-400">Loading vendor comparison...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="card p-8 max-w-md mx-auto">
          <p className="text-danger-400 mb-4">{error}</p>
          <button onClick={loadVendorData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-100">
            Vendor Comparison
          </h1>
          <p className="text-secondary-400 mt-1">
            Side-by-side financial analysis of all vendors
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="btn btn-primary px-6 py-3"
          disabled={loading || vendors.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Comparison Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-800 border-b border-secondary-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <span className="text-sm font-medium text-secondary-200">
                    Company
                  </span>
                </th>

                {/* Company Info */}
                <SortableHeader field="sector" label="Sector" />

                {/* Liquidity Metrics */}
                <th
                  colSpan={2}
                  className="px-4 py-2 text-center border-b border-secondary-600 bg-blue-900/20"
                >
                  <span className="text-sm font-semibold text-blue-300">
                    Liquidity
                  </span>
                </th>

                {/* Leverage Metrics */}
                <th
                  colSpan={2}
                  className="px-4 py-2 text-center border-b border-secondary-600 bg-orange-900/20"
                >
                  <span className="text-sm font-semibold text-orange-300">
                    Leverage
                  </span>
                </th>

                {/* Profitability Metrics */}
                <th
                  colSpan={4}
                  className="px-4 py-2 text-center border-b border-secondary-600 bg-green-900/20"
                >
                  <span className="text-sm font-semibold text-green-300">
                    Profitability
                  </span>
                </th>

                {/* Cash Quality */}
                <th className="px-4 py-2 text-center border-b border-secondary-600 bg-purple-900/20">
                  <span className="text-sm font-semibold text-purple-300">
                    Cash Quality
                  </span>
                </th>
              </tr>

              <tr className="bg-secondary-750 border-b border-secondary-600">
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3"></th>

                {/* Liquidity Subheaders */}
                <SortableHeader
                  field="current_ratio"
                  label="Current Ratio"
                  className="bg-blue-900/10"
                />
                <SortableHeader
                  field="quick_ratio"
                  label="Quick Ratio"
                  className="bg-blue-900/10"
                />

                {/* Leverage Subheaders */}
                <SortableHeader
                  field="debt_to_equity"
                  label="Debt/Equity"
                  className="bg-orange-900/10"
                />
                <SortableHeader
                  field="debt_ratio"
                  label="Debt Ratio"
                  className="bg-orange-900/10"
                />

                {/* Profitability Subheaders */}
                <SortableHeader
                  field="net_margin"
                  label="Net Margin %"
                  className="bg-green-900/10"
                />
                <SortableHeader
                  field="operating_margin"
                  label="Operating Margin %"
                  className="bg-green-900/10"
                />
                <SortableHeader
                  field="return_on_equity"
                  label="ROE %"
                  className="bg-green-900/10"
                />
                <SortableHeader
                  field="revenue_cagr_3y"
                  label="3Y Revenue CAGR %"
                  className="bg-green-900/10"
                />

                {/* Cash Quality Subheader */}
                <SortableHeader
                  field="ocf_to_net_income"
                  label="OCF/NI %"
                  className="bg-purple-900/10"
                />
              </tr>
            </thead>

            <tbody className="divide-y divide-secondary-700">
              {sortedVendors.map((vendor) => (
                <tr
                  key={vendor.ticker}
                  className="hover:bg-secondary-750 transition-colors"
                >
                  {/* Company Info */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-secondary-100">
                          {vendor.name}
                        </div>
                        <div className="text-sm text-secondary-400">
                          {vendor.ticker}
                        </div>
                      </div>
                      {dynamicVendors.some(
                        (dv) => dv.ticker === vendor.ticker
                      ) && (
                        <button
                          onClick={() => removeDynamicVendor(vendor.ticker)}
                          className="p-1 text-secondary-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors ml-2"
                          title="Remove vendor"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm text-secondary-300">
                    {vendor.sector || "N/A"}
                  </td>

                  {/* Liquidity Metrics */}
                  <td className="px-4 py-4 text-sm text-secondary-200 bg-blue-900/5">
                    {vendor.current_ratio
                      ? formatNumber(vendor.current_ratio, 2)
                      : "N/A"}
                  </td>
                  <td className="px-4 py-4 text-sm text-secondary-200 bg-blue-900/5">
                    {vendor.quick_ratio
                      ? formatNumber(vendor.quick_ratio, 2)
                      : "N/A"}
                  </td>

                  {/* Leverage Metrics */}
                  <td className="px-4 py-4 text-sm text-secondary-200 bg-orange-900/5">
                    {vendor.debt_to_equity
                      ? formatNumber(vendor.debt_to_equity, 2)
                      : "N/A"}
                  </td>
                  <td className="px-4 py-4 text-sm text-secondary-200 bg-orange-900/5">
                    {vendor.debt_ratio
                      ? formatNumber(vendor.debt_ratio, 2)
                      : "N/A"}
                  </td>

                  {/* Profitability Metrics */}
                  <td className="px-4 py-4 text-sm text-secondary-200 bg-green-900/5">
                    {vendor.net_margin
                      ? formatPercentageValue(vendor.net_margin)
                      : "N/A"}
                  </td>
                  <td className="px-4 py-4 text-sm text-secondary-200 bg-green-900/5">
                    {vendor.operating_margin
                      ? formatPercentageValue(vendor.operating_margin)
                      : "N/A"}
                  </td>
                  <td className="px-4 py-4 text-sm text-secondary-200 bg-green-900/5">
                    {vendor.return_on_equity
                      ? formatPercentageValue(vendor.return_on_equity)
                      : "N/A"}
                  </td>
                  <td className="px-4 py-4 text-sm text-secondary-200 bg-green-900/5">
                    {vendor.revenue_cagr_3y
                      ? formatPercentageValue(vendor.revenue_cagr_3y)
                      : "N/A"}
                  </td>

                  {/* Cash Quality */}
                  <td className="px-4 py-4 text-sm text-secondary-200 bg-purple-900/5">
                    {vendor.ocf_to_net_income
                      ? formatPercentageValue(vendor.ocf_to_net_income)
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-secondary-100 mb-4">
          Metric Categories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-300">Liquidity</h4>
            <p className="text-sm text-secondary-400">
              Measures ability to meet short-term obligations
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-orange-300">Leverage</h4>
            <p className="text-sm text-secondary-400">
              Measures debt levels and financial risk
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-green-300">Profitability</h4>
            <p className="text-sm text-secondary-400">
              Measures operational efficiency and returns
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-purple-300">Cash Quality</h4>
            <p className="text-sm text-secondary-400">
              Measures quality of earnings and cash flow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorComparison;
