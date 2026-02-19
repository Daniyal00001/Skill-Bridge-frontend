import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Sparkles, Users, Brain, ShieldCheck, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              About <span className="gradient-text">SkillBridge</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              SkillBridge is a next-generation freelance platform designed to
              simplify how clients connect with skilled developers — using
              intelligent matching, guided workflows, and a trust-first approach.
            </p>
          </div>
        </div>
      </section>

      {/* ================= MISSION SECTION ================= */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 flex items-center gap-3">
                <Target className="w-7 h-7 text-primary" />
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our mission is to bridge the gap between businesses and developers
                by removing uncertainty from freelance hiring. SkillBridge empowers
                both experienced and inexperienced clients to find the right talent
                with confidence, transparency, and efficiency.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-muted/30 border border-border/40">
              <p className="text-lg font-medium text-foreground leading-relaxed">
                “We don’t replace human decision-making — we enhance it.”
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                SkillBridge uses AI as a supportive tool, not a controlling system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How SkillBridge Works</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              SkillBridge is designed to support different types of users through
              flexible discovery and intelligent guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Manual Discovery"
              description="Experienced clients can browse, search, and directly contact developers based on skills, experience, and ratings."
            />
            <FeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="AI-Powered Matching"
              description="Clients who are unsure about market pricing or technical requirements can use the “Help Me Find” feature to receive AI-matched developer suggestions."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Smart Recommendations"
              description="Based on project size, budget, and urgency, SkillBridge recommends the most relevant developer profiles for better outcomes."
            />
          </div>
        </div>
      </section>

      {/* ================= TRUST & SECURITY ================= */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20">
              <ShieldCheck className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-3xl font-bold mb-4">Trust & Transparency</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                SkillBridge promotes a fair freelance ecosystem through verified
                profiles, blind reviews, transparent communication, and secure
                interactions between clients and developers.
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold mb-6">Why SkillBridge?</h3>
              <ul className="space-y-4 text-muted-foreground text-lg">
                <li>• Clear project definitions reduce misunderstandings</li>
                <li>• AI-assisted matching saves time and effort</li>
                <li>• Flexible hiring methods: direct or bidding</li>
                <li>• Beginner-friendly and expert-approved workflows</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FUTURE VISION ================= */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Our Vision</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            SkillBridge aims to redefine freelance collaboration by combining
            intelligent technology with human choice. As the platform evolves,
            our goal is to create a trusted, scalable ecosystem where developers
            and clients grow together through clarity, fairness, and innovation.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ================= REUSABLE FEATURE CARD ================= */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 rounded-2xl bg-background border border-border/40 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
        {icon}
      </div>
      <h4 className="text-xl font-bold mb-3">{title}</h4>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
