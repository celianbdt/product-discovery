import React from 'react';
import { Target, MessageSquare, TrendingUp, Download, RotateCcw, DollarSign } from 'lucide-react';

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

        {/* ICPs Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Target size={20} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Identified ICPs</h3>
          </div>
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
        </div>

        {/* Main Content Grid - Outreach & Inbound */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Outreach Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <MessageSquare size={20} className="text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Outreach Strategy</h3>
            </div>
            
            {/* Relevant Discussions */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Relevant Discussions & Profiles</h4>
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

            {/* Outreach Messages */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Outreach Messages</h4>
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
                  <button className="w-full py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800">
                    Copy Message
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Inbound Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp size={20} className="text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Inbound Content</h3>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Social Media & Newsletter Content</h4>
              {inboundContent.map((content, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-1 bg-gray-100 text-xs font-medium rounded">
                      {content.type}
                    </span>
                    <span className="text-xs font-medium text-gray-600">
                      {content.platform}
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-gray-800 mb-2 whitespace-pre-wrap">{content.content}</p>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs font-medium text-gray-700">CTA:</p>
                      <p className="text-xs text-gray-600">{content.cta}</p>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800">
                    Copy Content
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}