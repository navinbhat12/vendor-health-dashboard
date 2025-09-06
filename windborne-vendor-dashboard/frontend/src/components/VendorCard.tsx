import { Link } from "react-router-dom";
import { AlertTriangle, Building } from "lucide-react";
import type { VendorSummary } from "../types/vendor";
import {
  formatCurrency,
  formatRatio,
  formatPercentageValue,
  formatDateTime,
  getMetricStatus,
  getStatusColor,
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
          <div className="flex items-center justify-center w-10 h-10 bg-primary-900 rounded-lg">
            <Building className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary-100">
              {vendor.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-primary-400">
                {vendor.ticker}
              </span>
              {vendor.sector && (
                <span className="text-sm text-secondary-400">
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

      {/* Financial Highlights */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="metric-label">Total Revenue</p>
          <p className="metric-value text-lg">
            {formatCurrency(vendor.total_revenue, true)}
          </p>
        </div>

        <div>
          <p className="metric-label">Net Income</p>
          <p className="metric-value text-lg">
            {formatCurrency(vendor.net_income, true)}
          </p>
        </div>

        <div>
          <p className="metric-label">Total Assets</p>
          <p className="metric-value text-lg">
            {formatCurrency(vendor.total_assets, true)}
          </p>
        </div>

        <div>
          <p className="metric-label">Market Cap</p>
          <p className="metric-value text-lg">
            {formatCurrency(vendor.market_cap, true)}
          </p>
        </div>
      </div>

      {/* Key Ratios */}
      <div className="border-t border-secondary-700 pt-4 mb-4">
        <h4 className="text-sm font-medium text-secondary-300 mb-3">
          Key Ratios
        </h4>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xs text-secondary-400 mb-1">Current Ratio</p>
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
            <p className="text-xs text-secondary-400 mb-1">Debt/Equity</p>
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
            <p className="text-xs text-secondary-400 mb-1">Quick Ratio</p>
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

      {/* Profitability Metrics */}
      <div className="border-t border-secondary-700 pt-4 mb-4">
        <h4 className="text-sm font-medium text-secondary-300 mb-3">
          Profitability & Growth
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-xs text-secondary-400 mb-1">Net Margin</p>
            <p className="text-sm font-semibold text-secondary-100">
              {formatPercentageValue(vendor.net_margin)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-secondary-400 mb-1">Operating Margin</p>
            <p className="text-sm font-semibold text-secondary-100">
              {formatPercentageValue(vendor.operating_margin)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-secondary-400 mb-1">Return on Equity</p>
            <p className="text-sm font-semibold text-secondary-100">
              {formatPercentageValue(vendor.return_on_equity)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-secondary-400 mb-1">Revenue CAGR (3Y)</p>
            <p className="text-sm font-semibold text-secondary-100">
              {formatPercentageValue(vendor.revenue_cagr_3y)}
            </p>
          </div>
        </div>
      </div>

      {/* Cash Quality Metrics */}
      <div className="border-t border-secondary-700 pt-4 mb-4">
        <h4 className="text-sm font-medium text-secondary-300 mb-3">
          Cash Quality
        </h4>

        <div className="grid grid-cols-1 gap-3">
          <div className="text-center">
            <p className="text-xs text-secondary-400 mb-1">OCF-to-Net Income</p>
            <p className="text-sm font-semibold text-secondary-100">
              {formatPercentageValue(vendor.ocf_to_net_income)}
            </p>
            {vendor.ocf_to_net_income && vendor.ocf_to_net_income > 100 && (
              <p className="text-xs text-green-600 mt-1">High Quality</p>
            )}
            {vendor.ocf_to_net_income && vendor.ocf_to_net_income < 80 && (
              <p className="text-xs text-orange-600 mt-1">Monitor</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-xs text-secondary-400 mb-1">Debt Ratio</p>
          <p className="font-medium text-secondary-100">
            {formatRatio(vendor.debt_ratio)}
          </p>
        </div>

        <div>
          <p className="text-xs text-secondary-400 mb-1">Current Liabilities</p>
          <p className="font-medium text-secondary-100">
            {formatCurrency(vendor.total_current_liabilities, true)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-secondary-700">
        <div className="text-xs text-secondary-400">
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
