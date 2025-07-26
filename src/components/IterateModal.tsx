import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface IterateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (learnings: string) => void;
}

export default function IterateModal({ isOpen, onClose, onSubmit }: IterateModalProps) {
  const [learnings, setLearnings] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (learnings.trim()) {
      onSubmit(learnings.trim());
      setLearnings('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            What did you learn from this iteration?
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Share your findings, feedback, and insights from testing this hypothesis:
            </label>
            <textarea
              value={learnings}
              onChange={(e) => setLearnings(e.target.value)}
              placeholder="Example: 'The LinkedIn post got 50 likes but no real engagement. People seem interested but the CTA wasn't clear enough. I noticed most engaged users were from fintech, not general business..'"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black resize-none"
              rows={6}
              required
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">What will happen next:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• I'll analyze your learnings and update the hypothesis</li>
              <li>• Generate new ICP insights based on your feedback</li>
              <li>• Provide fresh content and validation strategies</li>
              <li>• Suggest new discussions and channels to explore</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!learnings.trim()}
              className="flex items-center space-x-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue Iteration</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}