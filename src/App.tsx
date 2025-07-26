import React, { useState } from 'react';
import { analyzeUserInput, generateMarketAnalysis, ConversationContext } from './services/anthropic';
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
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    stage: 'initial',
    messageCount: 0
  });

  // Mock data for demonstration
  const [icps, setIcps] = useState<ICP[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [inboundContent, setInboundContent] = useState<InboundContent[]>([]);
  const [outreachMessages, setOutreachMessages] = useState<OutreachMessage[]>([]);
  const [currentHypothesis, setCurrentHypothesis] = useState('');
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({
    step: '',
    progress: 0,
    completed: [] as string[]
  });


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

  const handleResourceUpload = (files: FileList | null, urls: string[]) => {
    // Reset conversation context when new resources are uploaded
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
      setConversationContext(prev => ({
        ...prev,
        resources: [...(prev.resources || []), ...resources]
      }));
      addMessage('user', `Resources added: ${resourceInfo.join(', ')}`);
      addMessage('ai', 'Ressources reçues ! Je vais les analyser avec votre idée de produit. Veuillez décrire votre concept de produit ou votre idée d\'entreprise.');
    }
  };

  // Reset conversation context when starting a new conversation
  const handleNewConversation = () => {
    setConversationContext({
      stage: 'initial',
      messageCount: 0
    });
    setMessages([]);
    setCurrentView('chat');
  };

  const handleSubmitIdea = async (idea: string) => {
    // If this is the first message and we have existing context, reset it
    if (conversationContext.messageCount === 0 && messages.length === 0) {
      setConversationContext({
        stage: 'initial',
        messageCount: 0
      });
    }
    
    addMessage('user', idea);
    setIsAnalyzing(true);
    
    try {
      const hasResources = !!(conversationContext.resources && conversationContext.resources.length > 0);
      const result = await analyzeUserInput(idea, conversationContext, hasResources);
      
      setConversationContext(result.updatedContext);
      addMessage('ai', result.response);
      
      if (result.shouldProceedToAnalysis) {
        // Reset analysis data before generating new one
        setIcps([]);
        setDiscussions([]);
        setInboundContent([]);
        setOutreachMessages([]);
        setCurrentHypothesis('');
        
        addMessage('ai', 'Parfait ! J\'ai assez d\'informations. Laissez-moi analyser votre marché et générer des stratégies de validation...');
        setIsGeneratingAnalysis(true);
        setAnalysisProgress({ step: 'Démarrage de l\'analyse...', progress: 10, completed: [] });
        
        setTimeout(async () => {
          try {
            // Step 1: Generate problem variations
            setAnalysisProgress({ step: 'Génération des variations du problème...', progress: 20, completed: [] });
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Step 2: Search discussions
            setAnalysisProgress({ step: 'Recherche de discussions pertinentes...', progress: 40, completed: ['Variations du problème'] });
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Step 3: Analyze insights
            setAnalysisProgress({ step: 'Analyse des insights utilisateurs...', progress: 60, completed: ['Variations du problème', 'Recherche de discussions'] });
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Step 4: Generate content
            setAnalysisProgress({ step: 'Création du contenu de validation...', progress: 80, completed: ['Variations du problème', 'Recherche de discussions', 'Insights utilisateurs'] });
            
            const analysis = await generateMarketAnalysis(result.updatedContext);
            
            setAnalysisProgress({ step: 'Finalisation de l\'analyse...', progress: 100, completed: ['Variations du problème', 'Recherche de discussions', 'Insights utilisateurs', 'Contenu de validation'] });
            
            setIcps(analysis.icps);
            setDiscussions(analysis.discussions);
            setInboundContent(analysis.inboundContent);
            setOutreachMessages(analysis.outreachMessages);
            setCurrentHypothesis(analysis.hypothesis);
            
            setIsGeneratingAnalysis(false);
            setCurrentView('dashboard');
          } catch (error) {
            console.error('Analysis generation failed:', error);
            addMessage('ai', 'J\'ai rencontré un problème lors de la génération de l\'analyse complète. Laissez-moi essayer une approche différente.');
            setIsGeneratingAnalysis(false);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error processing idea:', error);
      addMessage('ai', 'J\'ai des difficultés à traiter votre demande. Pourriez-vous reformuler votre idée ?');
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
                onClick={handleNewConversation}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'chat'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Nouveau Chat
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