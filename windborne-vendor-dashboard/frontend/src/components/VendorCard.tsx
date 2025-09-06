import { Link } from "react-router-dom";
import { AlertTriangle, Building } from "lucide-react";
import type { VendorSummary } from "../types/vendor";
import {
  formatCurrency,
  formatRatio,
  formatPercentage,
  formatDateTime,
  getMetricStatus,
  getStatusColor,
  getStatusBadgeClass,
} from "../utils/formatters";

interface VendorCardProps {
  vendor: VendorSummary;
  onRefresh?: (ticker: string) => void;
  isRefreshing?: boolean;
}

export default function VendorCard({
  vendor,
  onRefresh,
  isRefreshing,
}: VendorCardProps) {
  const hasFlags = vendor.liquidity_flag || vendor.leverage_flag;

  const currentRatioStatus = getMetricStatus(vendor.current_ratio, {
    good: 1.5,
    warning: 1.2,
  });
  const debtToEquityStatus = getMetricStatus(
    vendor.debt_to_equity,
    { good: 1.0, warning: 2.0 },
    true
  );
  const quickRatioStatus = getMetricStatus(vendor.quick_ratio, {
    good: 1.0,
    warning: 0.8,
  });

  return (
    <div className="metric-card group relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg">
            <Building className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">
              {vendor.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-primary-600">
                {vendor.ticker}
              </span>
              {vendor.sector && (
                <span className="text-sm text-secondary-500">
                  • {vendor.sector}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Flags */}
        {hasFlags && (
          <div className="flex items-center space-x-1">
            <AlertTriangle className="w-4 h-4 text-warning-500" />
            <span className="text-xs text-warning-600">Risk Flags</span>
          </div>
        )}
      </div>

      {/* Key Balance Sheet Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="metric-label">Total Assets</p>
          <p className="metric-value text-lg">
            {formatCurrency(vendor.total_assets, true)}
          </p>
        </div>

        <div>
          <p className="metric-label">Total Equity</p>
          <p className="metric-value text-lg">
            {formatCurrency(vendor.total_shareholder_equity, true)}
          </p>
        </div>

        <div>
          <p className="metric-label">Current Assets</p>
          <p className="metric-value text-lg">
            {formatCurrency(vendor.total_current_assets, true)}
          </p>
        </div>

        <div>
          <p className="metric-label">Cash & Equivalents</p>
          <p className="metric-value text-lg">
            {formatCurrency(vendor.cash_and_cash_equivalents, true)}
          </p>
        </div>
      </div>

      {/* Key Ratios */}
      <div className="border-t border-secondary-200 pt-4 mb-4">
        <h4 className="text-sm font-medium text-secondary-700 mb-3">
          Key Ratios
        </h4>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xs text-secondary-500 mb-1">Current Ratio</p>
            <p
              className={`text-sm font-semibold ${getStatusColor(
                currentRatioStatus
              )}`}
            >
              {formatRatio(vendor.current_ratio)}
            </p>
            {vendor.liquidity_flag && (
              <div className="mt-1">
                <span className="flag-danger text-xs">Low</span>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-secondary-500 mb-1">Debt/Equity</p>
            <p
              className={`text-sm font-semibold ${getStatusColor(
                debtToEquityStatus
              )}`}
            >
              {formatRatio(vendor.debt_to_equity)}
            </p>
            {vendor.leverage_flag && (
              <div className="mt-1">
                <span className="flag-danger text-xs">High</span>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-secondary-500 mb-1">Quick Ratio</p>
            <p
              className={`text-sm font-semibold ${getStatusColor(
                quickRatioStatus
              )}`}
            >
              {formatRatio(vendor.quick_ratio)}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Balance Sheet Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-xs text-secondary-500 mb-1">Debt Ratio</p>
          <p className="font-medium text-secondary-900">
            {formatRatio(vendor.debt_ratio)}
          </p>
        </div>

        <div>
          <p className="text-xs text-secondary-500 mb-1">Current Liabilities</p>
          <p className="font-medium text-secondary-900">
            {formatCurrency(vendor.total_current_liabilities, true)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
        <div className="text-xs text-secondary-500">
          Updated: {formatDateTime(vendor.last_updated)}
        </div>

        <div className="flex items-center space-x-2">
          {onRefresh && (
            <button
              onClick={() => onRefresh(vendor.ticker)}
              disabled={isRefreshing}
              className="btn btn-secondary text-xs px-2 py-1 disabled:opacity-50"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          )}

          <Link
            to={`/vendor/${vendor.ticker}`}
            className="btn btn-primary text-xs px-3 py-1"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
