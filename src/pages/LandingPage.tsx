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
  Star,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Scoping',
      description: 'Our AI analyzes your project requirements and generates accurate scope, budget estimates, and timeline predictions.',
    },
    {
      icon: Target,
      title: 'Smart Matching',
      description: 'Get matched with the perfect developers based on skills, experience, and project requirements.',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Built-in escrow system ensures your money is safe until you approve the completed work.',
    },
    {
      icon: Clock,
      title: 'Time Tracking',
      description: 'Transparent time tracking with detailed reports and milestone management.',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Skilled Developers' },
    { value: '98%', label: 'Success Rate' },
    { value: '$25M+', label: 'Paid to Freelancers' },
    { value: '4.9', label: 'Average Rating' },
  ];

  const steps = [
    { number: '01', title: 'Describe Your Project', description: 'Tell us what you need. Our AI will help define scope and requirements.' },
    { number: '02', title: 'Get Matched', description: 'Receive proposals from pre-vetted developers matched to your needs.' },
    { number: '03', title: 'Collaborate & Pay', description: 'Work together with secure payments and milestone tracking.' },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CTO at TechStart',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      content: 'SkillBridge transformed how we hire developers. The AI scoping feature alone saved us weeks of back-and-forth.',
      rating: 5,
    },
    {
      name: 'Marcus Williams',
      role: 'Founder at DevShop',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      content: 'As a developer, I love how the platform matches me with projects that fit my skills perfectly.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Product Manager',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      content: 'The secure payment system gives me peace of mind. I know exactly what I\'m paying for.',
      rating: 5,
    },
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
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Find Top Talent with{' '}
              <span className="gradient-text">AI Precision</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              SkillBridge connects businesses with pre-vetted developers through AI-powered matching. 
              Get accurate project scoping, smart matching, and secure payments.
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
              <Button variant="outline" size="xl" asChild>
                <Link to="/signup?role=developer">Find Work</Link>
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
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How SkillBridge Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From project idea to successful delivery in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <Card variant="elevated" className="h-full">
                  <CardContent className="p-8">
                    <div className="text-6xl font-bold text-primary/10 mb-4">{step.number}</div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-6 w-8 h-8 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by AI</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI tools help you scope projects, find the right talent, and manage work efficiently
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} variant="interactive" className="h-full">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Teams Worldwide</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our clients and developers have to say
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} variant="elevated" className="h-full">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-warning fill-warning" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">&quot;{testimonial.content}&quot;</p>
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                  Join thousands of businesses and developers who trust SkillBridge for their projects
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="xl" variant="secondary" asChild>
                    <Link to="/signup">
                      Get Started Free
                      <ArrowRight className="ml-2" />
                    </Link>
                  </Button>
                  <Button size="xl" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
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
