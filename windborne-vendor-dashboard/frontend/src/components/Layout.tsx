import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Table } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-secondary-100 shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/windborne.svg"
                alt="WindBorne Systems"
                className="h-8 w-auto"
              />
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === "/"
                    ? "bg-primary-600 text-white"
                    : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-200"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/comparison"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === "/comparison"
                    ? "bg-primary-600 text-white"
                    : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-200"
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
      <footer className="bg-gray-900 border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white">
              © 2025 WindBorne Systems Vendor Health Dashboard
            </div>
            <div className="text-sm text-gray-300">
              Built with FastAPI + React + Alpha Vantage API
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
