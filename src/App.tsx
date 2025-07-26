import React, { useState } from 'react';
import ProductInput from './components/ProductInput';
import Dashboard from './components/Dashboard';
import IterateModal from './components/IterateModal';
import SalesMode from './components/SalesMode';
import LandingPage from './components/LandingPage';

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
  title?: string;
  content: string;
  cta: string;
  targetAudience?: string;
  painPoint?: string;
  estimatedEngagement?: string;
}

interface OutreachMessage {
  type: string;
  platform: string;
  message: string;
  personalization: string[];
}

interface Prospect {
  id?: string;
  name: string;
  title: string;
  company: string;
  email: string;
  linkedin: string;
  source: string;
  relevanceScore: number;
  enriched?: {
    email?: string;
    phone?: string;
    company_email?: string;
    company_phone?: string;
    company_website?: string;
    linkedin_url?: string;
    twitter_url?: string;
    confidence_score?: number;
  };
}

interface SalesContent {
  type: 'linkedin' | 'email' | 'phone';
  title: string;
  subject?: string;
  content: string;
  personalization: string[];
}

interface ValidationResponse {
  discussions?: any[];
  people?: any[];
  insights?: any;
  raw?: string;
}

function App() {
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentView, setCurrentView] = useState<'input' | 'dashboard' | 'sales'>('input');
  const [showIterateModal, setShowIterateModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [validationData, setValidationData] = useState<ValidationResponse | null>(null);
  const [conversationContext, setConversationContext] = useState({
    stage: 'initial',
    messageCount: 0
  });
  const [analysisProgress, setAnalysisProgress] = useState({
    step: 'Initializing...',
    progress: 0,
    completed: [] as string[],
    showResults: false
  });

  // State for API data
  const [icps, setIcps] = useState<ICP[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [inboundContent, setInboundContent] = useState<InboundContent[]>([]);
  const [outreachMessages, setOutreachMessages] = useState<OutreachMessage[]>([]);
  const [currentHypothesis, setCurrentHypothesis] = useState('');

  // Mock data for sales mode (will be enhanced later)
  const [prospects, setProspects] = useState<Prospect[]>([
    {
      id: "1",
      name: "Sarah Chen",
      title: "Founder & CEO",
      company: "TechFlow Solutions",
      email: "sarah@techflow.io",
      linkedin: "https://linkedin.com/in/sarahchen",
      source: "LinkedIn Discussion",
      relevanceScore: 9
    },
    {
      id: "2",
      name: "Marcus Rodriguez",
      title: "Product Manager",
      company: "StartupCorp",
      email: "marcus@startupcorp.com",
      linkedin: "https://linkedin.com/in/marcusr",
      source: "Reddit Thread",
      relevanceScore: 8
    },
    {
      id: "3",
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

  const handleResourceUpload = (files: FileList | null, urls: string[]) => {
    setConversationContext({
      stage: 'initial',
      messageCount: 0
    });

    const resourceInfo = [];
    const resources = [];

    if (files && files.length > 0) {
      resourceInfo.push(`${files.length} file(s) uploaded`);
      for (let i = 0; i < files.length; i++) {
        resources.push(`File: ${files[i].name}`);
      }
    }
    if (urls.length > 0) {
      resourceInfo.push(`${urls.length} URL(s) added`);
      resources.push(...urls);
    }

    if (resourceInfo.length > 0) {
      alert(`Resources added: ${resourceInfo.join(', ')}`);
    }
  };

  const handleSubmitIdea = async (idea: string) => {
    setIsAnalyzing(true);

    try {
      const response = await fetch('http://localhost:3001/api/product_validator/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIdea: idea,
          context: undefined,
          resourcesJSON: undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setValidationData(data);

      // Transform API data to match our interfaces
      if (data.discussions) {
        const transformedDiscussions: Discussion[] = data.discussions.map((discussion: any) => ({
          platform: discussion.platform,
          title: discussion.title,
          url: discussion.url,
          engagement: `${discussion.relevance}% relevance`,
          relevance: discussion.relevance,
          profileUrl: discussion.url,
          profileName: discussion.author
        }));
        setDiscussions(transformedDiscussions);
      }

      // Generate ICPs from insights - always generate 3 ICPs
      let generatedIcps: ICP[] = [];
      if (data.insights) {
        const basePainPoints = data.insights.commonPainPoints || ["Time constraints", "Lack of systematic approach"];
        const baseChannels = data.insights.bestChannels || ["LinkedIn", "Reddit", "Twitter"];
        const marketDemand = data.insights.marketDemand || "Identified target market based on analysis";

        generatedIcps = [
          {
            title: "Primary Target Market",
            description: marketDemand,
            painPoints: basePainPoints,
            channels: baseChannels
          },
          {
            title: "Secondary Market Segment",
            description: `Alternative ${marketDemand.toLowerCase()} with different needs`,
            painPoints: [...basePainPoints, "Budget constraints", "Integration challenges"],
            channels: [...baseChannels, "Email", "Direct outreach"]
          },
          {
            title: "Emerging Market Opportunity",
            description: `New ${marketDemand.toLowerCase()} showing early adoption patterns`,
            painPoints: [...basePainPoints, "Early adopter challenges", "Limited resources"],
            channels: [...baseChannels, "Product Hunt", "Beta testing communities"]
          }
        ];
        setIcps(generatedIcps);
      }

      // Generate hypothesis from insights
      if (data.insights) {
        const hypothesis = `${data.insights.marketDemand || 'Target market'} struggles with ${data.insights.commonPainPoints?.join(', ') || 'validation challenges'}. They need an AI-powered tool that can quickly analyze ideas, identify target markets, and generate validation content.`;
        setCurrentHypothesis(hypothesis);
      }

      // Generate inbound content from insights
      if (data.insights) {
        try {
          const inboundResponse = await fetch('http://localhost:3001/api/product_validator/inbound-content', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productIdea: idea,
              insightsJSON: JSON.stringify(data.insights),
              icpsJSON: JSON.stringify(generatedIcps)
            }),
          });

          if (inboundResponse.ok) {
            const inboundData = await inboundResponse.json();
            if (inboundData.inboundContent) {
              setInboundContent(inboundData.inboundContent);
            }
          } else {
            // Fallback to basic content if API fails
            const generatedInboundContent: InboundContent[] = [
              {
                type: "LinkedIn Post",
                platform: "LinkedIn",
                title: "The #1 mistake founders make when validating ideas",
                content: `Building something new? I'm curious - what's the biggest challenge you face when validating a new product idea?\n\nDrop a comment below 👇 I'm researching this space and would love to hear your thoughts.`,
                cta: "Comment your biggest validation challenge",
                targetAudience: "Founders and entrepreneurs",
                painPoint: "Product validation challenges",
                estimatedEngagement: "High"
              },
              {
                type: "X/Twitter Poll",
                platform: "Twitter",
                title: "Quick poll for founders",
                content: `Quick poll for founders 📊\n\nWhat do you wish existed to help validate your product ideas faster?\n\nA) AI-powered market research\nB) Instant customer feedback loops  \nC) Automated competitor analysis\nD) All of the above`,
                cta: "Vote and RT for reach",
                targetAudience: "Product managers and founders",
                painPoint: "Need for faster validation tools",
                estimatedEngagement: "Medium"
              }
            ];
            setInboundContent(generatedInboundContent);
          }
        } catch (error) {
          console.error('Error generating inbound content:', error);
          // Fallback content
          const generatedInboundContent: InboundContent[] = [
            {
              type: "LinkedIn Post",
              platform: "LinkedIn",
              title: "The #1 mistake founders make when validating ideas",
              content: `Building something new? I'm curious - what's the biggest challenge you face when validating a new product idea?\n\nDrop a comment below 👇 I'm researching this space and would love to hear your thoughts.`,
              cta: "Comment your biggest validation challenge",
              targetAudience: "Founders and entrepreneurs",
              painPoint: "Product validation challenges",
              estimatedEngagement: "High"
            }
          ];
          setInboundContent(generatedInboundContent);
        }
      }

      // Generate outreach messages
      if (data.people && data.people.length > 0) {
        const generatedOutreachMessages: OutreachMessage[] = data.people.map((person: any) => ({
          type: "Personalized DM",
          platform: person.platform,
          message: `Hi there! I noticed your post about ${person.problem} and thought our AI-powered validation tool might be exactly what you're looking for. Would love to show you a quick demo if you're interested!`,
          personalization: ["{firstName}", "{specificProblem}", "{platform}"]
        }));
        setOutreachMessages(generatedOutreachMessages);
      }

      addMessage('ai',
        'Excellent! I\'ve analyzed your product idea and resources. Based on my analysis, I\'ve identified potential ICPs, found relevant market discussions, and generated validation content.\n\nI recommend starting with the primary target market - they show the highest engagement and clearest pain points around product validation.\n\nCheck out the dashboard to see detailed insights and start your validation journey!'
      );


      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error calling validation API:', error);
      alert('Sorry, there was an error analyzing your idea. Please try again or check if the server is running.');
    } finally {
      setIsAnalyzing(false);
    }
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
    setIsAnalyzing(true);

    setTimeout(() => {
      addMessage('ai',
        'Thanks for the feedback! Based on your learnings, I\'ve updated the hypothesis and generated new validation strategies. The insights seem promising - I\'ve identified new discussions and created targeted content for that segment.\n\nCheck the updated dashboard for fresh insights!'
      );
      alert('Thanks for the feedback! Based on your learnings, I\'ve updated the hypothesis and generated new validation strategies. The insights seem promising - I\'ve identified new discussions and created targeted content for that segment.\n\nCheck the updated dashboard for fresh insights!');
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
      validationContent: inboundContent,
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

  const handleGetStarted = () => {
    setShowLandingPage(false);
  };

  if (showLandingPage) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  const handleEnrichProspects = async (selectedProspects: Prospect[]) => {
    if (selectedProspects.length === 0) {
      alert('Please select at least one prospect to enrich');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/product_validator/enrich-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prospects: selectedProspects,
          webhookUrl: undefined // Optional: could be set up for production
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.prospects) {
        // Update prospects with enriched data
        setProspects(prevProspects =>
          prevProspects.map(prospect => {
            const enrichedProspect = data.prospects.find((p: any) => p.id === prospect.id);
            return enrichedProspect ? { ...prospect, enriched: enrichedProspect.enriched } : prospect;
          })
        );
        alert(`Successfully enriched ${data.prospects.length} prospects!`);
      } else {
        alert(`Enrichment request submitted! ID: ${data.enrichment_id}`);
      }
    } catch (error) {
      console.error('Error enriching prospects:', error);
      alert('Error enriching prospects. Please try again.');
    }
  };

  if (currentView === 'sales') {
    return (
      <SalesMode
        onBack={handleBackToAnalysis}
        prospects={prospects}
        salesContent={salesContent}
        onEnrichProspects={handleEnrichProspects}
      />
    );
  }

  if (currentView === 'input') {
    return (
      <ProductInput
        onResourceUpload={handleResourceUpload}
        onSubmitIdea={handleSubmitIdea}
        isAnalyzing={isAnalyzing}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <div className="border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center space-x-6">
          <button
            onClick={() => setCurrentView('input')}
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            New Analysis
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors bg-black text-white"
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
        isGenerating={isGeneratingAnalysis}
        analysisProgress={analysisProgress}
        onIterate={handleIterate}
        onGoToSales={handleGoToSales}
        onExport={handleExport}
      />

      {isAnalyzing && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-black"></div>
            <span className="text-sm text-gray-600">AI is analyzing...</span>
          </div>
        </div>
      )}

      {isGeneratingAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Génération de l'Analyse Marché</h3>
              <p className="text-sm text-gray-600">{analysisProgress.step}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Progrès</span>
                <span>{analysisProgress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-black h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${analysisProgress.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Completed Steps */}
            <div className="space-y-2">
              {['Variations du problème', 'Recherche de discussions', 'Insights utilisateurs', 'Contenu de validation'].map((step, index) => (
                <div key={step} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    analysisProgress.completed.includes(step)
                      ? 'bg-green-500 text-white'
                      : analysisProgress.step.toLowerCase().includes(step.toLowerCase())
                        ? 'bg-black text-white animate-pulse'
                        : 'bg-gray-200'
                  }`}>
                    {analysisProgress.completed.includes(step) && (
                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${
                    analysisProgress.completed.includes(step)
                      ? 'text-green-600 font-medium'
                      : 'text-gray-600'
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
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
