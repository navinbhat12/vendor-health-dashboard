import { useState, useEffect } from "react";
import { RefreshCw, Download } from "lucide-react";
import VendorCard from "../components/VendorCard";
import AddVendorCard from "../components/AddVendorCard";
import { vendorApi } from "../services/api";
import type { VendorComparison, VendorSummary } from "../types/vendor";

export default function Dashboard() {
  const [comparison, setComparison] = useState<VendorComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dynamicVendors, setDynamicVendors] = useState<VendorSummary[]>([]);
  const [addingVendor, setAddingVendor] = useState(false);

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

  const handleAddVendor = async (ticker: string) => {
    try {
      setAddingVendor(true);

      // First, refresh the vendor data (this will create the vendor if it doesn't exist)
      await vendorApi.refreshVendorData(ticker);

      // Poll for vendor data until it's ready (with financial metrics)
      let vendorSummary;
      let attempts = 0;
      const maxAttempts = 20; // Maximum 2 minutes of polling

      do {
        await new Promise((resolve) => setTimeout(resolve, 6000)); // Wait 6 seconds between attempts
        attempts++;

        try {
          vendorSummary = await vendorApi.getVendorSummary(ticker);

          // Check if we have some key financial data (not all null)
          const hasFinancialData =
            vendorSummary.total_assets !== null ||
            vendorSummary.total_revenue !== null ||
            vendorSummary.net_margin !== null ||
            vendorSummary.current_ratio !== null;

          if (hasFinancialData) {
            console.log(
              `✅ Financial data ready for ${ticker} after ${attempts} attempts`
            );
            break; // Data is ready!
          } else {
            console.log(
              `⏳ Attempt ${attempts}/${maxAttempts}: Still processing ${ticker}...`
            );
          }
        } catch (error) {
          console.log(
            `⏳ Attempt ${attempts}/${maxAttempts}: API call failed, retrying...`
          );
        }
      } while (attempts < maxAttempts);

      if (!vendorSummary) {
        // As a last resort, try to get whatever data is available
        try {
          vendorSummary = await vendorApi.getVendorSummary(ticker);
          console.log(`📋 Retrieved partial data for ${ticker} after timeout`);
        } catch (error) {
          throw new Error("Failed to fetch vendor data after polling");
        }
      }

      // Add to dynamic vendors list
      setDynamicVendors((prev) => {
        // Remove if already exists (in case of refresh)
        const filtered = prev.filter((v) => v.ticker !== ticker);
        return [...filtered, vendorSummary];
      });
    } catch (err) {
      console.error(`Failed to add vendor ${ticker}:`, err);
      // For now, just alert the user - in a real app you'd want a proper notification system
      alert(
        `Failed to add vendor ${ticker}. This might take up to 2 minutes due to API rate limits. Please check the console for details and try again later.`
      );
    } finally {
      setAddingVendor(false);
    }
  };

  const handleRemoveDynamicVendor = (ticker: string) => {
    setDynamicVendors((prev) => prev.filter((v) => v.ticker !== ticker));
  };

  useEffect(() => {
    loadComparison();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-400" />
        <p className="text-secondary-400">Loading vendor data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="card p-8 max-w-md mx-auto">
          <p className="text-danger-400 mb-4">{error}</p>
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
          <h1 className="text-3xl font-bold text-secondary-100">
            Vendor Health Dashboard
          </h1>
          <p className="text-secondary-400 mt-1">
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
          {/* Target Vendors */}
          {comparison.vendors.map((vendor) => (
            <VendorCard
              key={vendor.ticker}
              vendor={vendor}
              onRefresh={handleRefreshVendor}
              isRefreshing={refreshing === vendor.ticker}
            />
          ))}

          {/* Dynamic Vendors */}
          {dynamicVendors.map((vendor) => (
            <VendorCard
              key={`dynamic-${vendor.ticker}`}
              vendor={vendor}
              onRefresh={handleRefreshVendor}
              isRefreshing={refreshing === vendor.ticker}
            />
          ))}

          {/* Add Vendor Card */}
          <AddVendorCard
            onAddVendor={handleAddVendor}
            isLoading={addingVendor}
          />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-center py-12">
            <div className="card p-8 max-w-md mx-auto">
              <p className="text-secondary-400 mb-4">
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

          {/* Show Add Vendor Card even when no vendors are loaded */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AddVendorCard
              onAddVendor={handleAddVendor}
              isLoading={addingVendor}
            />

            {/* Dynamic Vendors */}
            {dynamicVendors.map((vendor) => (
              <VendorCard
                key={`dynamic-${vendor.ticker}`}
                vendor={vendor}
                onRefresh={handleRefreshVendor}
                isRefreshing={refreshing === vendor.ticker}
              />
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-secondary-100 mb-4">
          Target Vendors for WindBorne Systems
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-secondary-200 mb-2">Sensors</h3>
            <ul className="space-y-1 text-sm text-secondary-300">
              <li>• TE Connectivity (TEL) - Electronic Components</li>
              <li>• Sensata Technologies (ST) - Electronic Components</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-secondary-200 mb-2">
              Plastics / Materials
            </h3>
            <ul className="space-y-1 text-sm text-secondary-300">
              <li>• DuPont de Nemours (DD) - Chemicals</li>
              <li>• Celanese (CE) - Chemicals</li>
              <li>• LyondellBasell (LYB) - Chemicals</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-4 bg-secondary-800 rounded-lg border border-secondary-700">
          <h4 className="font-medium text-secondary-200 mb-2">
            Key Metrics Tracked
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-secondary-300">
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
