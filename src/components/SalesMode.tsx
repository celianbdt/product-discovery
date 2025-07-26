import React, { useState } from 'react';
import { ArrowLeft, Mail, MessageCircle, Phone, Users, Download, Copy, Check } from 'lucide-react';

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

interface SalesModeProps {
  onBack: () => void;
  prospects: Prospect[];
  salesContent: SalesContent[];
  onEnrichProspects: (selectedProspects: Prospect[]) => Promise<void>;
}

export default function SalesMode({ onBack, prospects, salesContent, onEnrichProspects }: SalesModeProps) {
  const [copiedContent, setCopiedContent] = useState<string | null>(null);
  const [selectedProspects, setSelectedProspects] = useState<string[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedContent(id);
    setTimeout(() => setCopiedContent(null), 2000);
  };

  const toggleProspectSelection = (email: string) => {
    setSelectedProspects(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const exportProspects = () => {
    const selectedData = prospects.filter(p => selectedProspects.includes(p.email));
    const csvContent = [
      ['Name', 'Title', 'Company', 'Email', 'LinkedIn', 'Source', 'Relevance Score'],
      ...selectedData.map(p => [p.name, p.title, p.company, p.email, p.linkedin, p.source, p.relevanceScore.toString()])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prospects.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEnrichSelected = async () => {
    if (selectedProspects.length === 0) {
      alert('Please select at least one prospect to enrich');
      return;
    }

    setIsEnriching(true);
    try {
      const selectedProspectsData = prospects.filter(p => selectedProspects.includes(p.email));
      await onEnrichProspects(selectedProspectsData);
    } catch (error) {
      console.error('Error enriching prospects:', error);
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <span>Back to Analysis</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold text-gray-900">Sales Mode</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleEnrichSelected}
              disabled={selectedProspects.length === 0 || isEnriching}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEnriching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Users size={16} />
              )}
              <span>{isEnriching ? 'Enriching...' : `Enrich Selected (${selectedProspects.length})`}</span>
            </button>
            <button
              onClick={exportProspects}
              disabled={selectedProspects.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              <span>Export Selected ({selectedProspects.length})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Content */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <MessageCircle size={20} className="text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Sales Scripts & Content</h2>
            </div>

            {salesContent.map((content, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {content.type === 'linkedin' && <MessageCircle size={16} className="text-blue-600" />}
                    {content.type === 'email' && <Mail size={16} className="text-green-600" />}
                    {content.type === 'phone' && <Phone size={16} className="text-purple-600" />}
                    <h3 className="font-semibold text-gray-900">{content.title}</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(content.content, `content-${index}`)}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  >
                    {copiedContent === `content-${index}` ? (
                      <>
                        <Check size={14} className="text-green-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {content.subject && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Subject:</p>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{content.subject}</p>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{content.content}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Personalization Variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {content.personalization.map((variable, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Prospects */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Users size={20} className="text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Enriched Prospects ({prospects.length})
                </h2>
              </div>
              <button
                onClick={() => {
                  if (selectedProspects.length === prospects.length) {
                    setSelectedProspects([]);
                  } else {
                    setSelectedProspects(prospects.map(p => p.email));
                  }
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {selectedProspects.length === prospects.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-3">
              {prospects.map((prospect, index) => (
                <div
                  key={index}
                  className={`border rounded-xl p-4 cursor-pointer transition-colors ${
                    selectedProspects.includes(prospect.email)
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleProspectSelection(prospect.email)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{prospect.name}</h3>
                      <p className="text-sm text-gray-600">{prospect.title}</p>
                      <p className="text-sm text-gray-500">{prospect.company}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        prospect.relevanceScore >= 8 ? 'bg-green-500' :
                        prospect.relevanceScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-xs text-gray-500">{prospect.relevanceScore}/10</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Source: {prospect.source}</span>
                    <div className="flex space-x-2">
                      {prospect.enriched?.email && (
                        <span className="text-green-600 font-medium">✓ Enriched</span>
                      )}
                      <a
                        href={`mailto:${prospect.enriched?.email || prospect.email}`}
                        className="text-blue-600 hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Email
                      </a>
                      <a
                        href={prospect.enriched?.linkedin_url || prospect.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        LinkedIn
                      </a>
                    </div>
                  </div>
                  
                  {prospect.enriched && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        {prospect.enriched.phone && (
                          <div>
                            <span className="font-medium text-green-700">Phone:</span>
                            <span className="text-green-600 ml-1">{prospect.enriched.phone}</span>
                          </div>
                        )}
                        {prospect.enriched.company_website && (
                          <div>
                            <span className="font-medium text-green-700">Website:</span>
                            <a 
                              href={prospect.enriched.company_website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-green-600 ml-1 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Visit
                            </a>
                          </div>
                        )}
                        {prospect.enriched.confidence_score && (
                          <div className="col-span-2">
                            <span className="font-medium text-green-700">Confidence:</span>
                            <span className="text-green-600 ml-1">{prospect.enriched.confidence_score}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}