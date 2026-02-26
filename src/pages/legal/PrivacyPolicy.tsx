import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Shield, Lock, Eye, FileText, Globe } from 'lucide-react';

export default function PrivacyPolicy() {
  const lastUpdated = "February 26, 2026";

  const sections = [
    {
      icon: Shield,
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us when you create an account, post a project, submit a proposal, or communicate with us. This includes your name, email address, payment information, and professional background."
    },
    {
      icon: Eye,
      title: "2. How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services, including matching clients with freelancers, processing payments, and sending relevant notifications and updates."
    },
    {
      icon: Lock,
      title: "3. Data Protection",
      content: "We implement a variety of security measures to maintain the safety of your personal information. Your sensitive data is encrypted and stored securely, accessible only by a limited number of persons with special access rights."
    },
    {
      icon: Globe,
      title: "4. Information Sharing",
      content: "We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except to provide our services, comply with the law, or protect our rights."
    },
    {
      icon: FileText,
      title: "5. Your Rights",
      content: "You have the right to access, correct, or delete your personal information at any time. You can manage your privacy settings through your account dashboard or contact our support team for assistance."
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
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Your privacy is important to us. This policy explains how we collect, use, and protect your data.
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
                At SkillBridge, we are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy applies to the SkillBridge website and all related services.
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

              {/* <div className="mt-16 pt-8 border-t border-border/40">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at:
                  <br />
                  <span className="text-primary font-medium">privacy@skillbridge.com</span>
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
