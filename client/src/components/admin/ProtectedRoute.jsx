import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-DEFAULT flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader size={40} className="text-primary animate-spin" />
          <p className="text-gray-400">Memuat...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}
