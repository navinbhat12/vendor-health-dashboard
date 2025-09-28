import { useState } from "react";
import { Plus, Search, RefreshCw } from "lucide-react";

interface AddVendorCardProps {
  onAddVendor: (ticker: string) => Promise<void>;
  isLoading?: boolean;
}

export default function AddVendorCard({
  onAddVendor,
  isLoading,
}: AddVendorCardProps) {
  const [ticker, setTicker] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      await onAddVendor(ticker.trim().toUpperCase());
      setTicker("");
      setShowInput(false);
    }
  };

  const handleCancel = () => {
    setTicker("");
    setShowInput(false);
  };

  if (showInput) {
    return (
      <div className="metric-card group relative min-h-[600px] flex flex-col justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-primary-900 rounded-full mx-auto mb-6">
            <Search className="w-8 h-8 text-primary-400" />
          </div>

          <h3 className="text-xl font-semibold text-secondary-100 mb-2">
            Add New Vendor
          </h3>

          <p className="text-sm text-secondary-400 mb-6">
            Enter a stock ticker symbol to analyze
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="Enter ticker (e.g., AAPL, MSFT, IBM)"
                className="input w-full text-center text-lg font-medium"
                maxLength={10}
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={!ticker.trim() || isLoading}
                className="btn btn-primary flex-1"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Analyze
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>

          {isLoading && (
            <div className="mt-6 p-4 bg-secondary-700 rounded-lg">
              <p className="text-sm text-secondary-300">
                Analyzing financial data and calculating metrics...
              </p>
              <p className="text-xs text-secondary-400 mt-1">
                This typically takes 30-60 seconds due to API rate limits
              </p>
              <p className="text-xs text-secondary-500 mt-1">
                Please wait while we fetch balance sheet, income statement, and
                cash flow data
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="metric-card group relative min-h-[600px] flex flex-col justify-center border-2 border-dashed border-secondary-600 hover:border-primary-500 transition-colors cursor-pointer">
      <button
        onClick={() => setShowInput(true)}
        className="w-full h-full flex flex-col items-center justify-center text-center p-6 hover:bg-secondary-700 transition-colors rounded-lg"
      >
        <div className="flex items-center justify-center w-16 h-16 bg-secondary-700 rounded-full mb-6 group-hover:bg-primary-900 transition-colors">
          <Plus className="w-8 h-8 text-secondary-400 group-hover:text-primary-400 transition-colors" />
        </div>

        <h3 className="text-xl font-semibold text-secondary-300 mb-2 group-hover:text-secondary-100 transition-colors">
          Add New Vendor
        </h3>

        <p className="text-sm text-secondary-500 group-hover:text-secondary-300 transition-colors">
          Click to analyze any stock ticker
        </p>

        <div className="mt-6 text-xs text-secondary-600 group-hover:text-secondary-400 transition-colors">
          Examples: AAPL, MSFT, IBM, GOOGL
        </div>
      </button>
    </div>
  );
}
