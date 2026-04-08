import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ChatRedirect() {
  const { roomId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    // Redirect to the role-specific message page with the room ID
    const base = user.role === 'FREELANCER' ? '/freelancer' : '/client';
    navigate(`${base}/messages?room=${roomId}`, { replace: true });
  }, [roomId, user, isAuthenticated, navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
