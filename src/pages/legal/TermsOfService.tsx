import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FileCheck, Users, Scale, AlertCircle, HelpCircle } from 'lucide-react';

export default function TermsOfService() {
  const lastUpdated = "February 26, 2026";

  const sections = [
    {
      icon: FileCheck,
      title: "1. Acceptance of Terms",
      content: "By accessing or using SkillBridge, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
    },
    {
      icon: Users,
      title: "2. User Conduct",
      content: "Users are responsible for their own conduct and any content they submit to the platform. You agree not to use SkillBridge for any unlawful purpose or in any way that could damage, disable, or impair the service."
    },
    {
      icon: Scale,
      title: "3. Intellectual Property",
      content: "The content, features, and functionality of SkillBridge are owned by SkillBridge and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws."
    },
    {
      icon: AlertCircle,
      title: "4. Limitation of Liability",
      content: "SkillBridge and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service."
    },
    {
      icon: HelpCircle,
      title: "5. Governing Law",
      content: "These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which SkillBridge operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Terms of <span className="gradient-text">Service</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Please read these terms carefully before using our platform.
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card border border-border/40 rounded-3xl p-8 md:p-12 shadow-sm">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg text-muted-foreground mb-12">
                These Terms of Service govern your use of the SkillBridge platform and services. By using SkillBridge, you agree to comply with these terms.
              </p>

              <div className="space-y-12">
                {sections.map((section, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <section.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-4 text-foreground">{section.title}</h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
