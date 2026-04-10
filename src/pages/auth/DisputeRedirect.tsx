import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DisputeRedirect() {
  const { disputeId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    // Redirect based on role
    if (user.role === 'ADMIN') {
      // Admins go to the modern dispute detail page
      navigate(`/admin/disputes/${disputeId}`, { replace: true });
    } else {
      // Clients and Freelancers go to their contracts hub with the disputed tab active
      const base = user.role === 'FREELANCER' ? '/freelancer' : '/client';
      navigate(`${base}/contracts?tab=disputed`, { replace: true });
    }
  }, [disputeId, user, isAuthenticated, navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
