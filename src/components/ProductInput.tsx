import React, { useState, useRef } from 'react';
import { Send, Upload } from 'lucide-react';

interface ProductInputProps {
  onResourceUpload: (files: FileList | null, urls: string[]) => void;
  onSubmitIdea: (idea: string) => void;
  isAnalyzing?: boolean;
}

export default function ProductInput({ onResourceUpload, onSubmitIdea, isAnalyzing = false }: ProductInputProps) {
  const [message, setMessage] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isAnalyzing) {
      onSubmitIdea(message.trim());
      // No borrar el mensaje - mantenerlo visible
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const urls = urlInput.split('\n').filter(url => url.trim());
    onResourceUpload(files, urls);
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResourceSubmit = () => {
    const urls = urlInput.split('\n').filter(url => url.trim());
    if (urls.length > 0) {
      onResourceUpload(null, urls);
      setUrlInput('');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center p-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI Product Validator & Sales Launcher
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Describe your product idea and upload resources. Get instant market insights, ICP identification, and validation content.
          </p>
        </div>

        {/* Main Input Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your product idea, business concept, or target market..."
              className={`w-full p-6 pr-16 border-2 rounded-2xl resize-none focus:ring-2 focus:ring-black focus:border-black text-lg ${
                isAnalyzing
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200'
              }`}
              rows={4}
              disabled={isAnalyzing}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!message.trim() || isAnalyzing}
              className="absolute bottom-4 right-4 p-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <Send size={20} />
              )}
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

        {isAnalyzing && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-blue-800 font-medium">AI is analyzing your idea...</span>
            </div>
            <p className="text-blue-600 text-sm text-center mt-2">
              This may take a few seconds
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-4 text-center">
          Press Cmd/Ctrl + Enter to analyze your idea
        </p>
      </div>
    </div>
  );
}
