import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';

export function BuyerSignUp() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/seller-signup'), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600">
          <Store className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">
            Buyer accounts coming soon
          </h1>
          <p className="text-sm text-surface-500">
            Buyers can shop as guests at checkout. Redirecting to Seller Signup...
          </p>
        </div>
        <Link
          to="/seller-signup"
          className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Go to Seller Signup
        </Link>
        <p>
          <Link to="/" className="text-sm text-primary-600 hover:text-primary-700">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}