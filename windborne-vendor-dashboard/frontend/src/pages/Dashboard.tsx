import { useState, useEffect } from "react";
import { RefreshCw, Download } from "lucide-react";
import VendorCard from "../components/VendorCard";
import { vendorApi } from "../services/api";
import type { VendorComparison } from "../types/vendor";

export default function Dashboard() {
  const [comparison, setComparison] = useState<VendorComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadComparison = async () => {
    try {
      setLoading(true);
      const data = await vendorApi.getVendorComparison();
      setComparison(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load vendor comparison:", err);
      setError(
        "Failed to load vendor data. Please check if the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshVendor = async (ticker: string) => {
    try {
      setRefreshing(ticker);
      await vendorApi.refreshVendorData(ticker);
      // Reload comparison data after refresh
      setTimeout(() => {
        loadComparison();
        setRefreshing(null);
      }, 2000); // Give some time for background processing
    } catch (err) {
      console.error(`Failed to refresh ${ticker}:`, err);
      setRefreshing(null);
    }
  };

  const handleInitializeVendors = async () => {
    try {
      setLoading(true);
      await vendorApi.initializeVendors();
      // Wait a bit longer for initial data fetch
      setTimeout(() => {
        loadComparison();
      }, 5000);
    } catch (err) {
      console.error("Failed to initialize vendors:", err);
      setError("Failed to initialize vendors");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparison();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
        <p className="text-secondary-600">Loading vendor data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="card p-8 max-w-md mx-auto">
          <p className="text-danger-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button onClick={loadComparison} className="btn btn-primary w-full">
              Try Again
            </button>
            <button
              onClick={handleInitializeVendors}
              className="btn btn-secondary w-full"
            >
              Initialize Target Vendors
            </button>
          </div>
          <p className="text-sm text-secondary-500 mt-4">
            Make sure the backend is running on port 8000 and your Alpha Vantage
            API key is configured.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Vendor Health Dashboard
          </h1>
          <p className="text-secondary-600 mt-1">
            Financial analysis of potential WindBorne Systems vendors
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadComparison}
            className="btn btn-secondary"
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh All
          </button>

          <button
            onClick={() => {
              /* TODO: Implement CSV export */
            }}
            className="btn btn-primary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      {comparison && comparison.vendors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comparison.vendors.map((vendor) => (
            <VendorCard
              key={vendor.ticker}
              vendor={vendor}
              onRefresh={handleRefreshVendor}
              isRefreshing={refreshing === vendor.ticker}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="card p-8 max-w-md mx-auto">
            <p className="text-secondary-600 mb-4">
              No vendor data available. Initialize the target vendors to get
              started.
            </p>
            <button
              onClick={handleInitializeVendors}
              className="btn btn-primary w-full"
            >
              Initialize Target Vendors
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          Target Vendors for WindBorne Systems
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-secondary-700 mb-2">Sensors</h3>
            <ul className="space-y-1 text-sm text-secondary-600">
              <li>• TE Connectivity (TEL) - Electronic Components</li>
              <li>• Sensata Technologies (ST) - Electronic Components</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-secondary-700 mb-2">
              Plastics / Materials
            </h3>
            <ul className="space-y-1 text-sm text-secondary-600">
              <li>• DuPont de Nemours (DD) - Chemicals</li>
              <li>• Celanese (CE) - Chemicals</li>
              <li>• LyondellBasell (LYB) - Chemicals</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
          <h4 className="font-medium text-secondary-700 mb-2">
            Key Metrics Tracked
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-secondary-600">
            <div>
              <strong>Liquidity:</strong> Current Ratio
            </div>
            <div>
              <strong>Leverage:</strong> Debt-to-Equity
            </div>
            <div>
              <strong>Profitability:</strong> Net Margin, 3Y Revenue CAGR
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
