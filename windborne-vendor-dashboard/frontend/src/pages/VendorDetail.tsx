import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { vendorApi } from "../services/api";
import type { VendorSummary } from "../types/vendor";

export default function VendorDetail() {
  const { ticker } = useParams<{ ticker: string }>();
  const [summary, setSummary] = useState<VendorSummary | null>(null);
  // const [trends, setTrends] = useState<VendorTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVendorData = async () => {
    if (!ticker) return;

    try {
      setLoading(true);
      const summaryData = await vendorApi.getVendorSummary(ticker);
      setSummary(summaryData);
      setError(null);
    } catch (err) {
      console.error("Failed to load vendor data:", err);
      setError("Failed to load vendor data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, [ticker]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
        <p className="text-secondary-600">Loading vendor details...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="text-center py-12">
        <div className="card p-8 max-w-md mx-auto">
          <p className="text-danger-400 mb-4">{error || "Vendor not found"}</p>
          <div className="space-y-3">
            <button onClick={loadVendorData} className="btn btn-primary w-full">
              Try Again
            </button>
            <Link to="/" className="btn btn-secondary w-full">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-secondary-100">
              {summary.name}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-lg font-medium text-primary-400">
                {summary.ticker}
              </span>
              {summary.sector && (
                <span className="text-secondary-400">• {summary.sector}</span>
              )}
            </div>
          </div>
        </div>

        <button onClick={loadVendorData} className="btn btn-primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </button>
      </div>

      {/* Coming Soon Notice */}
      <div className="card p-8 text-center">
        <h2 className="text-xl font-semibold text-secondary-100 mb-4">
          Detailed Analysis Coming Soon
        </h2>
        <p className="text-secondary-300 mb-6">
          This page will feature comprehensive financial analysis including:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="space-y-2">
            <h3 className="font-medium text-secondary-300">Financial Charts</h3>
            <ul className="text-sm text-secondary-400 space-y-1">
              <li>• Revenue & Income Trends</li>
              <li>• Cash Flow Analysis</li>
              <li>• Ratio Comparisons</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-secondary-300">Detailed Metrics</h3>
            <ul className="text-sm text-secondary-400 space-y-1">
              <li>• 5-Year Historical Data</li>
              <li>• Quarterly Breakdowns</li>
              <li>• Peer Comparisons</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-secondary-300">Risk Analysis</h3>
            <ul className="text-sm text-secondary-400 space-y-1">
              <li>• Liquidity Assessment</li>
              <li>• Leverage Analysis</li>
              <li>• Profitability Trends</li>
            </ul>
          </div>
        </div>

        <Link to="/" className="btn btn-primary mt-6">
          Return to Dashboard
        </Link>
      </div>

      {/* Current Summary Data */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-secondary-100 mb-4">
          Current Summary
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-secondary-400">Total Revenue</p>
            <p className="text-lg font-semibold text-secondary-100">
              {summary.total_revenue
                ? `$${(summary.total_revenue / 1e9).toFixed(1)}B`
                : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-secondary-400">Net Income</p>
            <p className="text-lg font-semibold text-secondary-100">
              {summary.net_income
                ? `$${(summary.net_income / 1e9).toFixed(1)}B`
                : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-secondary-400">Current Ratio</p>
            <p className="text-lg font-semibold text-secondary-100">
              {summary.current_ratio?.toFixed(2) || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-secondary-400">Net Margin</p>
            <p className="text-lg font-semibold text-secondary-100">
              {summary.net_margin ? `${summary.net_margin.toFixed(1)}%` : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
