import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Eye, EyeOff, ArrowLeft, Loader2, Briefcase, Code, User, Mail, Lock as LockIcon, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import logo from '@/assets/logo/logo.png'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import axios from 'axios'

export default function SignupPage() {
  const [searchParams] = useSearchParams()
  const initialRole =
    searchParams.get('role') === 'freelancer' ? 'freelancer' : 'client'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'client' | 'freelancer'>(initialRole)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { signup } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signup({ name, email, password, role })

      toast({
        title: 'Account created!',
        description: 'Welcome to SkillBridge.',
      })

      navigate(role === 'freelancer' ? '/freelancer' : '/client')

    } catch (error) {
      let message = 'Failed to create account. Please try again.'

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message
      }

      toast({
        title: 'Signup failed',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-primary/10 rounded-full blur-[130px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-accent/10 rounded-full blur-[130px] animate-pulse-slow" />

      <div className="w-full max-w-[1100px] grid lg:grid-cols-2 bg-card/50 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10">
        
        {/* Left Side: Branding/Visual */}
        <div className="hidden lg:flex flex-col justify-between p-12 gradient-hero relative overflow-hidden group order-2 lg:order-1">
          {/* Animated Patterns */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] border-[20px] border-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20 transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/30 rounded-full -ml-20 -mt-20 blur-2xl" />
          </div>

          <div className="relative z-10">
            <div className="mb-10">
              <Badge className="bg-white/20 text-white border-none py-1.5 px-4 rounded-full backdrop-blur-md">
                Early Access
              </Badge>
            </div>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] mb-8">
              Build your future <span className="text-white/70">with SkillBridge.</span>
            </h2>
            <div className="space-y-6">
              {[
                { title: "Smart Scoping", desc: "AI tools to define your project perfectly" },
                { title: "Early Bird Benefits", desc: "Join early to get exclusive platform benefits" },
                { title: "Transparency", desc: "Clear workflows and secure interactions" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.title}</h4>
                    <p className="text-white/60 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/20">
            <p className="text-white/80 text-sm font-medium mb-4">Join our growing community</p>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-primary bg-muted/20 flex items-center justify-center text-[10px] text-muted-foreground overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="user" />
                  </div>
                ))}
              </div>
              <p className="text-white/60 text-xs">Be part of the next generation of freelancers.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center order-1 lg:order-2">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="SkillBridge Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold tracking-tight gradient-text">SkillBridge</span>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Create account</h1>
            <p className="text-muted-foreground">Join the next-gen freelance ecosystem today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={cn(
                  'flex flex-col items-start gap-1 p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden group',
                  role === 'client'
                    ? 'border-primary bg-primary/5 shadow-inner'
                    : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl mb-2 transition-colors",
                  role === 'client' ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/20"
                )}>
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold">I'm hiring</span>
                <span className="text-[10px] text-muted-foreground leading-tight">Post jobs & find talent</span>
                {role === 'client' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />}
              </button>

              <button
                type="button"
                onClick={() => setRole('freelancer')}
                className={cn(
                  'flex flex-col items-start gap-1 p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden group',
                  role === 'freelancer'
                    ? 'border-primary bg-primary/5 shadow-inner'
                    : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl mb-2 transition-colors",
                  role === 'freelancer' ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/20"
                )}>
                  <Code className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold">I'm expert</span>
                <span className="text-[10px] text-muted-foreground leading-tight">Find work & build career</span>
                {role === 'freelancer' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />}
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    className="pl-10 h-11 bg-background/50 border-border/50 rounded-xl"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-11 bg-background/50 border-border/50 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                <div className="relative group">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 h-11 bg-background/50 border-border/50 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold rounded-xl gradient-hero shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Setting up...</>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="text-center text-[11px] text-muted-foreground mt-6 leading-relaxed">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-primary font-bold hover:underline">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>
          </p>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already a member?{' '}
            <Link to="/login" className="text-primary font-extrabold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}
