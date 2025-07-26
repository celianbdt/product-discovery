import React, { useState } from 'react';
import { Target, MessageSquare, TrendingUp, Download, RotateCcw, DollarSign, Copy, Check } from 'lucide-react';

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

interface DashboardProps {
  icps: ICP[];
  discussions: Discussion[];
  inboundContent: InboundContent[];
  outreachMessages: OutreachMessage[];
  currentHypothesis: string;
  onIterate: () => void;
  onGoToSales: () => void;
  onExport: () => void;
}

type TabType = 'icps' | 'outreach' | 'inbound';

export default function Dashboard({ 
  icps, 
  discussions, 
  inboundContent,
  outreachMessages,
  currentHypothesis,
  onIterate,
  onGoToSales,
  onExport 
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('icps');
  const [copiedContent, setCopiedContent] = useState<string | null>(null);

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedContent(id);
    setTimeout(() => setCopiedContent(null), 2000);
  };

  const tabs = [
    { id: 'icps' as TabType, label: 'Identified ICPs', icon: Target, count: icps.length },
    { id: 'outreach' as TabType, label: 'Outreach Strategy', icon: MessageSquare, count: discussions.length + outreachMessages.length },
    { id: 'inbound' as TabType, label: 'Inbound Content', icon: TrendingUp, count: inboundContent.length }
  ];

  return (
    <div className="p-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Analysis Dashboard</h2>
            <p className="text-gray-600">Current hypothesis and validation insights</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onExport}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download size={16} />
              <span>Export Data</span>
            </button>
            <button
              onClick={onIterate}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              <RotateCcw size={16} />
              <span>Iterate</span>
            </button>
            <button
              onClick={onGoToSales}
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              <DollarSign size={16} />
              <span>Go to Sales</span>
            </button>
          </div>
        </div>

        {/* Current Hypothesis */}
        <div className="bg-gray-50 p-6 rounded-xl mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Hypothesis</h3>
          <p className="text-gray-700">{currentHypothesis}</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'icps' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <Target size={20} className="text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Identified ICPs</h3>
              </div>
              
              {icps.length === 0 ? (
                <div className="text-center py-12">
                  <Target size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No ICPs identified yet</h3>
                  <p className="text-gray-600">Run an analysis to identify your ideal customer profiles</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {icps.map((icp, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{icp.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{icp.description}</p>
                      
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">Pain Points:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {icp.painPoints.map((point, i) => (
                            <li key={i}>• {point}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Channels:</p>
                        <div className="flex flex-wrap gap-1">
                          {icp.channels.map((channel, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded">
                              {channel}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'outreach' && (
            <div className="space-y-8">
              <div className="flex items-center space-x-2 mb-6">
                <MessageSquare size={20} className="text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Outreach Strategy</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Relevant Discussions */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Relevant Discussions & Profiles</h4>
                  {discussions.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                      <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-600 text-sm">No discussions found yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {discussions.map((discussion, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <span className="px-2 py-1 bg-black text-white text-xs rounded">
                              {discussion.platform}
                            </span>
                            <div className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${
                                discussion.relevance >= 8 ? 'bg-green-500' :
                                discussion.relevance >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                              <span className="text-xs text-gray-500">{discussion.relevance}/10</span>
                            </div>
                          </div>
                          <h5 className="font-medium text-gray-900 mb-2 text-sm">{discussion.title}</h5>
                          <p className="text-xs text-gray-600 mb-3">{discussion.engagement}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">Profile:</span>
                              <a
                                href={discussion.profileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {discussion.profileName}
                              </a>
                            </div>
                            <a
                              href={discussion.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              View Discussion →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Outreach Messages */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Outreach Messages</h4>
                  {outreachMessages.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                      <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-600 text-sm">No outreach messages generated yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {outreachMessages.map((message, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-2 py-1 bg-gray-100 text-xs font-medium rounded">
                              {message.type}
                            </span>
                            <span className="text-xs font-medium text-gray-600">
                              {message.platform}
                            </span>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm text-gray-800 mb-2 whitespace-pre-wrap">{message.message}</p>
                          </div>
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700 mb-1">Personalization:</p>
                            <div className="flex flex-wrap gap-1">
                              {message.personalization.map((variable, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {variable}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(message.message, `outreach-${index}`)}
                            className="w-full py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 flex items-center justify-center space-x-2"
                          >
                            {copiedContent === `outreach-${index}` ? (
                              <>
                                <Check size={14} />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                <span>Copy Message</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inbound' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp size={20} className="text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Inbound Content</h3>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Social Media & Newsletter Content</h4>
                {inboundContent.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No inbound content generated yet</h3>
                    <p className="text-gray-600">Run an analysis to generate content for your target audience</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inboundContent.map((content, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-gray-100 text-xs font-medium rounded">
                              {content.type}
                            </span>
                            <span className="text-xs font-medium text-gray-600">
                              {content.platform}
                            </span>
                            {content.estimatedEngagement && (
                              <span className={`px-2 py-1 text-xs rounded ${
                                content.estimatedEngagement === 'High' ? 'bg-green-100 text-green-800' :
                                content.estimatedEngagement === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {content.estimatedEngagement} Engagement
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {content.title && (
                          <h4 className="font-medium text-gray-900 mb-2 text-sm">{content.title}</h4>
                        )}
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-800 mb-2 whitespace-pre-wrap">{content.content}</p>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-xs font-medium text-gray-700">CTA:</p>
                            <p className="text-xs text-gray-600">{content.cta}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-xs">
                          {content.targetAudience && (
                            <div>
                              <span className="font-medium text-gray-700">Target:</span>
                              <span className="text-gray-600 ml-1">{content.targetAudience}</span>
                            </div>
                          )}
                          {content.painPoint && (
                            <div>
                              <span className="font-medium text-gray-700">Pain Point:</span>
                              <span className="text-gray-600 ml-1">{content.painPoint}</span>
                            </div>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => copyToClipboard(content.content, `inbound-${index}`)}
                          className="w-full py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 flex items-center justify-center space-x-2"
                        >
                          {copiedContent === `inbound-${index}` ? (
                            <>
                              <Check size={14} />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy Content</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}