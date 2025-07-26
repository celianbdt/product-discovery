import React, { useState } from 'react';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';
import IterateModal from './components/IterateModal';
import SalesMode from './components/SalesMode';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ICP {
  title: string;
  description: string;
  painPoints: string[];
  channels: string[];
}

interface Discussion {
  platform: string;
  title: string;
  url: string;
  engagement: string;
  relevance: number;
  profileUrl: string;
  profileName: string;
}

interface InboundContent {
  type: string;
  platform: string;
  content: string;
  cta: string;
}

interface OutreachMessage {
  type: string;
  platform: string;
  message: string;
  personalization: string[];
}

interface Prospect {
  name: string;
  title: string;
  company: string;
  email: string;
  linkedin: string;
  source: string;
  relevanceScore: number;
}

interface SalesContent {
  type: 'linkedin' | 'email' | 'phone';
  title: string;
  subject?: string;
  content: string;
  personalization: string[];
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentView, setCurrentView] = useState<'chat' | 'dashboard' | 'sales'>('chat');
  const [showIterateModal, setShowIterateModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock data for demonstration
  const [icps] = useState<ICP[]>([
    {
      title: "B2B SaaS Founders (Series A)",
      description: "Technology entrepreneurs who have proven product-market fit and are scaling their teams",
      painPoints: [
        "Difficulty validating new product features",
        "Limited time for market research",
        "Need faster customer feedback loops"
      ],
      channels: ["LinkedIn", "Product Hunt", "YC Network", "SaaS communities"]
    },
    {
      title: "Solo Entrepreneurs & Indie Hackers",
      description: "Individual builders creating digital products and services",
      painPoints: [
        "Working in isolation without validation",
        "Limited resources for market research",
        "Need validation before building"
      ],
      channels: ["Twitter", "Indie Hackers", "Reddit", "Hacker News"]
    }
  ]);

  const [discussions] = useState<Discussion[]>([
    {
      platform: "LinkedIn",
      title: "Struggling to validate my B2B SaaS idea - any frameworks?",
      url: "https://linkedin.com/posts/example1",
      engagement: "45 comments, 120 likes",
      relevance: 9,
      profileUrl: "https://linkedin.com/in/sarah-chen-founder",
      profileName: "Sarah Chen"
    },
    {
      platform: "Reddit",
      title: "How do you validate a product idea without building it?",
      url: "https://reddit.com/r/entrepreneur/example",
      engagement: "78 comments, 200 upvotes",
      relevance: 8,
      profileUrl: "https://reddit.com/user/marcus_builds",
      profileName: "u/marcus_builds"
    },
    {
      platform: "Quora",
      title: "What's the best way to find your ideal customer profile?",
      url: "https://quora.com/example-question",
      engagement: "12 answers, 50 follows",
      relevance: 7,
      profileUrl: "https://quora.com/profile/Emma-Thompson-Entrepreneur",
      profileName: "Emma Thompson"
    }
  ]);

  const [inboundContent] = useState<InboundContent[]>([
    {
      type: "LinkedIn Post",
      platform: "LinkedIn",
      content: "Building something new? I'm curious - what's the biggest challenge you face when validating a new product idea?\n\nDrop a comment below 👇 I'm researching this space and would love to hear your thoughts.",
      cta: "Comment your biggest validation challenge"
    },
    {
      type: "X/Twitter Poll",
      platform: "Twitter",
      content: "Quick poll for founders 📊\n\nWhat do you wish existed to help validate your product ideas faster?\n\nA) AI-powered market research\nB) Instant customer feedback loops  \nC) Automated competitor analysis\nD) All of the above",
      cta: "Vote and RT for reach"
    },
    {
      type: "Newsletter",
      platform: "Email",
      content: "Subject: The #1 mistake founders make when validating ideas\n\nHey [Name],\n\nI've been analyzing 100+ failed startups, and there's one pattern that keeps showing up...\n\nThey all skipped proper market validation.\n\nHere's what successful founders do differently:\n\n1. They talk to customers BEFORE building\n2. They test multiple ICPs simultaneously  \n3. They use data, not assumptions\n\nWant to avoid this costly mistake? I'm building an AI tool that helps you validate ideas in minutes, not months.\n\nInterested in early access?",
      cta: "Reply 'YES' for early access"
    },
    {
      type: "Landing Page",
      platform: "Website",
      content: "Get AI-powered insights to validate your product ideas in minutes, not months. Join 500+ founders who are building smarter.",
      cta: "Join the waitlist"
    }
  ]);

  const [outreachMessages] = useState<OutreachMessage[]>([
    {
      type: "LinkedIn DM",
      platform: "LinkedIn",
      message: "Hi {firstName},\n\nI saw your post about {specificProblem} and found your perspective really insightful.\n\nI'm working on something that might interest you - an AI tool that helps founders validate product ideas and find their ICP in minutes rather than months.\n\nWould love to get your thoughts on this. Mind if I send you a quick demo?",
      personalization: ["{firstName}", "{specificProblem}", "{company}"]
    },
    {
      type: "Reddit Comment",
      platform: "Reddit",
      message: "Great question! I've been researching this exact problem and found that most founders struggle with validation because they don't have a systematic approach.\n\nI'm actually building an AI agent that analyzes your product idea and generates validation strategies automatically. Would love to show you how it works if you're interested.\n\nFeel free to DM me if you'd like to see a demo!",
      personalization: ["{username}", "{specificContext}"]
    },
    {
      type: "Cold Email",
      platform: "Email",
      message: "Subject: Quick question about {company}'s validation process\n\nHi {firstName},\n\nI came across your discussion on {platform} about {specificPain} and found your insights valuable.\n\nI'm building an AI tool that helps founders like you validate ideas faster. We've helped 200+ founders achieve:\n\n• 40% faster validation cycles\n• 3x more accurate ICP identification\n• Automated market research\n\nWould you be open to a 15-minute demo this week? I'd love to show you how it works and get your feedback.\n\nBest,\n[Your Name]",
      personalization: ["{firstName}", "{company}", "{platform}", "{specificPain}"]
    }
  ]);

  const [prospects] = useState<Prospect[]>([
    {
      name: "Sarah Chen",
      title: "Founder & CEO",
      company: "TechFlow Solutions",
      email: "sarah@techflow.io",
      linkedin: "https://linkedin.com/in/sarahchen",
      source: "LinkedIn Discussion",
      relevanceScore: 9
    },
    {
      name: "Marcus Rodriguez",
      title: "Product Manager",
      company: "StartupCorp",
      email: "marcus@startupcorp.com",
      linkedin: "https://linkedin.com/in/marcusr",
      source: "Reddit Thread",
      relevanceScore: 8
    },
    {
      name: "Emma Thompson",
      title: "Solo Entrepreneur",
      company: "Independent",
      email: "emma@emmabuilds.com",
      linkedin: "https://linkedin.com/in/emmathompson",
      source: "Twitter Engagement",
      relevanceScore: 7
    }
  ]);

  const [salesContent] = useState<SalesContent[]>([
    {
      type: "linkedin",
      title: "LinkedIn Connection Request",
      content: "Hi {firstName},\n\nI noticed your post about validating product ideas and thought you might be interested in what we're building.\n\nWe help founders like you get AI-powered market insights in minutes instead of spending weeks on research.\n\nWould love to connect and share how it works!\n\nBest,\n[Your Name]",
      personalization: ["{firstName}", "{company}", "{recentPost}"]
    },
    {
      type: "email",
      title: "Cold Email Outreach",
      subject: "Quick question about {company}'s product validation process",
      content: "Hi {firstName},\n\nI came across your discussion on {platform} about {specificPain} and found your perspective really insightful.\n\nI'm working on something that might interest you - an AI tool that helps founders validate product ideas and find their ICP in minutes rather than months.\n\nWe've helped 200+ founders including:\n• 40% faster validation cycles\n• 3x more accurate ICP identification  \n• Automated competitor & market research\n\nWould you be open to a 15-minute demo this week? I'd love to show you how it works and get your feedback.\n\nBest regards,\n[Your Name]",
      personalization: ["{firstName}", "{company}", "{platform}", "{specificPain}"]
    },
    {
      type: "phone",
      title: "Phone/Video Call Script",
      content: "Hi {firstName}, thanks for taking the time to speak with me.\n\nI saw your {platform} post about {specificPain} and thought our tool might be exactly what you're looking for.\n\n[PAUSE FOR RESPONSE]\n\nWe've built an AI agent that analyzes your product idea and gives you:\n• Validated ICPs with pain points\n• Real discussions from your target market\n• Ready-to-use validation content\n• Sales scripts and prospect lists\n\nThe founders we work with typically see 40% faster validation cycles.\n\nCan I show you a quick demo of how it works with your current project?\n\n[DEMO OR NEXT STEPS]",
      personalization: ["{firstName}", "{platform}", "{specificPain}", "{company}"]
    }
  ]);

  const [currentHypothesis] = useState(
    "B2B SaaS founders and indie hackers struggle with product validation due to time constraints and lack of structured frameworks. They need an AI-powered tool that can quickly analyze their ideas, identify target markets, and generate validation content to test hypotheses efficiently."
  );

  const handleResourceUpload = (files: FileList | null, urls: string[]) => {
    const resourceInfo = [];
    if (files && files.length > 0) {
      resourceInfo.push(`${files.length} file(s) uploaded`);
    }
    if (urls.length > 0) {
      resourceInfo.push(`${urls.length} URL(s) added`);
    }
    
    if (resourceInfo.length > 0) {
      addMessage('user', `Resources added: ${resourceInfo.join(', ')}`);
      addMessage('ai', 'Resources received! I\'ll analyze these along with your product idea. Please describe your product concept or business idea.');
    }
  };

  const handleSubmitIdea = (idea: string) => {
    addMessage('user', idea);
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      addMessage('ai', 
        'Excellent! I\'ve analyzed your product idea and resources. Based on my analysis, I\'ve identified potential ICPs, found relevant market discussions, and generated validation content.\n\nI recommend starting with the B2B SaaS founders segment - they show the highest engagement and clearest pain points around product validation.\n\nCheck out the dashboard to see detailed insights and start your validation journey!'
      );
      setIsAnalyzing(false);
      setCurrentView('dashboard');
    }, 3000);
  };

  const addMessage = (type: 'user' | 'ai', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleIterate = () => {
    setShowIterateModal(true);
  };

  const handleIterateSubmit = (learnings: string) => {
    addMessage('user', `Iteration learnings: ${learnings}`);
    setIsAnalyzing(true);
    
    setTimeout(() => {
      addMessage('ai', 
        'Thanks for the feedback! Based on your learnings, I\'ve updated the hypothesis and generated new validation strategies. The fintech angle seems promising - I\'ve identified new discussions and created targeted content for that segment.\n\nCheck the updated dashboard for fresh insights!'
      );
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleGoToSales = () => {
    setCurrentView('sales');
  };

  const handleExport = () => {
    const exportData = {
      hypothesis: currentHypothesis,
      icps,
      discussions,
      validationContent,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-validation-analysis.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBackToAnalysis = () => {
    setCurrentView('dashboard');
  };

  if (currentView === 'sales') {
    return (
      <SalesMode
        onBack={handleBackToAnalysis}
        prospects={prospects}
        salesContent={salesContent}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {currentView === 'chat' ? (
        <Chat
          onResourceUpload={handleResourceUpload}
          onSubmitIdea={handleSubmitIdea}
          messages={messages}
        />
      ) : (
        <>
          {/* Navigation */}
          <div className="border-b border-gray-200 px-6 py-3">
            <div className="max-w-6xl mx-auto flex items-center space-x-6">
              <button
                onClick={() => setCurrentView('chat')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'chat'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Analysis
              </button>
            </div>
          </div>

          <Dashboard
            icps={icps}
            discussions={discussions}
            inboundContent={inboundContent}
            outreachMessages={outreachMessages}
            currentHypothesis={currentHypothesis}
            onIterate={handleIterate}
            onGoToSales={handleGoToSales}
            onExport={handleExport}
          />
        </>
      )}

      {isAnalyzing && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-black"></div>
            <span className="text-sm text-gray-600">AI is analyzing...</span>
          </div>
        </div>
      )}

      <IterateModal
        isOpen={showIterateModal}
        onClose={() => setShowIterateModal(false)}
        onSubmit={handleIterateSubmit}
      />
    </div>
  );
}

export default App;