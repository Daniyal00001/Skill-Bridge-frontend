import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Target, 
  Brain, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  MessageSquare, 
  Zap,
  Globe
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden text-center">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto relative z-10">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Zap className="w-4 h-4 mr-2 text-primary" />
            Redefining the Freelance Economy
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight">
            The Future of Freelancing is <span className="gradient-text">Intelligent</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            SkillBridge was born from a simple observation: traditional freelance platforms 
            are broken by technical gaps and communication friction. We built the solution.
          </p>
        </div>
      </section>

      {/* The Vision Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">
                Our Vision: A Bridge Over the <span className="gradient-text">Technical Gap</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Most businesses know what they want to achieve, but talking about technical 
                requirements is difficult. Freelancers thrive on clear specs, yet they 
                spend 50% of their time just trying to understand the vision.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                <strong>SkillBridge</strong> uses a consultant-grade AI to bridge this gap. 
                Our platform doesn't just list jobs; it discusses them, scopes them, and 
                vets the talent needed to build them perfectly.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Brain className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold">AI Discussion</h4>
                  <p className="text-sm text-muted-foreground">Transforming vague ideas into detailed technical roadmaps.</p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
                    <Target className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold">Precision Matching</h4>
                  <p className="text-sm text-muted-foreground">Matching you with the best technical fit, not just the lowest bidder.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px] opacity-30" />
              <div className="glass p-8 rounded-[2.5rem] border-white/20 shadow-2xl relative">
                <blockquote className="text-2xl font-medium italic text-foreground leading-relaxed mb-6">
                  "SkillBridge isn't just a marketplace; it's an intelligent workspace where visions 
                  are understood before they are built."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-white font-bold">SB</div>
                  <div>
                    <div className="font-bold">The SkillBridge Team</div>
                    <div className="text-sm text-muted-foreground">Pioneering AI Consultant Technology</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 px-4 bg-muted/30 border-y">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4">The Values We Build Upon</h2>
            <p className="text-muted-foreground text-lg">Integrity and innovation are at the core of everything we do.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: ShieldCheck, 
                title: "Radical Transparency", 
                desc: "No hidden fees, no obscured profiles. Every transaction and requirement is clear from day one.",
                color: "text-success bg-success/10"
              },
              { 
                icon: MessageSquare, 
                title: "Communication First", 
                desc: "The best work comes from the best conversations. Our AI ensures no requirement is lost in translation.",
                color: "text-primary bg-primary/10"
              },
              { 
                icon: Globe, 
                title: "Global Empowerment", 
                desc: "Connecting the world's best developers with global opportunities, regardless of location.",
                color: "text-accent bg-accent/10"
              }
            ].map((value, i) => (
              <Card key={i} variant="interactive" className="">
                <CardContent className="p-10">
                  <div className={`w-14 h-14 rounded-2xl ${value.color} flex items-center justify-center mb-6`}>
                    <value.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight">
            Ready to Experience the <span className="gradient-text">New Standard?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join the early wave of innovators who are building faster and smarter with SkillBridge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="hero" asChild>
              <Link to="/signup">
                Get Started Now
                <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" className="text-black font-bold" asChild>
              <Link to="/how-it-works">See How it Works</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
