import React, { useState, useRef } from 'react';
import { Send, Paperclip, Upload } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatProps {
  onResourceUpload: (files: FileList | null, urls: string[]) => void;
  onSubmitIdea: (idea: string) => void;
  messages: Message[];
}

export default function Chat({ onResourceUpload, onSubmitIdea, messages }: ChatProps) {
  const [message, setMessage] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showResourcePanel, setShowResourcePanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmitIdea(message.trim());
      setMessage('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const urls = urlInput.split('\n').filter(url => url.trim());
    onResourceUpload(files, urls);
    setUrlInput('');
    setShowResourcePanel(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResourceSubmit = () => {
    const urls = urlInput.split('\n').filter(url => url.trim());
    if (urls.length > 0) {
      onResourceUpload(null, urls);
      setUrlInput('');
      setShowResourcePanel(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              AI Product Validator & Sales Launcher
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Describe your product idea or paste your resources. I'll help you validate your ICP, 
              find relevant discussions, and create content to test your hypotheses.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl p-4 rounded-xl ${
                  msg.type === 'user'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <span className="text-xs opacity-60 mt-2 block">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resource Panel */}
      {showResourcePanel && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Add Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Upload Files
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-black file:text-white hover:file:bg-gray-800"
                  accept=".txt,.doc,.docx,.pdf,.md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  URLs (one per line)
                </label>
                <textarea
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://landing-page.com&#10;https://docs.google.com/..."
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowResourcePanel(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleResourceSubmit}
                className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800"
              >
                Add Resources
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          {messages.length > 0 ? (
            <form onSubmit={handleSubmit} className="flex items-end space-x-3">
              <button
                type="button"
                onClick={() => setShowResourcePanel(!showResourcePanel)}
                className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
              >
                <Paperclip size={20} />
              </button>
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your product idea or ask a question..."
                  className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-black focus:border-black"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSubmit(e);
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!message.trim()}
                className="p-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <Send size={20} />
              </button>
            </form>
          ) : (
            <>
              {/* Initial Search Bar */}
              <form onSubmit={handleSubmit} className="mb-6">
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your product idea, business concept, or target market..."
                    className="w-full p-6 pr-16 border-2 border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-black focus:border-black text-lg"
                    rows={4}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleSubmit(e);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="absolute bottom-4 right-4 p-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
              
              {/* Resource Upload Section */}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 bg-gray-50">
                <div className="text-center mb-6">
                  <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Add Resources (Optional)</h3>
                  <p className="text-gray-600 text-sm">
                    Upload files or add URLs to help the AI better understand your product
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Upload Files
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-black file:text-white hover:file:bg-gray-800 file:cursor-pointer"
                      accept=".txt,.doc,.docx,.pdf,.md"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Supports: TXT, DOC, PDF, MD files
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Add URLs
                    </label>
                    <textarea
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://your-landing-page.com&#10;https://docs.google.com/..."
                      className="w-full p-3 border border-gray-300 rounded-xl text-sm resize-none focus:ring-2 focus:ring-black focus:border-black"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      One URL per line
                    </p>
                  </div>
                </div>
                
                {(urlInput.trim() || fileInputRef.current?.files?.length) && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleResourceSubmit}
                      className="px-6 py-3 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      Add Resources
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                Press Cmd/Ctrl + Enter to analyze your idea
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}