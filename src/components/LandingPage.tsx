import React, { useState } from 'react';
import { ArrowRight, Check, Code, DollarSign, Zap } from 'lucide-react';
import { LavaLamp } from './ui/fluid-blob';
import Header from './Header';
import { RainbowButton } from './ui/rainbow-button';
import HolographicCard from './ui/holographic-card';
import { SplitText } from './ui/split-text';
import { PricingSection } from './ui/pricing-section';
import { PricingTier } from './ui/pricing-card';
import WaitlistModal from './ui/waitlist-modal';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handlePlanClick = (planName: string) => {
    if (planName === 'Free') {
      onGetStarted();
    } else {
      setSelectedPlan(planName);
      setModalOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // For now, just trigger the auth flow
    onGetStarted();
  };

  const PAYMENT_FREQUENCIES = ["monthly", "yearly"];

  const PRICING_TIERS: PricingTier[] = [
    {
      name: "Free",
      price: {
        monthly: "Free",
        yearly: "Free",
      },
      description: "Perfect for testing your first idea",
      features: [
        "1 product validation per month",
        "Basic market research",
        "3 user personas (ICPs)",
        "5 content templates",
        "Community support",
      ],
      cta: "Get Started Free",
      onCTAClick: () => handlePlanClick("Free"),
    },
    {
      name: "Pro",
      price: {
        monthly: 29,
        yearly: 24,
      },
      description: "For serious indie hackers ready to scale",
      features: [
        "Unlimited product validations",
        "Advanced AI market research",
        "Unlimited user personas",
        "50+ content templates",
        "Real user discussions finder",
        "Outreach message generator",
        "Priority support",
        "Export all data",
      ],
      cta: "Start Building",
      popular: true,
      highlighted: true,
      onCTAClick: () => handlePlanClick("Pro"),
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Sticky Header */}
      <Header onLoginClick={() => setShowAuthModal(true)} />

      {/* Hero Section with Fluid Blob */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Blob */}
        <div className="absolute inset-0 opacity-10">
          <LavaLamp />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 border border-black rounded-full text-sm font-medium mb-6">
              <Code size={16} />
              <span>For Indie Hackers & Builders</span>
            </div>
          </div>

          <div className="mb-6">
            <SplitText
              text="Turn Your Side Project Into Revenue"
              className="text-5xl md:text-7xl font-bold tracking-tight leading-tight text-black"
              delay={50}
              threshold={0.2}
              rootMargin="0px"
              textAlign="center"
            />
          </div>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your product ideas into validated market opportunities with AI-powered research and insights
          </p>

          {/* Waitlist Form */}
          <div className="max-w-md mx-auto">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative w-full">
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        "--spread": "90deg",
                        "--shimmer-color": "#000000",
                        "--radius": "0.75rem",
                        "--speed": "3s",
                        "--cut": "0.05em",
                        "--bg": "rgba(255, 255, 255, 1)",
                      } as React.CSSProperties}
                    >
                      <div className="group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border-2 border-black px-6 py-4 text-white [background:var(--bg)] [border-radius:var(--radius)] w-full h-full rounded-xl">
                        {/* spark container */}
                        <div className="-z-30 blur-[2px] absolute inset-0 overflow-visible [container-type:size]">
                          {/* spark */}
                          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
                            {/* spark before */}
                            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
                          </div>
                        </div>
                        {/* backdrop */}
                        <div className="absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]" />
                      </div>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="relative z-10 w-full px-6 py-4 bg-transparent text-black placeholder-gray-500 text-lg focus:outline-none rounded-xl border-2 border-black"
                      required
                    />
                  </div>
                </div>
                <RainbowButton
                  type="submit"
                  disabled={isSubmitting}
                  variant="black"
                  className="px-8 py-4 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 h-auto"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="whitespace-nowrap">Join Waitlist</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </RainbowButton>
              </form>
            ) : (
              <div className="flex items-center justify-center space-x-3 p-4 bg-black text-white rounded-lg">
                <Check size={24} />
                <span className="text-lg font-medium">You're on the list! We'll be in touch soon.</span>
              </div>
            )}

            {error && (
              <p className="mt-3 text-red-600 text-sm">{error}</p>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Join 500+ builders getting early access
          </p>
        </div>
      </section>

      {/* Video Section */}
      <section id="demo" className="py-24 px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-gray-300">
              Watch how indie hackers are turning their side projects into revenue streams
            </p>
          </div>

          {/* Video Container */}
          <div className="relative">
            {/* Decorative blob behind video */}
            <div className="absolute -top-8 -left-8 w-32 h-32 opacity-10">
              <LavaLamp />
            </div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 opacity-10">
              <LavaLamp />
            </div>

            <div className="relative bg-white rounded-2xl p-2 shadow-2xl">
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative group cursor-pointer">
                {/* Video placeholder - replace with actual video */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">Watch Demo Video</p>
                    <p className="text-sm text-gray-500 mt-1">3 min overview</p>
                  </div>
                </div>

                {/* Replace this div with your actual video embed */}
                {/*
                <iframe
                  src="YOUR_VIDEO_URL"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                */}
              </div>
            </div>
          </div>

          {/* Video Stats */}
          <div className="flex items-center justify-center space-x-8 mt-12 text-gray-400">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">2.5K+</div>
              <div className="text-sm">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">98%</div>
              <div className="text-sm">Positive Feedback</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">3 min</div>
              <div className="text-sm">Watch Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              From Code to Cash in 3 Steps
            </h2>
            <p className="text-xl text-gray-600">
              The fastest way to validate and monetize your indie project
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <HolographicCard className="w-full h-full">
              <div className="text-center p-8 h-full flex flex-col justify-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Describe Your Project</h3>
                <p className="text-gray-600">
                  Tell our AI about your side project, upload your pitch deck, or share your landing page.
                </p>
              </div>
            </HolographicCard>

            <HolographicCard className="w-full h-full">
              <div className="text-center p-8 h-full flex flex-col justify-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Get Market Intelligence</h3>
                <p className="text-gray-600">
                  Receive validated user personas, real discussions from Reddit/LinkedIn, and content templates.
                </p>
              </div>
            </HolographicCard>

            <HolographicCard className="w-full h-full">
              <div className="text-center p-8 h-full flex flex-col justify-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Launch & Earn</h3>
                <p className="text-gray-600">
                  Use our outreach templates and validated insights to find your first paying customers.
                </p>
              </div>
            </HolographicCard>
          </div>
        </div>
      </section>

      {/* Social Proof with Blob */}
      <section className="relative py-24 px-6 bg-gray-50">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
          <LavaLamp />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Stop Building in the Dark
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">✗</span>
                </div>
                <h3 className="font-bold text-lg">The Old Way</h3>
              </div>
              <ul className="text-left space-y-2 text-gray-600">
                <li>• Build for months without user feedback</li>
                <li>• Launch to crickets</li>
                <li>• Guess what users actually want</li>
                <li>• Waste time on features nobody needs</li>
              </ul>
            </div>

            <div className="p-6 bg-black text-white rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Check size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-lg">The Smart Way</h3>
              </div>
              <ul className="text-left space-y-2">
                <li>• Validate before you build</li>
                <li>• Find real users discussing your problem</li>
                <li>• Get proven content templates</li>
                <li>• Launch with confidence</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8 text-gray-500">
            <div className="flex items-center space-x-2">
              <DollarSign size={20} />
              <span>$0 → $1K+ MRR</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap size={20} />
              <span>Days, not months</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <PricingSection
            title="Simple, Transparent Pricing"
            subtitle="Choose the plan that fits your indie hacker journey"
            frequencies={PAYMENT_FREQUENCIES}
            tiers={PRICING_TIERS}
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to cheat your way to revenue?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join the waitlist and be the first to turn your side project into a money-making machine.
          </p>

          <div className="max-w-md mx-auto">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative w-full">
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        "--spread": "90deg",
                        "--shimmer-color": "#ffffff",
                        "--radius": "0.75rem",
                        "--speed": "3s",
                        "--cut": "0.05em",
                        "--bg": "rgba(0, 0, 0, 1)",
                      } as React.CSSProperties}
                    >
                      <div className="group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border-2 border-white px-6 py-4 text-white [background:var(--bg)] [border-radius:var(--radius)] w-full h-full rounded-xl">
                        {/* spark container */}
                        <div className="-z-30 blur-[2px] absolute inset-0 overflow-visible [container-type:size]">
                          {/* spark */}
                          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
                            {/* spark before */}
                            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
                          </div>
                        </div>
                        {/* backdrop */}
                        <div className="absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]" />
                      </div>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="relative z-10 w-full px-6 py-4 bg-transparent text-white placeholder-gray-400 text-lg focus:outline-none rounded-xl border-2 border-white"
                      required
                    />
                  </div>
                </div>
                <RainbowButton
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 h-auto bg-white text-black"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="whitespace-nowrap">Get Early Access</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </RainbowButton>
              </form>
            ) : (
              <div className="flex items-center justify-center space-x-3 p-4 bg-white text-black rounded-lg">
                <Check size={24} />
                <span className="text-lg font-medium">You're in! Check your email soon.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          <p>&copy; 2025 AI Product Validator. Built for indie hackers, by indie hackers.</p>
        </div>
      </footer>

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        planName={selectedPlan}
      />

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          />
          <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Access the App
              </h2>
              <p className="text-gray-600 mb-8">
                Sign in to start validating your product ideas
              </p>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  onGetStarted();
                }}
                className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Continue to App
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
