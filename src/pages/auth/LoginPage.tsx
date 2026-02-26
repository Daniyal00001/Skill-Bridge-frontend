import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, ArrowLeft, Loader2, Mail, Lock as LockIcon, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo/logo.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/client');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'client' | 'freelancer' | 'admin') => {
    setIsLoading(true);
    try {
      await login('demo@example.com', 'password', role);
      toast({
        title: 'Welcome!',
        description: `Logged in as ${role} demo user.`,
      });
      navigate(role === 'admin' ? '/admin' : role === 'freelancer' ? '/freelancer' : '/client');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to login. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" />

      <div className="w-full max-w-[1100px] grid lg:grid-cols-2 bg-card/50 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl overflow-hidden relative z-10">
        
        {/* Left Side: Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="SkillBridge Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold tracking-tight gradient-text">SkillBridge</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground">Enter your credentials to access your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary transition-all rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" text-sm font-medium>Password</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary transition-all rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl gradient-hero shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-10">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>

        {/* Right Side: Visual/Branding */}
        <div className="hidden lg:flex flex-col justify-between p-12 gradient-hero relative overflow-hidden group">
          {/* Animated Patterns */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 border-8 border-white rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 w-96 h-96 border-8 border-white/50 rounded-full -ml-48 -mb-48 transition-transform duration-1000 group-hover:scale-110" />
          </div>

          <div className="relative z-10">
            <div className="mb-12">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-1.5 px-4 rounded-full backdrop-blur-md">
                Growth Focused
              </Badge>
            </div>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] mb-6">
              The smartest way to hire <span className="text-white/70">freelance talent.</span>
            </h2>
            <p className="text-white/80 text-lg max-w-md">
              SkillBridge connects world-class experts with forward-thinking companies 
              through AI-powered matching and secure workflows.
            </p>
          </div>

          <div className="relative z-10 space-y-6 pt-12 border-t border-white/20">
            {[
              "AI-driven project scoping",
              "Smart talent matching",
              "Escrow-protected payments"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-white">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  ✓
                </div>
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* Social Proof/Stat */}
          <div className="relative z-10 mt-12">
            <div className="p-6 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl">
              <div className="text-3xl font-bold text-white mb-1 Greenland">Quality first</div>
              <div className="text-sm text-white/70">Join a platform built on transparency, trust, and AI-powered precision.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}
