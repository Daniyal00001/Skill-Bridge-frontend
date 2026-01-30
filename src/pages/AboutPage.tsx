import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              About{' '}
              <span className="gradient-text">SkillBridge</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're revolutionizing the freelance industry with AI-powered matching, 
              connecting businesses with the perfect developers for their projects.
            </p>
          </div>
        </div>
      </section>

      {/* Placeholder content - will be expanded in subsequent tasks */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              To bridge the gap between talented developers and innovative businesses 
              through intelligent technology and seamless collaboration.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}