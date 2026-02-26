import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Brain, 
  Shield, 
  Users, 
  ArrowRight, 
  CheckCircle,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'AI Project Consultant',
      description: 'Our intelligent chatbot discusses your vision, asks the right technical questions, and builds a comprehensive project roadmap.',
    },
    {
      icon: Target,
      title: 'Smart Matching Engine',
      description: 'Your AI Consultant analyzes hundreds of profiles to find the perfect freelancers who align with your specific technical needs.',
    },
    {
      icon: Shield,
      title: 'AI-Enhanced Escrow',
      description: 'Funds are protected and released only when our AI verifies that the delivered work matches the discussed scope.',
    },
    {
      icon: Zap,
      title: 'Instant Scoping',
      description: 'Go from a vague idea to a technical specification in minutes through a guided AI conversation.',
    },
  ];

  const stats = [
    { value: 'AI Discovery', label: '24/7 Chat-to-Roadmap' },
    { value: 'Smart Matching', label: 'Precision Talent Vetting' },
    { value: 'Protected', label: 'AI-Verified Payments' },
    { value: 'Interactive', label: 'Smart Project Consultant' },
  ];

  const steps = [
    { number: '01', title: 'Consult with AI', description: 'Chat with our intelligent consultant to define your vision, budget, and exact technical requirements.' },
    { number: '02', title: 'AI-Powered Matching', description: 'Our system analyzes the discussion and matches you with top freelancers best suited for your specific task.' },
    { number: '03', title: 'Start Building', description: 'Review the roadmap, hire your matched team, and start working with AI-assisted milestone tracking.' },
  ];


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      {/* ------------------------------------------------------------------------------------ */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Zap className="w-4 h-4 mr-2 text-primary" />
              AI-Powered Freelance Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1]">
              The AI That <span className="gradient-text">Builds Your Team</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              SkillBridge is the first freelance platform where an Intelligent AI Consultant 
              discusses your vision, defines your scope, and matches you with the perfect developers.
            </p>
            {/* --------------------------------------------------------------------------------- */}
            {/* --------------------------------------------------------------------------------- */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  Start Hiring
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="text-black font-bold" asChild>
                <Link to="/signup?role=freelancer">Find Work</Link>
              </Button>
            </div>
            {/* ----------------------------------------------------------------------------------------- */}

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                No fees until you hire
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Vetted talent only
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                AI-powered matching
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] -ml-32" />
        
        <div className="container mx-auto relative">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">How SkillBridge Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From initial project vision to successful delivery in three unified steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative group">
                <Card variant="elevated" className="h-full border-white/40 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl">
                  <CardContent className="p-10">
                    <div className="text-7xl font-extrabold text-primary/5 mb-6 group-hover:text-primary/10 transition-colors">{step.number}</div>
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-[55%] -right-6 w-12 h-12 text-muted-foreground/20 animate-pulse-slow" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Powered by AI */}
      <section className="py-24 px-4 bg-muted/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
        
        <div className="container mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">The AI-First Ecosystem</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We've redesigned the freelance experience from the ground up, placing artificial intelligence 
              at the core of every project milestone.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card 
                key={feature.title} 
                variant="interactive" 
                className="h-full group"
              >
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center mb-6 shadow-glow group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Deep Dive: AI Scoping Section */}
      <section className="py-32 px-4 relative">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-6 border-primary/30 text-primary py-1.5 px-4 font-bold">
                Smart Scoping
              </Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-[1.1] tracking-tight">
                From Idea to <span className="gradient-text">Detailed Roadmap</span> in Seconds.
              </h2>
              <div className="space-y-8">
                {[
                  { 
                    title: "AI-Led Discovery", 
                    desc: "Our interactive chatbot discusses your project goals, uncovering technical nuances that traditional forms miss.",
                    icon: Brain
                  },
                  { 
                    title: "Autonomous Matching", 
                    desc: "The AI cross-references your roadmap with our vetted talent pool to find the absolute best technical fit.",
                    icon: Users
                  },
                  { 
                    title: "Verified Deliverables", 
                    desc: "AI ensures every milestone matches the discussed requirements before funds are released from escrow.",
                    icon: Shield
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-card border shadow-sm flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-2xl -rotate-6" />
              <div className="relative glass rounded-[2.5rem] p-8 border-white/20 shadow-2xl overflow-hidden min-h-[450px]">
                {/* SkillBridge AI Roadmap UI */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Brain className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-primary uppercase tracking-tighter">AI Analysis Complete</div>
                        <div className="text-sm font-extrabold">E-commerce API Roadmap</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase">Confidence Score</div>
                      <div className="text-xl font-black text-success">98.4%</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { title: "User Auth System", time: "3 Days", cost: "$450" },
                      { title: "Stripe Integration", time: "5 Days", cost: "$1,200" },
                      { title: "Inventory Engine", time: "7 Days", cost: "$2,400" }
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-card/40 border border-white/50 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-sm font-bold">{m.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-muted text-muted-foreground">{m.time}</span>
                          <span className="text-sm font-black text-primary">{m.cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-dashed border-primary/20">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Recommended Tech Stack</div>
                    <div className="flex flex-wrap gap-2">
                      {['Next.js 15', 'Tailwind', 'PostgreSQL', 'Redis', 'Docker'].map((tech, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <img key={i} src={`https://i.pravatar.cc/100?img=${i+30}`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="freelancer" />
                      ))}
                    </div>
                    <Button variant="hero" size="sm" className="rounded-xl font-bold shadow-lg">
                      Generate Full Scope
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-24 px-4 bg-muted/30 border-y">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Built on Foundational Trust</h2>
            <p className="text-muted-foreground text-lg">Your security and peace of mind are our priority.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {
              [
                { title: "Escrow Protection", desc: "Funds stay in secure escrow and are only released when milestones are explicitly approved." },
                { title: "AI Roadmap Compliance", desc: "Every deliverable is automatically verified against the technical scope and requirements discussed with your AI Consultant." },
                { title: "Vetted Expert Network", desc: "Our AI analyzes performance data and technical assessments to ensure you only match with the best specialized professional talent." }
              ].map((item, i) => (
                <div key={i} className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <Card variant="gradient" className="overflow-hidden">
            <CardContent className="p-12 md:p-16 text-center relative">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                  Ready to Build Something Amazing?
                </h2>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Be part of the early wave of creators and businesses building the future on SkillBridge.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="xl" variant="hero" className="shadow-xl" asChild>
                    <Link to="/signup">
                      Get Started Free
                      <ArrowRight className="ml-2" />
                    </Link>
                  </Button>
                  <Button size="xl" variant="outline" className="text-white border-white hover:bg-white/10 bg-transparent font-bold" asChild>
                    <Link to="/how-it-works">Learn More</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>



  {/* --------------------------------------------------------------------------------------- */}
      <Footer />
    </div>
  );
}
