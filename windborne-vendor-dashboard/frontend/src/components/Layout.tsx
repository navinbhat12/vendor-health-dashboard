import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Building2, BarChart3, Table } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-secondary-900">
      {/* Header */}
      <header className="bg-secondary-800 shadow-sm border-b border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-secondary-100">
                  WindBorne Systems
                </h1>
                <p className="text-sm text-secondary-400">
                  Vendor Health Dashboard
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === "/"
                    ? "bg-primary-900 text-primary-200"
                    : "text-secondary-400 hover:text-secondary-100 hover:bg-secondary-700"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/comparison"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === "/comparison"
                    ? "bg-primary-900 text-primary-200"
                    : "text-secondary-400 hover:text-secondary-100 hover:bg-secondary-700"
                }`}
              >
                <Table className="w-4 h-4" />
                <span>Comparison</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-secondary-800 border-t border-secondary-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-secondary-400">
              © 2025 WindBorne Systems Vendor Health Dashboard
            </div>
            <div className="text-sm text-secondary-500">
              Built with FastAPI + React + Alpha Vantage API
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
