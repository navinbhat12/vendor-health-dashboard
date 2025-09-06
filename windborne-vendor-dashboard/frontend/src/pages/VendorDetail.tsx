import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Building, ExternalLink } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { vendorApi } from "../services/api";
import type {
  VendorSummary,
  VendorTrends,
  CompanyOverview,
} from "../types/vendor";
import {
  formatCurrency,
  formatPercentageValue,
  formatNumber,
} from "../utils/formatters";

export default function VendorDetail() {
  const { ticker } = useParams<{ ticker: string }>();
  const [summary, setSummary] = useState<VendorSummary | null>(null);
  const [trends, setTrends] = useState<VendorTrends | null>(null);
  const [overview, setOverview] = useState<CompanyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVendorData = async () => {
    if (!ticker) return;

    try {
      setLoading(true);
      setError(null);

      // Load all vendor data in parallel
      const [summaryData, trendsData, overviewData] = await Promise.allSettled([
        vendorApi.getVendorSummary(ticker),
        vendorApi.getVendorTrends(ticker),
        vendorApi.getVendorOverview(ticker),
      ]);

      if (summaryData.status === "fulfilled") {
        setSummary(summaryData.value);
      }

      if (trendsData.status === "fulfilled") {
        setTrends(trendsData.value);
      }

      if (overviewData.status === "fulfilled") {
        setOverview(overviewData.value);
      }
    } catch (err) {
      console.error("Failed to load vendor data:", err);
      setError("Failed to load vendor data");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (!ticker) return;

    try {
      await vendorApi.refreshVendorData(ticker);
      // Wait a bit then reload
      setTimeout(() => {
        loadVendorData();
      }, 2000);
    } catch (err) {
      console.error("Failed to refresh vendor data:", err);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, [ticker]);

  // Format chart data
  const chartData =
    trends?.trends.map((point) => ({
      year: point.fiscal_year,
      revenue: point.total_revenue ? point.total_revenue / 1000000000 : 0, // Convert to billions
      netIncome: point.net_income ? point.net_income / 1000000000 : 0, // Convert to billions
    })) || [];

  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-400" />
        <p className="text-secondary-400">Loading vendor details...</p>
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

  if (!summary) {
    return (
      <div className="text-center py-12">
        <div className="card p-8 max-w-md mx-auto">
          <p className="text-secondary-400 mb-4">Vendor not found</p>
          <Link to="/" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="flex items-center space-x-2 text-secondary-400 hover:text-secondary-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <button onClick={refreshData} className="btn btn-secondary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </button>
      </div>

      {/* Company Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-900 rounded-lg flex items-center justify-center">
              <Building className="w-8 h-8 text-primary-200" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-secondary-100">
                {overview?.Name || summary.name}
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-lg text-secondary-300">
                  {summary.ticker}
                </span>
                {overview?.Exchange && (
                  <span className="px-2 py-1 bg-secondary-700 text-secondary-300 rounded text-sm">
                    {overview.Exchange}
                  </span>
                )}
                {overview?.Sector && (
                  <span className="px-2 py-1 bg-primary-900 text-primary-200 rounded text-sm">
                    {overview.Sector}
                  </span>
                )}
              </div>
            </div>
          </div>

          {overview?.MarketCapitalization && (
            <div className="text-right">
              <p className="text-sm text-secondary-400">Market Cap</p>
              <p className="text-xl font-semibold text-secondary-100">
                {formatCurrency(parseInt(overview.MarketCapitalization))}
              </p>
            </div>
          )}
        </div>

        {/* Company Description */}
        {overview?.Description && (
          <div className="mt-6 pt-6 border-t border-secondary-700">
            <h3 className="text-lg font-semibold text-secondary-100 mb-3">
              About
            </h3>
            <p className="text-secondary-300 leading-relaxed">
              {overview.Description}
            </p>
          </div>
        )}
      </div>

      {/* Financial Trends Chart */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-secondary-100 mb-6">
          Revenue & Net Income Trends
        </h2>

        {chartData.length > 0 ? (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9CA3AF" fontSize={12} />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toFixed(1)}B`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F3F4F6",
                  }}
                  formatter={(value: number, name: string) => {
                    const displayName =
                      name === "revenue"
                        ? "Revenue"
                        : name === "netIncome"
                        ? "Net Income"
                        : name === "Net Income"
                        ? "Net Income"
                        : name === "Revenue"
                        ? "Revenue"
                        : name;
                    return [`$${value.toFixed(1)}B`, displayName];
                  }}
                  labelFormatter={(label) => `Year: ${label}`}
                />
                <Legend wrapperStyle={{ color: "#F3F4F6" }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="netIncome"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  name="Net Income"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-secondary-400">
              No historical data available for charts
            </p>
          </div>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Financials */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-100 mb-4">
            Current Year
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-secondary-400">Revenue</p>
              <p className="text-xl font-semibold text-secondary-100">
                {summary.total_revenue
                  ? formatCurrency(summary.total_revenue)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-400">Net Income</p>
              <p className="text-xl font-semibold text-secondary-100">
                {summary.net_income
                  ? formatCurrency(summary.net_income)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-400">Operating Income</p>
              <p className="text-xl font-semibold text-secondary-100">
                {summary.operating_income
                  ? formatCurrency(summary.operating_income)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Profitability Metrics */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-100 mb-4">
            Profitability
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-secondary-400">Net Margin</p>
              <p className="text-xl font-semibold text-secondary-100">
                {summary.net_margin
                  ? formatPercentageValue(summary.net_margin)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-400">Operating Margin</p>
              <p className="text-xl font-semibold text-secondary-100">
                {summary.operating_margin
                  ? formatPercentageValue(summary.operating_margin)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-400">Return on Equity</p>
              <p className="text-xl font-semibold text-secondary-100">
                {summary.return_on_equity
                  ? formatPercentageValue(summary.return_on_equity)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Liquidity & Leverage */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-100 mb-4">
            Financial Health
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-secondary-400">Current Ratio</p>
              <p className="text-xl font-semibold text-secondary-100">
                {summary.current_ratio
                  ? formatNumber(summary.current_ratio, 2)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-400">Debt-to-Equity</p>
              <p className="text-xl font-semibold text-secondary-100">
                {summary.debt_to_equity
                  ? formatNumber(summary.debt_to_equity, 2)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-400">Quick Ratio</p>
              <p className="text-xl font-semibold text-secondary-100">
                {summary.quick_ratio
                  ? formatNumber(summary.quick_ratio, 2)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Market Data */}
        {overview && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-100 mb-4">
              Market Data
            </h3>
            <div className="space-y-3">
              {overview.PERatio && (
                <div>
                  <p className="text-sm text-secondary-400">P/E Ratio</p>
                  <p className="text-xl font-semibold text-secondary-100">
                    {formatNumber(parseFloat(overview.PERatio), 2)}
                  </p>
                </div>
              )}
              {overview.DividendYield && (
                <div>
                  <p className="text-sm text-secondary-400">Dividend Yield</p>
                  <p className="text-xl font-semibold text-secondary-100">
                    {formatPercentageValue(
                      parseFloat(overview.DividendYield) * 100
                    )}
                  </p>
                </div>
              )}
              {overview["52WeekHigh"] && overview["52WeekLow"] && (
                <div>
                  <p className="text-sm text-secondary-400">52W Range</p>
                  <p className="text-sm font-semibold text-secondary-100">
                    ${overview["52WeekLow"]} - ${overview["52WeekHigh"]}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Balance Sheet Overview */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-secondary-100 mb-6">
          Balance Sheet Highlights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-secondary-400 mb-1">Total Assets</p>
            <p className="text-2xl font-bold text-secondary-100">
              {summary.total_assets
                ? formatCurrency(summary.total_assets)
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-secondary-400 mb-1">
              Shareholder Equity
            </p>
            <p className="text-2xl font-bold text-secondary-100">
              {summary.total_shareholder_equity
                ? formatCurrency(summary.total_shareholder_equity)
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-secondary-400 mb-1">Current Assets</p>
            <p className="text-2xl font-bold text-secondary-100">
              {summary.total_current_assets
                ? formatCurrency(summary.total_current_assets)
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-secondary-400 mb-1">
              Current Liabilities
            </p>
            <p className="text-2xl font-bold text-secondary-100">
              {summary.total_current_liabilities
                ? formatCurrency(summary.total_current_liabilities)
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
