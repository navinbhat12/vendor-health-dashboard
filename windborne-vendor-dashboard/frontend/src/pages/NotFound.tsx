import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <div className="card p-8 max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-secondary-300 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
          Page Not Found
        </h2>
        <p className="text-secondary-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link to="/" className="btn btn-primary">
          <Home className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
